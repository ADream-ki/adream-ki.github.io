---
title: FastAPI入门(3)
description: FastAPI查询参数与依赖注入的使用方法。
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-20
tags:
  - FastAPI
categories: 学习记录

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI 查询参数与依赖注入详解

## 一、查询参数基础

### 1.1 查询参数定义

在 FastAPI 中，声明不属于路径参数的函数参数时，它们会被自动识别为查询参数。查询参数通常用于过滤、排序、分页等操作。

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/items/")
async def read_items(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}
```

- **URL 示例**：

```
http://127.0.0.1:8000/items/?skip=0&limit=10
```

### 1.2 查询字符串解析

查询字符串是键值对的集合，位于 URL 的 `?` 之后，键值对之间以 `&` 符号分隔。例如，在上述 URL 中，`skip` 和 `limit` 就是查询参数，分别对应值 `0` 和 `10`。

## 二、参数类型与校验

### 2.1 类型声明

FastAPI 支持多种类型的参数声明，包括基础类型、复合类型和枚举类型。它会自动对参数进行类型转换和校验。

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

- **类型支持**：
  - 基础类型：`int`, `str`, `float`, `bool`
  - 复合类型：`datetime`, `UUID`
  - 枚举类型：`Enum`

### 2.2 布尔值转换

当声明 `bool` 类型的查询参数时，FastAPI 会自动将常见的表示布尔值的字符串转换为 `True` 或 `False`。

```python
@app.get("/items/{item_id}")
async def read_item(short: bool = False):
    if short:
        return {"message": "Short version"}
    return {"message": "Full version"}
```

- **有效布尔值示例**：

```
?short=1    # True
?short=True # True
?short=on   # True
```

## 三、参数默认值

### 3.1 可选参数

可以通过为参数设置默认值来将其声明为可选参数。

```python
@app.get("/items/")
async def read_items(q: str = None):
    if q:
        return {"items": ["item1", "item2"], "q": q}
    return {"items": ["item1", "item2"]}
```

### 3.2 必需参数

若不声明默认值，则该查询参数为必需参数。

```python
@app.get("/items/{item_id}")
async def read_user_item(item_id: str, needy: str):
    return {"item_id": item_id, "needy": needy}
```

- **错误示例**：

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

## 四、复杂参数组合

### 4.1 混合参数示例

可以同时声明多个路径参数和查询参数，FastAPI 会根据名称自动识别它们，且参数声明顺序无关紧要。

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

## 五、依赖注入（Depends）的使用方法

### 5.1 依赖注入基础

依赖注入是 FastAPI 的一个强大特性，它允许你将代码拆分成更小、更易复用的部分。通过 `Depends` 可以声明依赖项，这些依赖项可以是函数、类或其他可调用对象。

```python
from fastapi import FastAPI, Depends

app = FastAPI()

# 定义一个依赖项函数
async def common_parameters(skip: int = 0, limit: int = 10):
    return {"skip": skip, "limit": limit}

@app.get("/items/")
async def read_items(commons: dict = Depends(common_parameters)):
    return commons
```

在上述示例中，`common_parameters` 是一个依赖项函数，它接收两个查询参数 `skip` 和 `limit`，并返回一个包含这些参数的字典。`read_items` 函数通过 `Depends` 注入了这个依赖项，从而可以直接使用返回的字典。

### 5.2 类作为依赖项

除了函数，还可以使用类作为依赖项。

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

这里，`CommonQueryParams` 是一个类，它的 `__init__` 方法接收查询参数并将其赋值给实例属性。`read_items` 函数通过 `Depends()` 注入了这个类的实例，从而可以访问这些属性。

### 5.3 多层依赖

依赖项可以嵌套使用，形成多层依赖关系。

```python
from fastapi import FastAPI, Depends

app = FastAPI()

# 第一层依赖
async def sub_dependency(q: str = None):
    return q

# 第二层依赖，依赖于 sub_dependency
async def main_dependency(sub: str = Depends(sub_dependency)):
    return {"sub": sub}

