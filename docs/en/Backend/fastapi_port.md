---
title: FastAPI Entry(3)
description: FastAPI Query Parameters and Dependency Injection Detailed Explanation
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-20
tags: 
  - FastAPI
categories: Study Records

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# Detailed Explanation of FastAPI Query Parameters and Dependency Injection

## I. Basics of Query Parameters

### 1.1 Definition of Query Parameters
In FastAPI, when you declare function parameters that are not path parameters, they are automatically recognized as query parameters. Query parameters are commonly used for filtering, sorting, pagination, and other operations.
```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
async def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```
- **URL Example**:
```
http://127.0.0.1:8000/items/?skip=0&limit=10
```

### 1.2 Parsing of Query Strings
A query string is a collection of key - value pairs, located after the `?` in the URL. The key - value pairs are separated by the `&` symbol. For example, in the above URL, `skip` and `limit` are query parameters, corresponding to the values `0` and `10` respectively.

## II. Parameter Types and Validation

### 2.1 Type Declaration
FastAPI supports the declaration of various parameter types, including basic types, composite types, and enumeration types. It automatically performs type conversion and validation on parameters.
```python
from typing import Union
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/{item_id}")
async def read_item(
    item_id: str,
    q: Union[str, None] = None,
    short: bool = False
):
    item = {"item_id": item_id}
    if q:
        item.update({"q": q})
    if not short:
        item.update({"description": "This is an amazing item that has a long description"})
    return item
```
- **Supported Types**:
  - Basic Types: `int`, `str`, `float`, `bool`
  - Composite Types: `datetime`, `UUID`
  - Enumeration Types: `Enum`

### 2.2 Boolean Value Conversion
When you declare a query parameter of type `bool`, FastAPI automatically converts common strings representing boolean values to `True` or `False`.
```python
@app.get("/items/{item_id}")
async def read_item(short: bool = False):
    if short:
        return {"message": "Short version"}
    return {"message": "Full version"}
```
- **Examples of Valid Boolean Values**:
```
?short=1    # True
?short=True # True
?short=on   # True
```

## III. Parameter Default Values

### 3.1 Optional Parameters
You can declare a parameter as optional by setting a default value for it.
```python
@app.get("/items/")
async def read_items(q: str = None):
    if q:
        return {"items": ["item1", "item2"], "q": q}
    return {"items": ["item1", "item2"]}
```

### 3.2 Required Parameters
If you do not declare a default value, the query parameter is required.
```python
@app.get("/items/{item_id}")
async def read_user_item(item_id: str, needy: str):
    return {"item_id": item_id, "needy": needy}
```
- **Error Example**:
```json
{
    "detail": [
        {
            "loc": ["query", "needy"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

## IV. Complex Parameter Combinations

### 4.1 Example of Mixed Parameters
You can declare multiple path parameters and query parameters simultaneously. FastAPI automatically recognizes them based on their names, and the order of parameter declaration does not matter.
```python
from typing import Union
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}/items/{item_id}")
async def read_user_item(
    user_id: int,
    item_id: str,
    q: Union[str, None] = None,
    short: bool = False
):
    item = {
        "item_id": item_id,
        "owner_id": user_id
    }
    if q:
        item.update({"q": q})
    if not short:
        item.update({"description": "This is an amazing item that has a long description"})
    return item
```

## V. Usage Method of Dependency Injection (Depends)

### 5.1 Basics of Dependency Injection
Dependency injection is a powerful feature of FastAPI. It allows you to split your code into smaller and more reusable parts. You can declare dependencies through `Depends`, and these dependencies can be functions, classes, or other callable objects.
```python
from fastapi import FastAPI, Depends

app = FastAPI()

