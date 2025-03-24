---
title: FastAPI Entry(4)
description: Handling request bodies in FastAPI.
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-21
tags:
  - FastAPI
categories: Study Records

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# Handling Request Bodies in FastAPI

## I. Basics of Request Bodies

### 1.1 Definition of Request Bodies
A request body is the data sent from the client to the API and is commonly used in operations such as `POST`, `PUT`, and `PATCH`. By using Pydantic models to declare request bodies, functions like data validation and type conversion can be achieved.

```python
from pydantic import BaseModel
from typing import Union

class Item(BaseModel):
    name: str
    description: Union[str, None] = None
    price: float
    tax: Union[float, None] = None
```

### 1.2 Data Validation Examples
When using Pydantic models, FastAPI automatically validates the request body data. For example, for the `Item` model above, the following are examples of valid and invalid data:

**Valid Data**:
```json
{
    "name": "Book",
    "price": 29.99
}
```
For valid data, FastAPI automatically converts it into the corresponding Python object and assigns it to the function parameter.

**Invalid Data**:
```json
{
    "name": "Book",
    "price": "not a number"
}
```
If the data is invalid, FastAPI returns a clear error response indicating the location and type of the error. For example:
```json
{
    "detail": [
        {
            "loc": ["body", "price"],
            "msg": "value is not a valid float",
            "type": "type_error.float"
        }
    ]
}
```

## II. Route Declaration

### 2.1 Simple POST Request
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return item
```

#### Testing with `curl`
You can use the `curl` command to test this POST request:
```bash
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Book", "price": 29.99}'
```
This command sends a POST request containing JSON data to `http://127.0.0.1:8000/items/`.

### 2.2 Example with Mixed Parameters
```python
@app.put("/items/{item_id}")
async def update_item(
    item_id: int,
    item: Item,
    q: Union[str, None] = None
):
    result = {"item_id": item_id, **item.dict()}
    if q:
        result.update({"q": q})
    return result
```

#### Testing with `curl`
```bash
curl -X PUT "http://127.0.0.1:8000/items/123?q=search" \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99}'
```
This `curl` command sends a PUT request to `http://127.0.0.1:8000/items/123`, including the path parameter `item_id`, the query parameter `q`, and the request body data.

## III. Parameter Priority Rules

| Parameter Type | Recognition Order | Example |
| --- | --- | --- |
| Path Parameter | 1 | `/items/123` |
| Query Parameter | 2 | `?q=search` |
| Request Body | 3 | JSON/Python dictionary |

FastAPI identifies function parameters in the above order and retrieves data from the corresponding locations.

## IV. Advanced Usage of Pydantic Models

### 4.1 Field Validation
You can use the `@validator` decorator to add custom validation logic to model fields.
```python
from pydantic import validator

class Item(BaseModel):
    name: str
    price: float

    @validator('price')
    def price_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Price must be positive')
        return v
```
If the incoming `price` is less than or equal to 0, FastAPI returns an error response.

### 4.2 Nested Models
Nested models can be used to handle more complex data structures.
```python
class Address(BaseModel):
    street: str
    city: str

class User(BaseModel):
    name: str
    address: Address
```

## V. Documentation and Testing

### 5.1 Swagger UI
FastAPI automatically generates API documentation. Through Swagger UI, you can perform the following operations:
- Fill in request body parameters.
- Preview responses in real-time.
- View error messages.

### 5.2 Command-Line Testing
In addition to the above `curl` examples, you can also use `curl` to test other scenarios.

#### Testing for Missing Required Fields
```bash
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"price": 29.99}'
```
Since `name` is a required field, this request returns an error response:
```json
{
    "detail": [
        {
            "loc": ["body", "name"],
            "msg": "field required",
            "type": "value_error.missing"
        }
    ]
}
```

## VI. Common Issues

### 6.1 Type Mismatch
As mentioned earlier, when the incoming data type does not match the model field type, a type error response is returned.

### 6.2 Missing Required Fields
When a required field is missing from the request body, an error response indicating the missing field is returned.

## VII. Best Practices

### 7.1 Data Model Specifications
- Use explicit type declarations to improve code readability and maintainability.
- Include default values to make fields optional.
- Add field validation logic to ensure data validity.

```python
from pydantic import Field

class Item(BaseModel):
    name: str
    price: float = Field(..., gt=0, description="The price must be a positive number")
    tax: float = 0.15
```

### 7.2 Performance Optimization
For routes involving asynchronous operations, asynchronous functions and dependencies can be used to improve performance.
```python
import asyncio

@app.post("/async-items/")
async def create_async_item(item: Item):
    await asyncio.sleep(0.1)  # Simulate an asynchronous operation
    return item
```

## Summary and Comparison

| Feature | Request Body | Query Parameter | Path Parameter |
| --- | --- | --- | --- |
| Data Location | Request body | URL query string | URL path |
| Requirement | Optional (unless declared as required) | Optional | Required |
| Data Type | Complex object | Simple key-value pair | Simple value |
| Best Practice | Use Pydantic models | Filtering/Pagination | Resource identification |

By reasonably using request bodies and Pydantic models, and combining FastAPI's automatic documentation and data validation functions, robust API interfaces can be efficiently built.