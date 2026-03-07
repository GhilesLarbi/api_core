# Project Documentation

## Overview
This project is a FastAPI application utilizing SQLAlchemy (Async) for database interactions and Alembic for schema migrations. The architecture is designed for scalability, featuring tiered routing and automated model registration.

---

## 1. Environment Configuration

### .env File
The application requires a `.env` file in the root directory to store sensitive information. This file is excluded from version control. Create a `.env` file with the following variables:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=app_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

### Secrets and Settings
- **`app/core/secrets.py`**: Uses `pydantic-settings` to load the `.env` variables. It dynamically constructs the `DATABASE_URL` required for the asynchronous SQLAlchemy engine.
- **`app/core/settings.py`**: Contains non-sensitive application configurations such as API prefixes, host addresses, and ports.

---

## 2. Getting Started

### Prerequisites
- Docker and Docker Compose installed.

### Installation and Execution
1. Build and start the containers:
   ```bash
   docker compose up --build -d
   ```
2. The API will be available at `http://localhost:8000`.
3. The interactive API documentation (Swagger) is available at `http://localhost:8000/docs`.

---

## 3. Dependency Management

### Python Libraries
This project uses `pipenv`. 
- To add a new package: `pipenv install <package_name>`
- To add a development package: `pipenv install --dev <package_name>`
- The `Dockerfile` is configured to install these dependencies globally within the container using `pipenv install --system`.

### System Dependencies
To add system-level libraries (e.g., `git`, `libpq-dev`), modify the `Dockerfile`:
```dockerfile
RUN apt-get install -y <package_name>
```

---

## 4. Database Architecture and Migrations

### Adding a Model
1. Create a new file in `app/models/` (e.g., `user.py`).
2. Define your class inheriting from `Base`.
3. **Crucial**: Import the new model in `app/models/__init__.py`. Alembic relies on this file to discover models for autogeneration.

### Migration Workflow
All migration commands must be executed inside the `api` container.

1. **Generate a migration script**:
   Run this after changing your SQLAlchemy models.
   ```bash
   docker exec -it api alembic revision --autogenerate -m "description of changes"
   ```
2. **Apply migrations**:
   Push changes to the database.
   ```bash
   docker exec -it api alembic upgrade head
   ```
3. **Revert migrations**:
   ```bash
   docker exec -it api alembic downgrade -1
   ```

---

## 5. API Development

### Tiered Routing System
The project uses a three-layer routing architecture:

1.  **Individual Routers (`app/api/routers/`)**: Define specific endpoints for a resource (e.g., `datasets.py`).
    ```python
    router = APIRouter()
    @router.get("/")
    async def get_items(): ...
    ```
2.  **The Aggregator (`app/api/router.py`)**: Imports all individual routers and assigns prefixes and tags.
    ```python
    from app.api.routers import datasets
    router.include_router(datasets.router, prefix="/datasets", tags=["Datasets"])
    ```
3.  **Main Application (`app/main.py`)**: Includes the aggregator router into the FastAPI instance using the global `API_PREFIX`.

### Adding a New Endpoint
1. Create or open a router file in `app/api/routers/`.
2. Define the endpoint function using the `router` decorator.
3. Use `Depends(get_db)` for database access.

---

## 6. Directory Structure Reference
- `alembic/`: Database migration configurations and version scripts.
- `app/api/`: All API-related logic (routers, endpoint definitions).
- `app/core/`: Configuration, security, and database connection setup.
- `app/models/`: SQLAlchemy ORM models.
- `app/main.py`: Application entry point and Uvicorn configuration.
- `compose.yaml`: Docker service definitions.
- `Pipfile`: Python dependency definitions.




<!-- 
{
  "url": "string",
  "html": "string",
  "fit_html": "string",
  "success": "boolean",
  "cleaned_html": "string",
  "media": {
    "images": [
      {
        "src": "string",
        "data": "string",
        "alt": "string",
        "desc": "null",
        "score": "number",
        "type": "string",
        "group_id": "number",
        "format": "string",
        "width": "null"
      }
    ],
    "videos": "array",
    "audios": "array"
  },
  "links": {
    "internal": [
      {
        "href": "string",
        "text": "string",
        "title": "string",
        "base_domain": "string",
        "head_data": "null",
        "head_extraction_status": "null",
        "head_extraction_error": "null",
        "intrinsic_score": "number",
        "contextual_score": "null",
        "total_score": "null"
      }
    ],
    "external": [
      {
        "href": "string",
        "text": "string",
        "title": "string",
        "base_domain": "string",
        "head_data": "null",
        "head_extraction_status": "null",
        "head_extraction_error": "null",
        "intrinsic_score": "number",
        "contextual_score": "null",
        "total_score": "null"
      }
    ]
  },
  "downloaded_files": "null",
  "js_execution_result": "null",
  "screenshot": "null",
  "pdf": "null",
  "mhtml": "null",
  "extracted_content": "null",
  "metadata": {
    "title": "string",
    "description": "string",
    "keywords": "string",
    "author": "null",
    "og:title": "string",
    "og:description": "string",
    "og:url": "string",
    "twitter:title": "string",
    "twitter:description": "string"
  },
  "error_message": "string",
  "session_id": "null",
  "response_headers": {
    "access-control-allow-headers": "string",
    "access-control-allow-methods": "string",
    "access-control-allow-origin": "string",
    "cache-control": "string",
    "connection": "string",
    "content-encoding": "string",
    "content-length": "string",
    "content-security-policy": "string",
    "content-type": "string",
    "date": "string",
    "referrer-policy": "string",
    "server": "string",
    "vary": "string",
    "x-content-type-options": "string",
    "x-frame-options": "string",
    "x-powered-by": "string",
    "x-xss-protection": "string"
  },
  "status_code": "number",
  "ssl_certificate": "null",
  "dispatch_result": "null",
  "redirected_url": "string",
  "network_requests": "null",
  "console_messages": "null",
  "tables": "array",
  "head_fingerprint": "string",
  "cached_at": "null",
  "cache_status": "string",
  "markdown": {
    "raw_markdown": "string",
    "markdown_with_citations": "string",
    "fit_markdown": "string",
    "fit_html": "string"
  }
} -->