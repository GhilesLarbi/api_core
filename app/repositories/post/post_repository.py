from app.repositories.base_repository import BaseRepository
from app.models import Post, Profile
from sqlalchemy import select, delete, update
from uuid import UUID
from typing import Dict, Any

class PostRepository(BaseRepository):

    ################################################################################################################
    ################################################################################################################
    async def get_by_id(self, post_id: UUID) -> Post | None:
        stmt = select(Post).where(Post.id == post_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    ################################################################################################################
    ################################################################################################################
    async def get_by_id_and_user_id(self, post_id: UUID, user_id: UUID) -> Post | None:
        stmt = (
            select(Post)
            .join(Post.profile)
            .where(
                Post.id == post_id,
                Profile.user_id == user_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    ################################################################################################################
    ################################################################################################################
    async def create(self, data: Dict[str, Any]) -> Post:
        db_post = Post(**data)
        self.session.add(db_post)
        return db_post

    ################################################################################################################
    ################################################################################################################
    async def update(self, post_id: UUID, data: Dict[str, Any]) -> Post | None:
        stmt = (
            update(Post)
            .where(Post.id == post_id)
            .values(**data)
            .returning(Post)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    ################################################################################################################
    ################################################################################################################
    async def delete(self, post_id: UUID) -> bool: 
        stmt = delete(Post).where(Post.id == post_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    ################################################################################################################
    ################################################################################################################
    async def delete_by_profile_id(self, profile_id: UUID) -> int: 
        stmt = delete(Post).where(Post.profile_id == profile_id)
        result = await self.session.execute(stmt)
        return result.rowcount