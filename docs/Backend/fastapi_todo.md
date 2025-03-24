# FastAPI_ToDo实战
## 8. 实战案例

### 创建一个简单的TODO应用

#### 步骤 1: 安装必要的库

首先，你需要安装FastAPI和SQLAlchemy。如果你打算使用异步特性，还需要安装`databases`和`aiosqlite`。

```bash
pip install fastapi sqlalchemy databases aiosqlite uvicorn
```

#### 步骤 2: 定义数据库模型

创建一个Python文件`models.py`来定义你的数据库模型。

```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True, nullable=True)
    completed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

#### 步骤 3: 初始化数据库

为了使用这个模型和SQLite数据库，我们需要初始化数据库引擎和会话工厂。下面是如何使用SQLAlchemy的`create_engine`和`sessionmaker`来完成这个工作。

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db"  # SQLite数据库文件路径

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建数据库表（如果它们还不存在）
Base.metadata.create_all(bind=engine)
```

#### 步骤 4: 创建数据库CRUD操作

在一个新文件`crud.py`中，定义操作数据库的函数。

```python
from sqlalchemy.orm import Session
from . import models

def get_todo(db: Session, todo_id: int):
    return db.query(models.Todo).filter(models.Todo.id == todo_id).first()

def get_todos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Todo).offset(skip).limit(limit).all()

def create_todo(db: Session, todo: models.TodoCreate):
    db_todo = models.Todo(**todo.dict())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo

def update_todo(db: Session, todo_id: int, todo: models.TodoUpdate):
    db_todo = get_todo(db, todo_id)
    if db_todo:
        update_data = todo.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_todo, key, value)
        db.commit()
        db.refresh(db_todo)
    return db_todo

def delete_todo(db: Session, todo_id: int):
    db_todo = get_todo(db, todo_id)
    if db_todo:
        db.delete(db_todo)
        db.commit()
    return db_todo
```

#### 步骤 5: 创建FastAPI应用

现在，创建主应用文件`main.py`。

```python
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, models
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/todos/", response_model=models.Todo)
def create_todo(todo: models.TodoCreate, db: Session = Depends(get_db)):
    return crud.create_todo(db=db, todo=todo)

@app.get("/todos/", response_model=list[models.Todo])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    todos = crud.get_todos(db, skip=skip, limit=limit)
    return todos

@app.get("/todos/{todo_id}", response_model=models.Todo)
def read_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = crud.get_todo(db, todo_id=todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo

@app.put("/todos/{todo_id}", response_model=models.Todo)
def update_todo(todo_id: int, todo: models.TodoUpdate, db: Session = Depends(get_db)):
    return crud.update_todo(db=db, todo_id=todo_id, todo=todo)

@app.delete("/todos/{todo_id}", response_model=models.Todo)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    crud.delete_todo(db, todo_id=todo_id)
    return {"detail": "Todo deleted"}
```

#### 步骤 6: 运行FastAPI应用

最后，使用`uvicorn`来运行你的应用。

```bash
uvicorn main:app --reload
```

现在，你的TODO应用应该已经运行起来了，并且支持创建、读取、更新和删除待办事项的操作。
