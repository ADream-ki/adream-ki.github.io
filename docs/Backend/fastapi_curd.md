---
title: FastAPI入门(6)
description: FastAPI数据库及CRUD操作。
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-26
tags:
  - FastAPI
categories: 学习记录

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---
# 数据库及 CRUD

## 事务

### 什么是事务

事务是数据库操作中确保数据完整性和一致性的重要机制。它是一系列的操作，这些操作作为一个整体被执行，要么完全成功，要么完全失败。事务具有以下四个主要特性（ACID）：

1. **原子性（Atomicity）**：事务中的所有操作要么全部成功，要么全部失败。如果事务中的某个操作失败了，整个事务将回滚到事务开始之前的状态。
2. **一致性（Consistency）**：事务必须保证数据库从一个一致的状态转换到另一个一致的状态，即事务的执行不能违反数据库的完整性约束。
3. **隔离性（Isolation）**：并发执行的事务之间不应互相干扰，每个事务应该与其他事务隔离。
4. **持久性（Durability）**：一旦事务提交，它对数据库的改变就是永久性的，即使系统发生故障也不会丢失。

### 在 FastAPI 中使用事务

在 FastAPI 中使用事务通常涉及数据库 ORM（对象关系映射）工具，如 SQLAlchemy 或 Tortoise ORM 等。以下将以 SQLAlchemy 为例，介绍如何在 FastAPI 应用中使用事务。示例代码：

```python
from sqlalchemy.ext.asyncio import AsyncSession

async def create_user(db: AsyncSession, user: User):
    try:
        async with db.begin():  # 开启事务
            db.add(user)
            await db.commit()
    except Exception as e:
        await db.rollback()  # 回滚事务
        raise HTTPException(status_code=500, detail=str(e))
```

## 连接池

### 什么是连接池

连接池是一种创建和管理数据库连接的技术，用于减少每次请求数据库时建立和销毁连接的开销。在连接池中，连接会被创建并存储起来，当需要与数据库交互时，可以从池中取出一个已经存在的连接。使用完成后，连接不会被关闭，而是返回到池中，以便之后重用。

### 在 FastAPI 中使用连接池

在 FastAPI 中使用连接池通常与异步 ORM（如 SQLAlchemy 1.4+或 Tortoise ORM）结合使用。以下是使用 SQLAlchemy 1.4（或更高版本）在 FastAPI 中使用连接池的步骤和示例。

## CRUD 操作

### 创建 CRUD 工具类

```python
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound

class CRUDUser:
    async def create_user(self, username: str, email: str, hashed_password: str) -> User:
        async with SessionLocal() as db:
            db_user = User(username=username, email=email, hashed_password=hashed_password)
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
            return db_user

    async def get_user(self, username: str) -> User:
        async with SessionLocal() as db:
            query = select(User).filter(User.username == username)
            result = await db.execute(query)
            try:
                return result.scalar_one()
            except NoResultFound:
                return None

    async def update_user(self, user: User, **kwargs) -> User:
        async with SessionLocal() as db:
            for key, value in kwargs.items():
                setattr(user, key, value)
            db.add(user)
            await db.commit()
            await db.refresh(user)
            return user

    async def delete_user(self, username: str):
        async with SessionLocal() as db:
            query = select(User).filter(User.username == username)
            result = await db.execute(query)
            try:
                user_to_delete = result.scalar_one()
                await db.delete(user_to_delete)
                await db.commit()
            except NoResultFound:
                pass
```

### 在 FastAPI 应用中使用 CRUD 工具类

```python
from fastapi import FastAPI, HTTPException
from .crud import CRUDUser
from .models import User

app = FastAPI()
crud_user = CRUDUser()

@app.post("/users/", response_model=User)
async def create_user(username: str, email: str, password: str):
    db_user = await crud_user.get_user(username=username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return await crud_user.create_user(username=username, email=email, hashed_password=password)

@app.get("/users/{username}", response_model=User)
async def read_user(username: str):
    db_user = await crud_user.get_user(username=username)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
```

