---
title: FastAPI入门(5)
description: FastAPI处理响应数据。
author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-23
tags:
  - FastAPI
categories: 学习记录

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI 响应处理

## 一、响应状态码声明
通过路由装饰器`status_code`参数声明HTTP状态码：
```python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}
```

### 状态码规范
| 分类    | 典型代码   | 说明                     | 响应体要求         |
|---------|------------|--------------------------|--------------------|
| 成功    | 200 OK     | 默认成功               | 必须包含           |
|         | 201 Created| 资源创建成功           | 可选               |
|         | 204 No Content | 无内容返回           | 禁止包含           |
| 重定向  | 307 Temporary Redirect | 临时重定向         | 可选               |
| 客户端错误 | 400 Bad Request | 错误请求           | 必须包含错误信息   |
|         | 404 Not Found | 资源不存在           | 必须包含错误信息   |

### 状态码快捷方式
使用预定义枚举值：
```python
from fastapi import status

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    pass  # 无响应体
```

## 二、响应类型详解

### 1. JSON响应
#### 自动序列化
```python
@app.get("/data")
def get_data():
    return {
        "user": {
            "id": 123,
            "name": "Alice"
        }
    }
```

#### 自定义响应
```python
from fastapi.responses import JSONResponse

@app.get("/custom-json")
def custom_json():
    return JSONResponse(
        content={"message": "Hello"},
        status_code=status.HTTP_200_OK,
        headers={"X-Custom-Header": "fastapi"}
    )
```

### 2. HTML响应
```python
from fastapi.responses import HTMLResponse

@app.get("/page", response_class=HTMLResponse)
async def show_page():
    return """
    <html>
        <head>
            <title>FastAPI Page</title>
        </head>
        <body>
            <h1>Welcome to FastAPI!</h1>
        </body>
    </html>
    """
```

### 3. 文件响应
```python
from fastapi.responses import FileResponse

@app.get("/download")
async def download_file():
    return FileResponse(
        path="document.pdf",
        filename="report.pdf",
        media_type="application/pdf"
    )
```

### 4. 流式响应
```python
from fastapi.responses import StreamingResponse
import asyncio

async def stream_data():
    for i in range(5):
        yield f"Chunk {i}\n".encode()
        await asyncio.sleep(1)

@app.get("/stream")
async def get_stream():
    return StreamingResponse(
        stream_data(),
        media_type="text/plain"
    )
```

### 5. 重定向响应
```python
from fastapi.responses import RedirectResponse

@app.get("/redirect")
async def redirect_to_docs():
    return RedirectResponse(
        url="https://fastapi.tiangolo.com",
        status_code=status.HTTP_302_FOUND
    )
```

## 三、响应头控制
```python
@app.get("/headers")
def get_headers():
    return JSONResponse(
        content={"message": "Header demo"},
        headers={
            "X-Rate-Limit": "5000/day",
            "Cache-Control": "max-age=3600"
        }
    )
```

## 四、响应媒体类型
| 响应类型       | 媒体类型               | 典型用途               |
|----------------|------------------------|------------------------|
| JSONResponse   | application/json       | API数据交互           |
| HTMLResponse   | text/html              | 页面渲染             |
| FileResponse   | image/jpeg             | 图片下载             |
| StreamingResponse | application/octet-stream | 大文件传输         |

## 五、高级响应模式
```python
from fastapi.responses import ORJSONResponse

@app.get("/orjson", response_class=ORJSONResponse)
def get_orjson():
    return {"data": [1, 2, 3]}
```

## 六、最佳实践建议
1. **状态码规范**：
   - 成功操作使用200/201
   - 资源删除使用204
   - 客户端错误使用400系列
   - 服务器错误保持默认500

2. **响应体设计**：
   ```python
   class SuccessResponse(BaseModel):
       code: int = 200
       message: str = "Success"
       data: Optional[Any] = None

   @app.get("/api")
   def get_api():
       return SuccessResponse(data={"key": "value"})
   ```

3. **性能优化**：
   ```python
   @app.get("/large-data")
   async def get_large_data():
       return StreamingResponse(
           get_large_file(),
           media_type="application/octet-stream"
       )
   ```

