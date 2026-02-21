from fastapi import APIRouter
from app.api.routers import embeddings

router = APIRouter()

router.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings"])