完整代码示例：
```python
from fastapi import FastAPI, HTTPException, Form
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import os

# 数据库配置
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
engine = create_async_engine(DATABASE_URL, future=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# 假设的 User 模型
class User(BaseModel):
    username: str
    email: str
    hashed_password: str

# 定义 SessionLocal 函数
async def get_db():
    async with async_session() as db:
        try:
            yield db
        finally:
            await db.close()

# 创建 CRUD 工具类
class CRUDUser:
    async def create_user(self, db: AsyncSession, username: str, email: str, hashed_password: str) -> User:
        """
        创建新用户并保存到数据库
        :param db: 数据库会话
        :param username: 用户名
        :param email: 用户邮箱
        :param hashed_password: 加密后的密码
        :return: 创建的用户对象
        """
        from .models import User as DBUser
        db_user = DBUser(username=username, email=email, hashed_password=hashed_password)
        db.add(db_user)
        try:
            await db.commit()
            await db.refresh(db_user)
            return User(
                username=db_user.username,
                email=db_user.email,
                hashed_password=db_user.hashed_password
            )
        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    async def get_user(self, db: AsyncSession, username: str) -> User:
        """
        根据用户名从数据库中获取用户信息
        :param db: 数据库会话
        :param username: 用户名
        :return: 用户对象，如果未找到则返回 None
        """
        from .models import User as DBUser
        query = select(DBUser).filter(DBUser.username == username)
        result = await db.execute(query)
        try:
            db_user = result.scalar_one()
            return User(
                username=db_user.username,
                email=db_user.email,
                hashed_password=db_user.hashed_password
            )
        except NoResultFound:
            return None

    async def update_user(self, db: AsyncSession, user: User, **kwargs) -> User:
        """
        更新用户信息
        :param db: 数据库会话
        :param user: 用户对象
        :param kwargs: 要更新的字段及值
        :return: 更新后的用户对象
        """
        from .models import User as DBUser
        db_user = await self.get_user(db, user.username)
        if db_user:
            for key, value in kwargs.items():
                setattr(db_user, key, value)
            db.add(db_user)
            try:
                await db.commit()
                await db.refresh(db_user)
                return User(
                    username=db_user.username,
                    email=db_user.email,
                    hashed_password=db_user.hashed_password
                )
            except Exception as e:
                await db.rollback()
                raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
        return None

    async def delete_user(self, db: AsyncSession, username: str):
        """
        根据用户名从数据库中删除用户
        :param db: 数据库会话
        :param username: 用户名
        """
        from .models import User as DBUser
        query = select(DBUser).filter(DBUser.username == username)
        result = await db.execute(query)
        try:
            user_to_delete = result.scalar_one()
            await db.delete(user_to_delete)
            await db.commit()
        except NoResultFound:
            pass

# 初始化 FastAPI 应用
app = FastAPI()
crud_user = CRUDUser()

# 使用请求表单创建用户
@app.post("/users/form/", response_model=User)
async def create_user_form(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    """
    通过表单数据创建用户
    :param username: 用户名
    :param email: 用户邮箱
    :param password: 用户密码
    :return: 创建的用户对象
    """
    async with async_session() as db:
        db_user = await crud_user.get_user(db, username=username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        return await crud_user.create_user(db, username=username, email=email, hashed_password=password)

# 使用 JSON 数据创建用户
@app.post("/users/", response_model=User)
async def create_user(username: str, email: str, password: str):
    """
    通过 JSON 数据创建用户
    :param username: 用户名
    :param email: 用户邮箱
    :param password: 用户密码
    :return: 创建的用户对象
    """
    async with async_session() as db:
        db_user = await crud_user.get_user(db, username=username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        return await crud_user.create_user(db, username=username, email=email, hashed_password=password)

# 获取用户信息
@app.get("/users/{username}", response_model=User)
async def read_user(username: str):
    """
    根据用户名获取用户信息
    :param username: 用户名
    :return: 用户对象
    """
    async with async_session() as db:
        db_user = await crud_user.get_user(db, username=username)
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return db_user

# 事务示例
async def transaction_example():
    """
    事务操作示例，确保数据的一致性和完整性
    """
    async with async_session() as db:
        try:
            # 开启事务
            async with db.begin():
                # 执行一系列数据库操作
                user1 = await crud_user.create_user(db, "user1", "user1@example.com", "password1")
                user2 = await crud_user.create_user(db, "user2", "user2@example.com", "password2")
                # 如果所有操作都成功，事务提交
                return user1, user2
        except Exception as e:
            # 如果有操作失败，事务回滚
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Transaction error: {str(e)}")
```