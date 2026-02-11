from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.dataset import Dataset

router = APIRouter()

@router.get("/")
async def list_datasets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Dataset))
    datasets = result.scalars().all()
    return datasets

@router.post("/")
async def create_dataset(question: str, answer: str, db: AsyncSession = Depends(get_db)):
    new_dataset = Dataset(question=question, answer=answer)
    db.add(new_dataset)
    await db.commit()
    await db.refresh(new_dataset)
    return new_dataset