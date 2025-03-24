---
title: FastAPI Entry(5)
description: FastAPI Response Handling

author: Adream
cover: false
hiddenCover: false
hidden: false
readingTime: true
comment: false
date: 2023-02-23
tags:
  - FastAPI
categories: Study Records

head:
  - - link
    - rel: stylesheet
      href: https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css
---

# FastAPI Response Handling

## 1. Declaration of Response Status Codes
Declare HTTP status codes through the `status_code` parameter of the route decorator:
```python
from fastapi import FastAPI, status

app = FastAPI()

@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    return {"name": name}
```

#### Status Code Specifications
| Category    | Typical Code   | Description                     | Response Body Requirement         |
|-------------|----------------|---------------------------------|-----------------------------------|
| Success     | 200 OK         | Default success                 | Must be included                  |
|             | 201 Created    | Resource created successfully   | Optional                          |
|             | 204 No Content | No content returned             | Prohibited to include             |
| Redirection | 307 Temporary Redirect | Temporary redirection | Optional                          |
| Client Error| 400 Bad Request | Invalid request             | Must include error information    |
|             | 404 Not Found  | Resource not found            | Must include error information    |

#### Status Code Shortcuts
Use predefined enumeration values:
```python
from fastapi import status

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    pass  # No response body
```

## 2. Detailed Explanation of Response Types

##### JSON Response
###### Automatic Serialization
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

###### Custom Response
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

##### HTML Response
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

##### File Response
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

##### Streaming Response
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

##### Redirect Response
```python
from fastapi.responses import RedirectResponse

@app.get("/redirect")
async def redirect_to_docs():
    return RedirectResponse(
        url="https://fastapi.tiangolo.com",
        status_code=status.HTTP_302_FOUND
    )
```

## 3. Response Header Control
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

## 4. Response Media Types
| Response Type       | Media Type               | Typical Use Cases               |
|---------------------|--------------------------|---------------------------------|
| JSONResponse        | application/json         | API data interaction            |
| HTMLResponse        | text/html                | Page rendering                  |
| FileResponse        | image/jpeg               | Image download                  |
| StreamingResponse   | application/octet-stream | Large file transfer             |

## 5. Advanced Response Modes
```python
from fastapi.responses import ORJSONResponse

@app.get("/orjson", response_class=ORJSONResponse)
def get_orjson():
    return {"data": [1, 2, 3]}
```

## 6. Best Practice Recommendations
- **Status Code Specification**:
  - Use 200/201 for successful operations.
  - Use 204 for resource deletion.
  - Use the 400 series for client errors.
  - Keep the default 500 for server errors.

- **Response Body Design**:
```python
from pydantic import BaseModel
from typing import Optional, Any

class SuccessResponse(BaseModel):
    code: int = 200
    message: str = "Success"
    data: Optional[Any] = None

@app.get("/api")
def get_api():
    return SuccessResponse(data={"key": "value"})
```

- **Performance Optimization**:
```python
@app.get("/large-data")
async def get_large_data():
    return StreamingResponse(
        get_large_file(),
        media_type="application/octet-stream"
    )
```

- **Error Handling**:
```python
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
```

By reasonably using response types and status codes, and combining FastAPI's automatic documentation and data validation functions, you can build robust and RESTful API interfaces.

Complete code example:
```python
from fastapi import FastAPI, status, HTTPException
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse, StreamingResponse, RedirectResponse, ORJSONResponse
from typing import Optional, Any
import asyncio

# Initialize the FastAPI application
app = FastAPI()

# 1. Declaration of Response Status Codes
@app.post("/items/", status_code=status.HTTP_201_CREATED)
async def create_item(name: str):
    """
    Create a new item and return the name of the created item.
    :param name: The name of the item.
    :return: A dictionary containing the name of the item.
    """
    return {"name": name}

@app.delete("/items/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(id: int):
    """
    Delete an item with the specified ID, no response body.
    :param id: The ID of the item.
    """
    pass

# 2. Detailed Explanation of Response Types
# 2.1 JSON Response
@app.get("/data")
def get_data():
    """
    Get user data and return it in JSON format.
    :return: A dictionary containing user information.
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
    Return a custom JSON response containing custom response headers.
    :return: A JSON response object.
    """
    return JSONResponse(
        content={"message": "Hello"},
        status_code=status.HTTP_200_OK,
        headers={"X-Custom-Header": "fastapi"}
    )

# 2.2 HTML Response
@app.get("/page", response_class=HTMLResponse)
async def show_page():
    """
    Display a simple HTML page.
    :return: The content of the HTML page.
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

# 2.3 File Response
@app.get("/download")
async def download_file():
    """
    Download a PDF file.
    :return: A file response object.
    """
    return FileResponse(
        path="document.pdf",
        filename="report.pdf",
        media_type="application/pdf"
    )

# 2.4 Streaming Response
async def stream_data():
    """
    Simulate streaming data generation.
    :return: A generator that generates a data chunk each time.
    """
    for i in range(5):
        yield f"Chunk {i}\n".encode()
        await asyncio.sleep(1)

@app.get("/stream")
async def get_stream():
    """
    Return a streaming response.
    :return: A streaming response object.
    """
    return StreamingResponse(
        stream_data(),
        media_type="text/plain"
    )

# 2.5 Redirect Response
@app.get("/redirect")
async def redirect_to_docs():
    """
    Redirect to the official FastAPI documentation.
    :return: A redirect response object.
    """
    return RedirectResponse(
        url="https://fastapi.tiangolo.com",
        status_code=status.HTTP_302_FOUND
    )

# 3. Response Header Control
@app.get("/headers")
def get_headers():
    """
    Return a JSON response containing custom response headers.
    :return: A JSON response object.
    """
    return JSONResponse(
        content={"message": "Header demo"},
        headers={
            "X-Rate-Limit": "5000/day",
            "Cache-Control": "max-age=3600"
        }
    )

# 4. Advanced Response Modes
@app.get("/orjson", response_class=ORJSONResponse)
def get_orjson():
    """
    Return JSON data using ORJSONResponse.
    :return: A dictionary containing data.
    """
    return {"data": [1, 2, 3]}

# 5. Best Practice Recommendations
from pydantic import BaseModel

class SuccessResponse(BaseModel):
    """
    A unified success response model.
    """
    code: int = 200
    message: str = "Success"
    data: Optional[Any] = None

@app.get("/api")
def get_api():
    """
    Return data using the unified success response model.
    :return: An instance of the success response model.
    """
    return SuccessResponse(data={"key": "value"})

@app.get("/large-data")
async def get_large_data():
    """
    Handle large data requests using a streaming response.
    :return: A streaming response object.
    """
    return StreamingResponse(
        stream_data(),
        media_type="application/octet-stream"
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """
    Handle HTTP exceptions and return a JSON response containing error information.
    :param request: The request object.
    :param exc: The exception object.
    :return: A JSON response object.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
```