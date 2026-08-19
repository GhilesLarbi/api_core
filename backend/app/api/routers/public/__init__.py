from fastapi import APIRouter, Depends
from app.api.dependencies.auth import require_available
from app.core.settings import settings
from . import app_config, docs, post, storage

router = APIRouter()

# docs sits at the root → /docs
router.include_router(docs.router, tags=["Docs"])
router.include_router(app_config.router, prefix=f"{settings.API_V1_STR}/public/app-config", tags=["Public App Config"])
router.include_router(post.router, prefix=f"{settings.API_V1_STR}/public/posts", tags=["Public Posts"], dependencies=[Depends(require_available)])
router.include_router(storage.router, prefix=f"{settings.API_V1_STR}/public/storage", tags=["Public Storage"], dependencies=[Depends(require_available)])
