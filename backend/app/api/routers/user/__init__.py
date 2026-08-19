from fastapi import APIRouter, Depends
from app.api.dependencies.auth import require_available
from app.core.settings import settings
from . import user, session, storage, post

router = APIRouter()

router.include_router(user.router, prefix=f"{settings.API_V1_STR}/user", tags=["User"], dependencies=[Depends(require_available)])
router.include_router(session.router, prefix=f"{settings.API_V1_STR}/user/sessions", tags=["User Sessions"], dependencies=[Depends(require_available)])
router.include_router(storage.router, prefix=f"{settings.API_V1_STR}/user/storage", tags=["User Storage"], dependencies=[Depends(require_available)])
router.include_router(post.router, prefix=f"{settings.API_V1_STR}/user/posts", tags=["User Posts"], dependencies=[Depends(require_available)])
