# Crosspost API

A FastAPI backend using the Service-Repository pattern with PostgreSQL and Async SQLAlchemy.

## 1. Setup Environment
Create a `.env` file in the root directory with the following content (based on `app/core/secrets.py`):

```env
POSTGRES_DB=local
POSTGRES_USER=TestUser
POSTGRES_PASSWORD=TestPassowrd
POSTGRES_PORT=5432
POSTGRES_HOST=db
POSTGRES_PROXY_HOST=db

SECRET_KEY=your_super_secret_jwt_key

ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=adminpass
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpass
```

## 2. Run the Project
Build and start the containers:
```bash
docker compose up --build
```

## 3. Database Migrations
Once the containers are running, apply the database schema:
```bash
docker compose exec web alembic upgrade head
```

## 4. Architecture Overview

This project uses a layered architecture to keep code clean and testable:

*   **Models**: SQLAlchemy ORM classes (Database structure).
*   **Schemas**: Pydantic models (Data validation and Serialization).
*   **Repositories**: Pure data access. They contain SQL logic (Select, Update, Delete).
*   **Services**: Business logic. They coordinate between repositories, handle validation, and manage `session.commit()`.
*   **ServiceProvider**: A dependency injector that ensures a single database session is shared across all repositories and services during a request.
*   **Endpoints**: FastAPI routes that receive requests and call the appropriate Services.

## 5. Useful Commands

| Action | Command |
| :--- | :--- |
| **Start Services** | `docker compose up` |
| **Stop Services** | `docker compose down` |
| **Apply Migrations** | `docker compose exec web alembic upgrade head` |
| **Create Migration** | `docker compose exec web alembic revision --autogenerate -m "description"` |
| **View Logs** | `docker compose logs -f web` |
| **Interactive Shell** | `docker compose exec web bash` |

## 6. API Documentation
Once the app is running, access the interactive docs at:
*   **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
*   **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)