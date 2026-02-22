from fastapi import APIRouter
from app.api.routers import embeddings, scraper, chat, tests

router = APIRouter()

router.include_router(embeddings.router, prefix="/embeddings", tags=["Embeddings"])
router.include_router(scraper.router, prefix="/scraper", tags=["Scraper"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(tests.router, prefix="/tests", tags=["Tests"])