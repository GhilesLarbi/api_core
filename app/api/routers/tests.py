# app/api/routers/tests.py
from fastapi import APIRouter
from app.tasks.main import check_db_task

router = APIRouter()

@router.get("/test")
async def test():
    # 1. Trigger the task (.kiq() sends it to Redis)
    task_handle = await check_db_task.kiq()
    
    # 2. Wait for the result (.wait_result() blocks until worker is done)
    # This is perfect for testing, though in production you'd usually return the task_id
    result = await task_handle.wait_result()
    
    return {
        "task_id": task_handle.task_id,
        "worker_output": result.return_value
    }