@app.get("/items/")
async def read_items(dep: dict = Depends(main_dependency)):
    return dep
```

在这个例子中，`main_dependency` 依赖于 `sub_dependency`，`read_items` 函数又依赖于 `main_dependency`，形成了多层依赖关系。

### 5.4 依赖注入的应用场景

- **权限验证**：可以创建一个依赖项函数用于验证用户的身份和权限，然后在需要验证的路由中注入该依赖项。

```python
from fastapi import FastAPI, Depends, HTTPException

app = FastAPI()

# 模拟权限验证函数
def verify_token(token: str):
    if token != "valid_token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return True

@app.get("/protected/")
async def protected_route(token: str = Depends(verify_token)):
    return {"message": "This is a protected route"}
```

- **数据库连接**：可以创建一个依赖项函数用于获取数据库连接，然后在需要操作数据库的路由中注入该依赖项。

## 六、参数优先级

| 参数类型 | 优先级 | 典型用途       |
| -------- | ------ | -------------- |
| 路径参数 | 1      | 唯一标识资源   |
| 查询参数 | 2      | 过滤/排序/分页 |
| 请求体   | 3      | 提交复杂数据   |

## 七、最佳实践

### 7.1 文档规范

可以使用 `Query` 为查询参数添加详细的描述信息，这些信息会自动显示在生成的 API 文档中。

```python
from fastapi import FastAPI, Query

app = FastAPI()

@app.get("/items/", summary="获取物品列表")
async def read_items(
    skip: int = Query(0, description="跳过的数量"),
    limit: int = Query(10, description="返回的数量")
):
    return {"skip": skip, "limit": limit}
```

### 7.2 性能优化

对于涉及异步操作的路由，可以使用异步函数和依赖项来提高性能。

```python
import asyncio
from fastapi import FastAPI, Depends

app = FastAPI()

async def async_dependency():
    await asyncio.sleep(0.1)  # 模拟异步操作
    return {"message": "Async operation done"}

@app.get("/async-items/")
async def read_async_items(dep: dict = Depends(async_dependency)):
    return dep
```

## 八、测试方法

### 8.1 Swagger UI

访问 `http://127.0.0.1:8000/docs` 进行交互式测试，它可以自动生成 API 文档，支持参数填写与实时响应预览。

### 8.2 命令行工具

```bash
# GET请求
curl "http://127.0.0.1:8000/items/?skip=20&limit=50"

# POST请求
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "book", "price": 29.99}'
```

## 九、常见问题

### 9.1 同名参数处理

不能在同一个路由中使用同名的参数，否则会导致冲突。

```python
@app.get("/items/{item_id}")
async def read_item(item_id: str, item_id: int):  # 错误！同名参数冲突
    pass
```

- **解决方案**：使用不同的参数名。

### 9.2 类型转换失败

如果传入的参数类型与声明的类型不匹配，FastAPI 会返回 `422 Unprocessable Entity` 错误。

```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):  # 路径参数必须为整数
    pass
```

- **错误示例**：

```
GET /items/abc → 422 Unprocessable Entity
```

## 总结对比

| 参数特性 | 路径参数       | 查询参数               | 依赖注入（Depends）              |
| -------- | -------------- | ---------------------- | -------------------------------- |
| 位置     | URL 路径中     | URL 查询字符串中       | 函数或类的参数中                 |
| 必需性   | 必须包含       | 可选（除非声明为必需） | 可选或必需（根据依赖项定义）     |
| 典型用途 | 资源唯一标识   | 过滤/排序/分页         | 代码复用、权限验证、数据库连接等 |
| 类型声明 | 自动校验与转换 | 自动校验与转换         | 自动校验与转换                   |
| 文档生成 | 自动包含       | 自动包含               | 自动包含                         |

通过合理使用路径参数、查询参数和依赖注入，结合 FastAPI 的类型系统，可以快速构建健壮、可维护的 RESTful API。
