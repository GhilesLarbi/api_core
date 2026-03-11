from fastapi import APIRouter
from .endpoints import (
    users, 
    profiles, 
    posts
)

    
router = APIRouter() 

router.include_router(posts.router, prefix="/posts", tags=["Posts"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(profiles.router, prefix="/profiles", tags=["Profiles"])