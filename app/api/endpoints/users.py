from app.api.dependencies.factories import UserServiceDep
from app.api.dependencies.auth import AuthenticatedUser
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas import user_schemas
from typing import Annotated

router = APIRouter()

################################################################################################################
################################################################################################################
@router.post("", response_model=user_schemas.UserTokenResponse)
async def register_new_user(user_create: user_schemas.UserCreate, user_service: UserServiceDep):
    return await user_service.register_new_user(user_create)

################################################################################################################
################################################################################################################
@router.post("/login", response_model=user_schemas.UserTokenResponse, tags=["Authentication"])
async def login_for_access_token(user_service: UserServiceDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]): 
    return await user_service.authenticate_user(email=form_data.username, password=form_data.password)

################################################################################################################
################################################################################################################
@router.get("/me", response_model=user_schemas.UserResponse)
async def read_current_user(db_user: AuthenticatedUser):
    return db_user

################################################################################################################
################################################################################################################
@router.delete("")
async def delete_own_user_account(db_user: AuthenticatedUser, user_service: UserServiceDep):
    await user_service.delete_user(db_user.id)
    return {"success": True}

################################################################################################################
################################################################################################################
@router.put("", response_model=user_schemas.UserResponse)
async def update_user(user_update: user_schemas.UserUpdate, db_user: AuthenticatedUser, user_service: UserServiceDep):
    return await user_service.update_user(user_id=db_user.id, user_update=user_update)