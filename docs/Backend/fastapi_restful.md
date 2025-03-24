---
title: FastAPI入门(2)
description: FastAPI路由与路径参数详解，快速上手FastAPI框架。
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-18
tags: 
  - FastAPI
categories: 学习记录

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI 路由与路径参数

## 一、路由基础

### 1.1 HTTP方法声明
FastAPI通过装饰器声明路由和HTTP方法：
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

| 装饰器   | HTTP方法 | 典型用途               |
|----------|----------|------------------------|
| `@app.get` | GET      | 查询资源               |
| `@app.post` | POST    | 创建资源               |
| `@app.put` | PUT      | 更新资源               |
| `@app.delete` | DELETE  | 删除资源               |


## 二、路径参数详解

### 2.1 基础路径参数
```python
@app.get("/items/{item_id}")
async def read_item(item_id: str):
    return {"item_id": item_id}
```

- **访问示例**：
  ```bash
  curl http://127.0.0.1:8000/items/123
  ```
  ```json
  {"item_id": "123"}
  ```


### 2.2 类型声明与校验
```python
@app.get("/items/{item_id}")
async def read_item(item_id: int):  # 自动类型转换与校验
    return {"item_id": item_id}
```

- **类型支持**：
  - 基本类型：`int`, `str`, `float`, `bool`
  - 复合类型：`datetime`, `UUID`
  - 枚举类型：`Enum`


### 2.3 枚举参数
```python
from enum import Enum

class ItemType(str, Enum):
    book = "book"
    movie = "movie"

@app.get("/items/{item_type}")
async def read_item(item_type: ItemType):
    return {"item_type": item_type.value}
```

- **文档特性**：自动生成下拉列表显示枚举值


### 2.4 路径顺序规则
```python
@app.get("/users/me")  # 固定路径（优先匹配）
async def read_user_me():
    return {"user": "current"}

@app.get("/users/{user_id}")  # 动态路径
async def read_user(user_id: str):
    return {"user": user_id}
```


### 2.5 路径参数匹配模式
| 模式       | 示例路径               | 匹配规则                     |
|------------|------------------------|------------------------------|
| `{param}`  | `/items/123`          | 匹配任意字符（除`/`）         |
| `{param:path}` | `/files/home/file.txt` | 匹配包含`/`的完整路径         |


## 三、查询参数

### 3.1 基本查询参数
```python
@app.get("/items/")
async def read_items(q: str = None):
    if q:
        return {"items": ["item1", "item2"], "q": q}
    return {"items": ["item1", "item2"]}
```

- **访问示例**：
  ```bash
  curl "http://127.0.0.1:8000/items/?q=search"
  ```
  ```json
  {"items":["item1","item2"],"q":"search"}
  ```


### 3.2 查询参数校验
```python
@app.get("/items/")
async def read_items(q: str = Query(None, min_length=3)):
    return {"q": q}
```


## 四、请求体处理

### 4.1 简单请求体
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

- **请求示例**：
  ```bash
  curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "book", "price": 29.99}'
  ```


### 4.2 路径参数与请求体结合
```python
@app.put("/items/{item_id}")
async def update_item(item_id: int, item: Item):
    return {"item_id": item_id, "item": item.dict()}
```


## 五、路由测试

### 5.1 Swagger UI
访问`http://127.0.0.1:8000/docs`可进行交互式测试：
- 自动生成文档
- 支持请求参数填写
- 实时响应预览


### 5.2 命令行测试
```bash
# GET请求
curl http://127.0.0.1:8000/items/123

# POST请求
curl -X POST "http://127.0.0.1:8000/items/" \
  -H "Content-Type: application/json" \
  -d '{"name": "book", "price": 29.99}'
```


## 六、最佳实践

### 6.1 参数优先级
1. 路径参数 > 查询参数 > 请求体
2. 同名参数路径参数优先


### 6.2 路径设计规范
- 使用复数形式命名资源：`/items/` 而非 `/item/`
- 版本化API：`/api/v1/items/`
- 避免层级过深：`/user/123/orders` 优于 `/user/123/order/history`


### 6.3 性能优化
```python
# 异步路由示例
@app.get("/async-items/{item_id}")
async def read_async_item(item_id: int):
    # 模拟异步操作
    await asyncio.sleep(0.1)
    return {"item_id": item_id}
```


## 总结对比

| 参数类型   | 位置       | 必需性   | 典型用途               |
|------------|------------|----------|------------------------|
| 路径参数   | URL路径中  | 必需     | 唯一标识资源           |
| 查询参数   | URL问号后  | 可选     | 过滤/排序/分页         |
| 请求体     | 请求正文中 | 可选     | 提交复杂数据           |

通过类型声明，FastAPI自动提供：
1. 数据校验与转换
2. 编辑器支持
3. 自动API文档
4. 错误处理机制

**建议**：使用Swagger UI进行开发调试，结合curl/httpie进行生产环境测试。