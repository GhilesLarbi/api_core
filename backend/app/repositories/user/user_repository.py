from app.repositories.base_repository import BaseRepository
from app.models import User
from app.schemas.user import UserSortBy, UserSortDirection
from sqlalchemy import select, update, delete, func, or_
from typing import List, Dict, Any, Optional, Tuple
import uuid

#########################################################################################################
#########################################################################################################
class UserRepository(BaseRepository):
    #########################################################################################################
    #########################################################################################################
    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """Gets a user by ID."""
        stmt = select(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def get_by_email(self, email: str) -> User | None:
        """Gets a user by email."""
        stmt = select(User).where(func.lower(User.email) == email.lower())
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def list_for_overview(self, skip: int = 0, limit: int = 100) -> List[User]:
        stmt = (
            select(User)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.unique().scalars().all()

    #########################################################################################################
    #########################################################################################################
    async def list_all(
        self,
        q: Optional[str] = None,
        sort_by: UserSortBy = UserSortBy.CREATED_AT,
        sort_direction: UserSortDirection = UserSortDirection.DESC,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[User], int]:
        stmt = select(User)
        if q:
            pattern = f"%{q}%"
            stmt = stmt.where(
                or_(User.email.ilike(pattern), User.first_name.ilike(pattern), User.last_name.ilike(pattern))
            )

        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))

        sort_columns = {
            UserSortBy.EMAIL: User.email,
            UserSortBy.FIRST_NAME: User.first_name,
            UserSortBy.LAST_NAME: User.last_name,
            UserSortBy.CREATED_AT: User.created_at,
        }
        sort_column = sort_columns[sort_by]
        order_by = sort_column.asc() if sort_direction == UserSortDirection.ASC else sort_column.desc()

        stmt = (
            stmt.order_by(order_by)
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all(), total

    #########################################################################################################
    #########################################################################################################
    async def create(self, data: Dict[str, Any]) -> User:
        db_user = User(**data)
        self.session.add(db_user)
        return db_user

    #########################################################################################################
    #########################################################################################################
    async def update(self, user_id: uuid.UUID, data: Dict[str, Any]) -> User | None:
        stmt = (
            update(User)
            .where(User.id == user_id)
            .values(**data)
            .returning(User)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def delete(self, user_id: uuid.UUID) -> bool:
        stmt = delete(User).where(User.id == user_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0
