from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from uuid import UUID

from app.core.security import decode_access_token
from app.api.dependencies.factories import UserServiceDep, PostServiceDep, ProfileServiceDep
from app.models import User, Profile, Post

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"/api/v1/users/login")

################################################################################################################
################################################################################################################
async def get_authenticated_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    user_service: UserServiceDep
) -> User:
    user_id_str = decode_access_token(token)
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await user_service.get_user(user_id=UUID(user_id_str))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

################################################################################################################
################################################################################################################
async def get_owned_profile(
    profile_id: UUID,
    current_user: Annotated[User, Depends(get_authenticated_user)],
    profile_service: ProfileServiceDep
) -> Profile:
    profile = await profile_service.get_profile(profile_id)
    if not profile or profile.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this profile")
    return profile

################################################################################################################
################################################################################################################
async def get_owned_post(
    post_id: UUID,
    current_user: Annotated[User, Depends(get_authenticated_user)],
    post_service: PostServiceDep
) -> Post:
    post = await post_service.get_post_by_id_and_user(post_id, current_user.id)
    if not post:
        raise HTTPException(status_code=403, detail="Not authorized to access this post")
    return post

################################################################################################################
################################################################################################################
AuthenticatedUser = Annotated[User, Depends(get_authenticated_user)]
OwnedProfile = Annotated[Profile, Depends(get_owned_profile)]
OwnedPost = Annotated[Post, Depends(get_owned_post)]