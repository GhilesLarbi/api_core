from fastapi import APIRouter
from app.core.settings import settings
from . import admin, admins, users, posts, session, permissions, app_config, storage

BASE = f"{settings.API_V1_STR}/admin"

router = APIRouter()

# admin.py sits at the tier root → /admin
router.include_router(admin.router, prefix=BASE, tags=["Admin"])
router.include_router(session.router, prefix=f"{BASE}/sessions", tags=["Admin Sessions"])
router.include_router(storage.router, prefix=f"{BASE}/storage", tags=["Admin Storage"])
router.include_router(permissions.router, prefix=f"{BASE}/permissions", tags=["Admin Permissions"])
router.include_router(admins.router, prefix=f"{BASE}/admins", tags=["Admin Admins"])
router.include_router(users.router, prefix=f"{BASE}/users", tags=["Admin Users"])
router.include_router(posts.router, prefix=f"{BASE}/posts", tags=["Admin Posts"])
router.include_router(app_config.router, prefix=f"{BASE}/app-config", tags=["Admin App Config"])
