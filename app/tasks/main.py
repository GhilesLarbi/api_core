from taskiq import TaskiqDepends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.taskiq.broker import broker
from app.core.database import get_db
from app.models.document import Document

@broker.task
async def check_db_task(db: AsyncSession = TaskiqDepends(get_db)) -> dict:
    """This task runs in the worker, uses the DB, and returns a dict"""
    res = await db.execute(select(Document).limit(1))
    doc = res.scalar_one_or_none()
    
    return {
        "status": "success",
        "data": {
            "title": doc.title if doc else "No documents found",
            "url": doc.url if doc else None
        }
    }