# Define a dependency function
async def common_parameters(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons
```
In the above example, `common_parameters` is a dependency function that receives two query parameters `skip` and `limit` and returns a dictionary containing these parameters. The `read_items` function injects this dependency through `Depends`, so it can directly use the returned dictionary.

### 5.2 Using Classes as Dependencies
In addition to functions, you can also use classes as dependencies.
```python
from fastapi import FastAPI, Depends

app = FastAPI()

class CommonQueryParams:
    def __init__(self, skip: int = 0, limit: int = 10):
        self.skip = skip
        self.limit = limit

@app.get("/items/")
async def read_items(commons: CommonQueryParams = Depends()):
    return {"skip": commons.skip, "limit": commons.limit}
```
Here, `CommonQueryParams` is a class. Its `__init__` method receives query parameters and assigns them to instance attributes. The `read_items` function injects an instance of this class through `Depends()`, so it can access these attributes.

### 5.3 Multi - level Dependencies
Dependencies can be nested to form multi - level dependency relationships.
```python
from fastapi import FastAPI, Depends

app = FastAPI()

# First - level dependency
async def sub_dependency(q: str = None):
    return q

# Second - level dependency, depending on sub_dependency
async def main_dependency(sub: str = Depends(sub_dependency)):
    return {"sub": sub}

@app.get("/items/")
async def read_items(dep: dict = Depends(main_dependency)):
    return dep
```
In this example, `main_dependency` depends on `sub_dependency`, and the `read_items` function depends on `main_dependency`, forming a multi - level dependency relationship.

### 5.4 Application Scenarios of Dependency Injection
- **Permission Verification**: You can create a dependency function to verify the user's identity and permissions, and then inject this dependency into the routes that require verification.
```python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# Simulate a permission verification function
def verify_token(token: str):
    if token != "valid_token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return True

@app.get("/protected/")
async def protected_route(token: str = Depends(verify_token)):
    return {"message": "This is a protected route"}
```
- **Database Connection**: You can create a dependency function to obtain a database connection, and then inject this dependency into the routes that need to operate on the database.

## VI. Parameter Priority

| Parameter Type | Priority | Typical Usage |
| ---- | ---- | ---- |
| Path Parameter | 1 | Uniquely identify resources |
| Query Parameter | 2 | Filtering/Sorting/Pagination |
| Request Body | 3 | Submit complex data |

## VII. Best Practices

### 7.1 Documentation Specification
You can use `Query` to add detailed description information to query parameters, and this information will be automatically displayed in the generated API documentation.
```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/", summary="Get a list of items")
async def read_items(
    skip: int = Query(0, description="Number of items to skip"),
    limit: int = Query(10, description="Number of items to return")
):
    return {"skip": skip, "limit": limit}
```

### 7.2 Performance Optimization
For routes involving asynchronous operations, you can use asynchronous functions and dependencies to improve performance.
```python
import asyncio
from fastapi import FastAPI, Depends

app = FastAPI()

async def async_dependency():
    await asyncio.sleep(0.1)  # Simulate an asynchronous operation
    return {"message": "Async operation done"}

@app.get("/async-items/")
async def read_async_items(dep: dict = Depends(async_dependency)):
    return dep
```

## VIII. Testing Methods

### 8.1 Swagger UI
Visit `http://127.0.0.1:8000/docs` for interactive testing. It can automatically generate API documentation, support parameter filling, and real - time response preview.

### 8.2 Command - line Tools
```bash
# GET request
curl "http://127.0.0.1:8000/items/?skip=20&limit=50"

# POST request
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "book", "price": 29.99}'
```

## IX. Common Issues

### 9.1 Handling of Parameters with the Same Name
You cannot use parameters with the same name in the same route, otherwise, it will cause conflicts.
```python
@app.get("/items/{item_id}")
async def read_item(item_id: str, item_id: int):  # Error! Conflict of parameters with the same name
    pass
```
- **Solution**: Use different parameter names.

### 9.2 Type Conversion Failure
If the type of the passed parameter does not match the declared type, FastAPI will return a `422 Unprocessable Entity` error.
```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):  # The path parameter must be an integer
    pass
```
- **Error Example**:
```
GET /items/abc → 422 Unprocessable Entity
```

## Summary and Comparison

| Parameter Feature | Path Parameter | Query Parameter | Dependency Injection (Depends) |
| ---- | ---- | ---- | ---- |
| Location | In the URL path | In the URL query string | In the parameters of a function or class |
| Necessity | Must be included | Optional (unless declared as required) | Optional or required (depending on the dependency definition) |
| Typical Usage | Uniquely identify resources | Filtering/Sorting/Pagination | Code reuse, permission verification, database connection, etc. |
| Type Declaration | Automatic verification and conversion | Automatic verification and conversion | Automatic verification and conversion |
| Documentation Generation | Automatically included | Automatically included | Automatically included |

By reasonably using path parameters, query parameters, and dependency injection, and combining FastAPI's type system, you can quickly build robust and maintainable RESTful APIs.