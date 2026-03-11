from app.services.base_service import BaseService
from app.schemas import profile_schemas
from app.models import Profile
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID
from fastapi import HTTPException

if TYPE_CHECKING : 
    from app.services.service_provider import ServiceProvider
    from app.repositories import ProfileRepository

class ProfileService(BaseService):
    def __init__(self, provider: "ServiceProvider"): 
        super().__init__(provider)

    @property
    def profile_repo(self) -> "ProfileRepository":
        return self.provider.profile_repo

    ################################################################################################################
    ################################################################################################################
    async def create_profile_for_user(self, user_id: UUID, profile_create: profile_schemas.ProfileCreate) -> Profile: 
        data = profile_create.model_dump()
        data["user_id"] = user_id
        db_profile = await self.profile_repo.create(data)
        await self.session.commit()
        await self.session.refresh(db_profile)
        return db_profile

    ################################################################################################################
    ################################################################################################################
    async def update_profile(self, profile_id: UUID, profile_update: profile_schemas.ProfileUpdate) -> Profile:
        data = profile_update.model_dump(exclude_unset=True)
        if "avatar_url" in data and data["avatar_url"]:
            data["avatar_url"] = str(data["avatar_url"])
        
        updated = await self.profile_repo.update(profile_id, data)
        await self.session.commit()
        return updated

    ################################################################################################################
    ################################################################################################################
    async def get_profile(self, profile_id: UUID) -> Optional[Profile]:
        return await self.profile_repo.get_by_id(profile_id)

    ################################################################################################################
    ################################################################################################################
    async def get_profile_for_response(self, profile_id: UUID) -> Profile:
        db_profile = await self.get_profile(profile_id)
        if not db_profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return db_profile

    ################################################################################################################
    ################################################################################################################
    async def get_user_profiles_for_response(self, user_id: UUID) -> List[Profile]:
        return await self.profile_repo.get_by_user_id(user_id=user_id)

    ################################################################################################################
    ################################################################################################################
    async def delete_profile(self, profile_id: UUID) -> bool: 
        success = await self.profile_repo.delete(profile_id)
        await self.session.commit()
        return success

    ################################################################################################################
    ################################################################################################################
    async def get_and_verify_ownership(self, profile_id: UUID, user_id: UUID) -> Profile:
        profile = await self.get_profile(profile_id)
        if not profile or profile.user_id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden: You do not own this profile")
        return profile