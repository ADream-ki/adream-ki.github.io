---
title: FastAPI入门(4)
description: FastAPI处理请求体数据。
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-21
tags:
  - FastAPI
categories: 学习记录

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI 请求体处理

## 一、请求体基础

### 1.1 请求体定义
请求体是客户端发送给 API 的数据，常用于 `POST`、`PUT`、`PATCH` 等操作。使用 Pydantic 模型声明请求体，能实现数据校验、类型转换等功能。

```python
from pydantic import BaseModel
from typing import Union

class Item(BaseModel):
    name: str
    description: Union[str, None] = None
    price: float
    tax: Union[float, None] = None
```

### 1.2 数据校验示例
当使用 Pydantic 模型时，FastAPI 会自动对请求体数据进行校验。例如，对于上述的 `Item` 模型，以下是有效和无效数据的示例：

**有效数据**：
```json
{
    "name": "Book",
    "price": 29.99
}
```
对于有效数据，FastAPI 会自动将其转换为相应的 Python 对象，并赋值给函数参数。

**无效数据**：
```json
{
    "name": "Book",
    "price": "not a number"
}
```
若数据无效，FastAPI 会返回清晰的错误响应，指出错误的位置和类型。例如：
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

## 二、路由声明

### 2.1 简单 POST 请求
```python
from fastapi import FastAPI

app = FastAPI()

@app.post("/items/")
async def create_item(item: Item):
    return item
```

#### 使用 curl 测试
可以使用 `curl` 命令来测试这个 POST 请求：
```bash
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "Book", "price": 29.99}'
```
此命令会向 `http://127.0.0.1:8000/items/` 发送一个包含 JSON 数据的 POST 请求。

### 2.2 混合参数示例
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

#### 使用 curl 测试
```bash
curl -X PUT "http://127.0.0.1:8000/items/123?q=search" \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "price": 999.99}'
```
这个 `curl` 命令向 `http://127.0.0.1:8000/items/123` 发送一个 PUT 请求，包含路径参数 `item_id`、查询参数 `q` 和请求体数据。

## 三、参数优先级规则

| 参数类型   | 识别顺序 | 示例                     |
|------------|----------|--------------------------|
| 路径参数   | 1        | `/items/123`             |
| 查询参数   | 2        | `?q=search`              |
| 请求体     | 3        | JSON/Python 字典          |

FastAPI 会按照上述顺序识别函数参数，并从相应的位置获取数据。

## 四、Pydantic 模型高级用法

### 4.1 字段验证
可以使用 `@validator` 装饰器为模型字段添加自定义验证逻辑。
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
若传入的 `price` 小于等于 0，FastAPI 会返回错误响应。

### 4.2 嵌套模型
可以使用嵌套模型来处理更复杂的数据结构。
```python
class Address(BaseModel):
    street: str
    city: str

class User(BaseModel):
    name: str
    address: Address
```

## 五、文档与测试

### 5.1 Swagger UI
FastAPI 会自动生成 API 文档，通过 Swagger UI 可以进行以下操作：
- 填写请求体参数
- 实时预览响应
- 查看错误信息

### 5.2 命令行测试
除了上述的 `curl` 示例，还可以使用 `curl` 测试其他情况。

#### 测试缺失必需字段
```bash
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"price": 29.99}'
```
由于 `name` 是必需字段，这个请求会返回错误响应：
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

## 六、常见问题

### 6.1 类型不匹配
如前面提到的，当传入的数据类型与模型字段类型不匹配时，会返回类型错误响应。

### 6.2 缺失必需字段
当请求体中缺少必需字段时，会返回字段缺失的错误响应。

## 七、最佳实践

### 7.1 数据模型规范
- 使用显式类型声明，提高代码的可读性和可维护性。
- 包含默认值，使字段可选。
- 添加字段验证逻辑，确保数据的有效性。

```python
from pydantic import Field

class Item(BaseModel):
    name: str
    price: float = Field(..., gt=0, description="价格必须为正数")
    tax: float = 0.15
```

### 7.2 性能优化
对于涉及异步操作的路由，可以使用异步函数和依赖项来提高性能。
```python
import asyncio

@app.post("/async-items/")
async def create_async_item(item: Item):
    await asyncio.sleep(0.1)  # 模拟异步操作
    return item
```

## 总结对比

| 特性         | 请求体                     | 查询参数               | 路径参数         |
|--------------|----------------------------|------------------------|------------------|
| 数据位置     | 请求正文                   | URL 查询字符串          | URL 路径          |
| 必需性       | 可选（除非声明为必需）     | 可选                 | 必需             |
| 数据类型     | 复杂对象                   | 简单键值对            | 简单值           |
| 最佳实践     | 使用 Pydantic 模型           | 过滤/分页             | 资源标识         |

通过合理使用请求体和 Pydantic 模型，结合 FastAPI 的自动文档和数据校验功能，可以高效构建健壮的 API 接口。