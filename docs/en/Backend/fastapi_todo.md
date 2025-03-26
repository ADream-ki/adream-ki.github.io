---
title: FastAPI Todo Project
description: FastAPI Todo Project
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-28
tags: 
  - FastAPI
categories: Projects

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI Todo Project
## Practical Case  

### Create a Simple TODO Application  

#### Step 1: Install Required Libraries  
First, install FastAPI and SQLAlchemy. If you plan to use asynchronous features, also install `databases` and `aiosqlite`:  
```bash  
pip install fastapi sqlalchemy databases aiosqlite uvicorn  
```  

#### Step 2: Define Database Models  
Create a Python file `models.py` to define your database schema:  
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

#### Step 3: Initialize Database  
To use this model with SQLite, initialize the database engine and session factory:  
```python  
from sqlalchemy import create_engine  
from sqlalchemy.orm import sessionmaker  

SQLALCHEMY_DATABASE_URL = "sqlite:///./todos.db"  # SQLite database path  

engine = create_engine(  
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}  
)  

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)  

# Create tables if they don't exist  
Base.metadata.create_all(bind=engine)  
```  

#### Step 4: Implement Database CRUD Operations  
Define database functions in a new file `crud.py`:  
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

#### Step 5: Build the FastAPI Application  
Create the main application file `main.py`:  
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

#### Step 6: Run the FastAPI Application  
Start the application with `uvicorn`:  
```bash  
uvicorn main:app --reload  
```  

Your TODO application is now running, supporting full CRUD operations for managing tasks.