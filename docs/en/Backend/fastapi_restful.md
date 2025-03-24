---
title: FastAPI Entry(2)
description: FastAPI routing and path parameters are explained in detail to get started with the FastAPI framework.
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-18
tags: 
  - FastAPI
categories: Study Records

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI Routing & Path Parameters

## I. Routing Basics

### 1.1 HTTP Method Declaration
FastAPI declares routes and HTTP methods using decorators:
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
async def read_items():
    return {"items": ["item1", "item2"]}

@app.post("/items/")
async def create_item(item: dict):
    return {"item": item}
```

| Decorator  | HTTP Method | Typical Use Case       |
|------------|-------------|------------------------|
| `@app.get`  | GET         | Retrieve resources     |
| `@app.post` | POST        | Create resources       |
| `@app.put`  | PUT         | Update resources       |
| `@app.delete` | DELETE    | Delete resources       |


## II. Path Parameters Deep Dive

### 2.1 Basic Path Parameters
```python
@app.get("/items/{item_id}")
async def read_item(item_id: str):
    return {"item_id": item_id}
```

- **Example Request**:
  ```bash
  curl http://127.0.0.1:8000/items/123
  ```
  ```json
  {"item_id": "123"}
  ```


### 2.2 Type Declarations & Validation
```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):  # Automatic type conversion & validation
    return {"item_id": item_id}
```

- **Supported Types**:
  - Primitive: `int`, `str`, `float`, `bool`
  - Composite: `datetime`, `UUID`
  - Enumerations: `Enum`


### 2.3 Enum Parameters
```python
from enum import Enum

class ItemType(str, Enum):
    book = "book"
    movie = "movie"

@app.get("/items/{item_type}")
async def read_item(item_type: ItemType):
    return {"item_type": item_type.value}
```

- **Documentation Feature**: Auto-generated dropdown list of enum values


### 2.4 Route Ordering Rule
```python
@app.get("/users/me")  # Fixed path (higher priority)
async def read_user_me():
    return {"user": "current"}

@app.get("/users/{user_id}")  # Dynamic path
async def read_user(user_id: str):
    return {"user": user_id}
```


### 2.5 Path Parameter Matching Patterns
| Pattern       | Example Path               | Matching Rule                  |
|---------------|----------------------------|--------------------------------|
| `{param}`     | `/items/123`              | Matches any characters except `/` |
| `{param:path}` | `/files/home/file.txt`    | Matches full path including `/` |


## III. Query Parameters

### 3.1 Basic Query Parameters
```python
@app.get("/items/")
async def read_items(q: str = None):
    if q:
        return {"items": ["item1", "item2"], "q": q}
    return {"items": ["item1", "item2"]}
```

- **Example Request**:
  ```bash
  curl "http://127.0.0.1:8000/items/?q=search"
  ```
  ```json
  {"items":["item1","item2"],"q":"search"}
  ```


### 3.2 Query Parameter Validation
```python
@app.get("/items/")
async def read_items(q: str = Query(None, min_length=3)):
    return {"q": q}
```


## IV. Request Body Handling

### 4.1 Simple Request Body
```python
from fastapi import FastAPI
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return {"item": item.dict()}
```

- **Example Request**:
  ```bash
  curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "book", "price": 29.99}'
  ```


### 4.2 Combining Path & Body
```python
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"item_id": item_id, "item": item.dict()}
```


## V. Routing Testing

### 5.1 Swagger UI
Access `http://127.0.0.1:8000/docs` for interactive testing:
- Auto-generated documentation
- Request parameter filling support
- Real-time response preview


### 5.2 CLI Testing
```bash
# GET request
curl http://127.0.0.1:8000/items/123

# POST request
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "book", "price": 29.99}'
```


## VI. Best Practices

### 6.1 Parameter Precedence
1. Path parameters > Query parameters > Request body
2. Path parameters take precedence in case of name conflicts


### 6.2 Path Design Standards
- Use plural resource names: `/items/` instead of `/item/`
- Version APIs: `/api/v1/items/`
- Avoid excessive nesting: `/user/123/orders` over `/user/123/order/history`


### 6.3 Performance Optimization
```python
# Async route example
@app.get("/async-items/{item_id}")
async def read_async_item(item_id: int):
    # Simulate async operation
    await asyncio.sleep(0.1)
    return {"item_id": item_id}
```


## VII. Summary Comparison

| Parameter Type | Location       | Required | Typical Use Case       |
|----------------|----------------|----------|------------------------|
| Path Parameter | URL path       | Mandatory| Uniquely identify resources |
| Query Parameter| URL query      | Optional | Filter/sort/paginate   |
| Request Body   | Request payload| Optional | Submit complex data    |

Key FastAPI benefits through type declarations:
1. Automatic data validation & conversion
2. Editor support (code completion, error checking)
3. Auto-generated API documentation
4. Built-in error handling

**Recommendation**: Use Swagger UI for development debugging and `curl`/`httpie` for production testing.