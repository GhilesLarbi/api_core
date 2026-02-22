from fastapi import APIRouter
from app.api.routers import organization, chat, tests

router = APIRouter()

router.include_router(organization.router, prefix="/organizations", tags=["Organizations"])
router.include_router(chat.router, prefix="/chat", tags=["Chat"])
router.include_router(tests.router, prefix="/tests", tags=["Tests"])