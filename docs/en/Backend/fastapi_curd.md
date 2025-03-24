---
title: FastAPI Entry(6)
description: FastAPI Database and CRUD

author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-26
tags:
  - FastAPI
categories: Study Records

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# Database and CRUD

## Transactions

### What is a Transaction?
A transaction is a crucial mechanism in database operations that ensures data integrity and consistency. It is a series of operations that are executed as a single unit, either all succeeding or all failing. Transactions have the following four main characteristics (ACID):

1. **Atomicity**: All operations within a transaction either succeed entirely or fail entirely. If any operation within the transaction fails, the entire transaction will be rolled back to the state before the transaction began.
2. **Consistency**: A transaction must ensure that the database transitions from one consistent state to another. That is, the execution of a transaction cannot violate the database's integrity constraints.
3. **Isolation**: Concurrent transactions should not interfere with each other. Each transaction should be isolated from other transactions.
4. **Durability**: Once a transaction is committed, its changes to the database are permanent and will not be lost even if the system fails.

### Using Transactions in FastAPI
Using transactions in FastAPI typically involves database ORM (Object Relational Mapping) tools such as SQLAlchemy or Tortoise ORM. The following uses SQLAlchemy as an example to illustrate how to use transactions in a FastAPI application. Example code:

```python
from sqlalchemy.ext.asyncio import AsyncSession

async def create_user(db: AsyncSession, user: User):
    try:
        async with db.begin():  # Start a transaction
            db.add(user)
            await db.commit()
    except Exception as e:
        await db.rollback()  # Roll back the transaction
        raise HTTPException(status_code=500, detail=str(e))
```

## Connection Pools

### What is a Connection Pool?
A connection pool is a technology for creating and managing database connections, which reduces the overhead of establishing and destroying connections for each database request. In a connection pool, connections are created and stored. When interacting with the database, an existing connection can be retrieved from the pool. After use, the connection is not closed but returned to the pool for reuse later.

### Using Connection Pools in FastAPI
Using connection pools in FastAPI is usually combined with asynchronous ORMs (such as SQLAlchemy 1.4+ or Tortoise ORM). The following are the steps and an example of using a connection pool in FastAPI with SQLAlchemy 1.4 (or a later version).

## CRUD Operations

### Creating a CRUD Utility Class

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

### Using the CRUD Utility Class in a FastAPI Application

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

Complete code example:

```python
from fastapi import FastAPI, HTTPException, Form
from sqlalchemy.future import select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
import os

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
engine = create_async_engine(DATABASE_URL, future=True)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

# Hypothetical User model
class User(BaseModel):
    username: str
    email: str
    hashed_password: str

# Define the get_db function
async def get_db():
    async with async_session() as db:
        try:
            yield db
        finally:
            await db.close()

# Create a CRUD utility class
class CRUDUser:
    async def create_user(self, db: AsyncSession, username: str, email: str, hashed_password: str) -> User:
        """
        Create a new user and save it to the database
        :param db: Database session
        :param username: Username
        :param email: User email
        :param hashed_password: Hashed password
        :return: Created user object
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
        Retrieve user information from the database based on the username
        :param db: Database session
        :param username: Username
        :return: User object, or None if not found
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
        Update user information
        :param db: Database session
        :param user: User object
        :param kwargs: Fields and values to be updated
        :return: Updated user object
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
        Delete a user from the database based on the username
        :param db: Database session
        :param username: Username
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

# Initialize the FastAPI application
app = FastAPI()
crud_user = CRUDUser()

# Create a user using a request form
@app.post("/users/form/", response_model=User)
async def create_user_form(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    """
    Create a user using form data
    :param username: Username
    :param email: User email
    :param password: User password
    :return: Created user object
    """
    async with async_session() as db:
        db_user = await crud_user.get_user(db, username=username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        return await crud_user.create_user(db, username=username, email=email, hashed_password=password)

# Create a user using JSON data
@app.post("/users/", response_model=User)
async def create_user(username: str, email: str, password: str):
    """
    Create a user using JSON data
    :param username: Username
    :param email: User email
    :param password: User password
    :return: Created user object
    """
    async with async_session() as db:
        db_user = await crud_user.get_user(db, username=username)
        if db_user:
            raise HTTPException(status_code=400, detail="Username already registered")
        return await crud_user.create_user(db, username=username, email=email, hashed_password=password)

# Retrieve user information
@app.get("/users/{username}", response_model=User)
async def read_user(username: str):
    """
    Retrieve user information based on the username
    :param username: Username
    :return: User object
    """
    async with async_session() as db:
        db_user = await crud_user.get_user(db, username=username)
        if db_user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return db_user

# Transaction example
async def transaction_example():
    """
    Transaction operation example to ensure data consistency and integrity
    """
    async with async_session() as db:
        try:
            # Start a transaction
            async with db.begin():
                # Perform a series of database operations
                user1 = await crud_user.create_user(db, "user1", "user1@example.com", "password1")
                user2 = await crud_user.create_user(db, "user2", "user2@example.com", "password2")
                # If all operations succeed, the transaction is committed
                return user1, user2
        except Exception as e:
            # If any operation fails, the transaction is rolled back
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Transaction error: {str(e)}")
```