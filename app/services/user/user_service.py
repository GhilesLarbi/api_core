from uuid import UUID
from typing import TYPE_CHECKING, Optional
from fastapi import HTTPException
from app.services.base_service import BaseService
from app.models import User
from app.schemas import user_schemas
from app.core.security import get_password_hash, verify_password, create_access_token

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.repositories import UserRepository

class UserService(BaseService):
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    @property
    def user_repo(self) -> "UserRepository":
        return self.provider.user_repo



    ################################################################################################################
    ################################################################################################################
    async def register_new_user(self, user_create: user_schemas.UserCreate) -> user_schemas.UserTokenResponse:
        existing = await self.user_repo.get_by_email(user_create.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_data = user_create.model_dump()
        password = user_data.pop("password")
        user_data["hashed_password"] = get_password_hash(password)
        
        db_user = await self.user_repo.create(user_data)
        
        await self.session.commit()
        
        db_user = await self.user_repo.get_by_id(db_user.id)
        
        token = create_access_token(db_user.id)
        return user_schemas.UserTokenResponse(access_token=token, user=db_user)


    ################################################################################################################
    ################################################################################################################
    async def authenticate_user(self, email: str, password: str) -> user_schemas.UserTokenResponse:
        db_user = await self.user_repo.get_by_email(email)
        
        if not db_user or not verify_password(password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        db_user = await self.user_repo.get_by_id(db_user.id)
        
        token = create_access_token(db_user.id)
        return user_schemas.UserTokenResponse(access_token=token, user=db_user)

    ################################################################################################################
    ################################################################################################################
    async def get_user(self, user_id: UUID) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    ################################################################################################################
    ################################################################################################################
    async def get_user_for_response(self, user_id: UUID) -> User:
        user = await self.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    ################################################################################################################
    ################################################################################################################
    async def update_user(self, user_id: UUID, user_update: user_schemas.UserUpdate) -> User:
        db_user = await self.get_user_for_response(user_id)
        update_data = user_update.model_dump(exclude_unset=True)
        
        if "new_password" in update_data and "old_password" in update_data:
            if not verify_password(update_data["old_password"], db_user.hashed_password):
                raise HTTPException(status_code=400, detail="Invalid old password")
            update_data["hashed_password"] = get_password_hash(update_data.pop("new_password"))
            update_data.pop("old_password")
            
        updated_user = await self.user_repo.update(user_id, update_data)
        await self.session.commit()
        return await self.user_repo.get_by_id(user_id)

    ################################################################################################################
    ################################################################################################################
    async def delete_user(self, user_id: UUID) -> bool:
        await self.user_repo.delete(user_id)
        await self.session.commit()
        return True