4. **错误处理**：
   ```python
   @app.exception_handler(HTTPException)
   async def http_exception_handler(request, exc):
       return JSONResponse(
           status_code=exc.status_code,
           content={"detail": exc.detail}
       )
   ```

通过合理使用响应类型和状态码，结合FastAPI的自动文档和数据校验功能，可以构建出健壮且符合REST规范的API接口。

完整代码示例：
```python
from fastapi import FastAPI, status, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse, StreamingResponse, RedirectResponse, ORJSONResponse
from typing import Optional, Any
import asyncio

# 初始化FastAPI应用
app = FastAPI()

# 一、响应状态码声明
@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    """
    创建一个新的项目，返回创建的项目名称
    :param name: 项目名称
    :return: 包含项目名称的字典
    """
    return {"name": name}

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    """
    删除指定ID的项目，无响应体
    :param id: 项目ID
    """
    pass

# 二、响应类型详解
# 1. JSON响应
@app.get("/data")
def get_data():
    """
    获取用户数据，返回JSON格式
    :return: 包含用户信息的字典
    """
    return {
        "user": {
            "id": 123,
            "name": "Alice"
        }
    }

@app.get("/custom-json")
def custom_json():
    """
    返回自定义的JSON响应，包含自定义的响应头
    :return: JSON响应对象
    """
    return JSONResponse(
        content={"message": "Hello"},
        status_code=status.HTTP_200_OK,
        headers={"X-Custom-Header": "fastapi"}
    )

# 2. HTML响应
@app.get("/page", response_class=HTMLResponse)
async def show_page():
    """
    显示一个简单的HTML页面
    :return: HTML页面内容
    """
    return """
    <html>
        <head>
            <title>FastAPI Page</title>
        </head>
        <body>
            <h1>Welcome to FastAPI!</h1>
        </body>
    </html>
    """

# 3. 文件响应
@app.get("/download")
async def download_file():
    """
    下载一个PDF文件
    :return: 文件响应对象
    """
    return FileResponse(
        path="document.pdf",
        filename="report.pdf",
        media_type="application/pdf"
    )

# 4. 流式响应
async def stream_data():
    """
    模拟流式数据生成
    :return: 生成器，每次生成一个数据块
    """
    for i in range(5):
        yield f"Chunk {i}\n".encode()
        await asyncio.sleep(1)

@app.get("/stream")
async def get_stream():
    """
    返回流式响应
    :return: 流式响应对象
    """
    return StreamingResponse(
        stream_data(),
        media_type="text/plain"
    )

# 5. 重定向响应
@app.get("/redirect")
async def redirect_to_docs():
    """
    重定向到FastAPI官方文档
    :return: 重定向响应对象
    """
    return RedirectResponse(
        url="https://fastapi.tiangolo.com",
        status_code=status.HTTP_302_FOUND
    )

# 三、响应头控制
@app.get("/headers")
def get_headers():
    """
    返回包含自定义响应头的JSON响应
    :return: JSON响应对象
    """
    return JSONResponse(
        content={"message": "Header demo"},
        headers={
            "X-Rate-Limit": "5000/day",
            "Cache-Control": "max-age=3600"
        }
    )

# 四、高级响应模式
@app.get("/orjson", response_class=ORJSONResponse)
def get_orjson():
    """
    使用ORJSONResponse返回JSON数据
    :return: 包含数据的字典
    """
    return {"data": [1, 2, 3]}

# 五、最佳实践建议
from pydantic import BaseModel

class SuccessResponse(BaseModel):
    """
    统一的成功响应模型
    """
    code: int = 200
    message: str = "Success"
    data: Optional[Any] = None

@app.get("/api")
def get_api():
    """
    使用统一的成功响应模型返回数据
    :return: 成功响应模型实例
    """
    return SuccessResponse(data={"key": "value"})

@app.get("/large-data")
async def get_large_data():
    """
    处理大数据请求，使用流式响应
    :return: 流式响应对象
    """
    return StreamingResponse(
        stream_data(),
        media_type="application/octet-stream"
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    处理HTTP异常，返回包含错误信息的JSON响应
    :param request: 请求对象
    :param exc: 异常对象
    :return: JSON响应对象
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
```