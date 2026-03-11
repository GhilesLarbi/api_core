from app.repositories.base_repository import BaseRepository
from app.models import Profile
from sqlalchemy import select, update, delete
from typing import List, Dict, Any
from uuid import UUID

class ProfileRepository(BaseRepository):

    #########################################################################################################
    #########################################################################################################
    async def get_by_id(self, profile_id: UUID) -> Profile | None: 
        stmt = select(Profile).where(
            Profile.id == profile_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    
    #########################################################################################################
    #########################################################################################################
    async def get_by_ids(self, profile_ids: List[UUID]) -> List[Profile]:
        """Get profiles by a list of IDs"""
        stmt = select(Profile).where(
            Profile.id.in_(profile_ids),
        )

        result = await self.session.execute(stmt)
        return result.scalars().all()


    #########################################################################################################
    #########################################################################################################
    async def get_by_user_id(self, user_id: UUID) -> List[Profile]:
        stmt = (
            select(Profile)
            .where(
                Profile.user_id == user_id,
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    
    #########################################################################################################
    #########################################################################################################
    async def create(self, data: Dict[str, Any]) -> Profile:
        """Create a profile"""
        db_profile = Profile(**data)
        self.session.add(db_profile)
        return db_profile



    #########################################################################################################
    #########################################################################################################
    async def update(self, profile_id: UUID, data: Dict[str, Any]) -> Profile | None: 
        """Update a profile"""
        stmt = (
            update(Profile)
            .where(Profile.id == profile_id)
            .values(**data)
            .returning(Profile)
        )

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()


    #########################################################################################################
    #########################################################################################################
    async def delete(self, profile_id: UUID) -> bool:
        """
        delete profile from database.
        """
        stmt = (
            delete(Profile)
            .where(Profile.id == profile_id)
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0