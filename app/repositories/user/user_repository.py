from app.repositories.base_repository import BaseRepository
from app.models import User, Profile
from sqlalchemy import select, update, delete, func
from sqlalchemy.orm import selectinload
from typing import List, Dict, Any
import uuid

class UserRepository(BaseRepository):

    ################################################################################################################
    ################################################################################################################
    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Gets a user by ID with profiles eagerly loaded."""
        stmt = (
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.profiles))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    ################################################################################################################
    ################################################################################################################
    async def get_by_email(self, email: str) -> User | None: 
        """Gets a user by email."""
        stmt = select(User).where(func.lower(User.email) == email.lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    ################################################################################################################
    ################################################################################################################
    async def list_for_overview(self, skip: int = 0, limit: int = 100) -> List[User]: 
        stmt = (
            select(User)
            .options(selectinload(User.profiles))
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.unique().scalars().all()

    ################################################################################################################
    ################################################################################################################
    async def create(self, data: Dict[str, Any]) -> User:
        db_user = User(**data)
        self.session.add(db_user)
        return db_user

    ################################################################################################################
    ################################################################################################################
    async def update(self, user_id: uuid.UUID, data: Dict[str, Any]) -> User | None: 
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(**data)
            .returning(User)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    ################################################################################################################
    ################################################################################################################
    async def delete(self, user_id: uuid.UUID) -> bool: 
        stmt = delete(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0