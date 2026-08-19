from app.repositories.base_repository import BaseRepository
from app.models import Post, SavedPost
from app.schemas.post import PostSortBy, PostSortDirection
from sqlalchemy import select, update, delete, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.dialects.postgresql import insert
from typing import List, Dict, Any, Optional, Set, Tuple
import uuid

#########################################################################################################
#########################################################################################################
class PostRepository(BaseRepository):
    #########################################################################################################
    #########################################################################################################
    async def get_by_id(self, post_id: uuid.UUID) -> Post | None:
        stmt = (
            select(Post)
            .where(Post.id == post_id)
            .options(selectinload(Post.author))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def get_public_by_id(self, post_id: uuid.UUID) -> Post | None:
        stmt = (
            select(Post)
            .where(Post.id == post_id, Post.is_hidden.is_(False))
            .options(selectinload(Post.author))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def list_public(
        self,
        q: Optional[str] = None,
        ids: Optional[List[uuid.UUID]] = None,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Post], int]:
        stmt = select(Post).where(Post.is_hidden.is_(False))
        if q:
            stmt = stmt.where(Post.title.ilike(f"%{q}%"))
        if ids is not None:
            stmt = stmt.where(Post.id.in_(ids))

        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))

        stmt = (
            stmt.options(selectinload(Post.author))
            .order_by(Post.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all(), total

    #########################################################################################################
    #########################################################################################################
    async def list_admin(
        self,
        q: Optional[str] = None,
        is_hidden: Optional[bool] = None,
        sort_by: PostSortBy = PostSortBy.CREATED_AT,
        sort_direction: PostSortDirection = PostSortDirection.DESC,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Post], int]:
        stmt = select(Post)
        if q:
            pattern = f"%{q}%"
            stmt = stmt.where(or_(Post.title.ilike(pattern), Post.content.ilike(pattern)))
        if is_hidden is not None:
            stmt = stmt.where(Post.is_hidden.is_(is_hidden))

        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))

        sort_columns = {
            PostSortBy.TITLE: Post.title,
            PostSortBy.CREATED_AT: Post.created_at,
        }
        sort_column = sort_columns[sort_by]
        order_by = sort_column.asc() if sort_direction == PostSortDirection.ASC else sort_column.desc()

        stmt = (
            stmt.options(selectinload(Post.author))
            .order_by(order_by)
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all(), total

    #########################################################################################################
    #########################################################################################################
    async def saved_ids(
        self,
        user_id: uuid.UUID,
        post_ids: List[uuid.UUID],
    ) -> Set[uuid.UUID]:
        if not post_ids:
            return set()

        stmt = select(SavedPost.post_id).where(
            SavedPost.user_id == user_id,
            SavedPost.post_id.in_(post_ids),
        )
        result = await self.session.execute(stmt)
        return set(result.scalars().all())

    #########################################################################################################
    #########################################################################################################
    async def merge_saved(
        self,
        user_id: uuid.UUID,
        post_ids: List[uuid.UUID],
    ) -> None:
        if not post_ids:
            return

        known = await self.session.execute(
            select(Post.id).where(Post.id.in_(post_ids), Post.is_hidden.is_(False))
        )
        wanted = list(known.scalars().all())
        if not wanted:
            return

        await self.session.execute(
            insert(SavedPost)
            .values([{"user_id": user_id, "post_id": post_id} for post_id in wanted])
            .on_conflict_do_nothing()
        )

    #########################################################################################################
    #########################################################################################################
    async def save(
        self,
        user_id: uuid.UUID,
        post_id: uuid.UUID,
    ) -> None:
        await self.session.execute(
            insert(SavedPost)
            .values(user_id=user_id, post_id=post_id)
            .on_conflict_do_nothing()
        )

    #########################################################################################################
    #########################################################################################################
    async def unsave(
        self,
        user_id: uuid.UUID,
        post_id: uuid.UUID,
    ) -> bool:
        stmt = delete(SavedPost).where(
            SavedPost.user_id == user_id,
            SavedPost.post_id == post_id,
        )
        result = await self.session.execute(stmt)
        return result.rowcount > 0

    #########################################################################################################
    #########################################################################################################
    async def list_saved(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Post], int]:
        stmt = (
            select(Post)
            .join(SavedPost, SavedPost.post_id == Post.id)
            .where(SavedPost.user_id == user_id)
        )

        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))

        stmt = (
            stmt.options(selectinload(Post.author))
            .order_by(SavedPost.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all(), total

    #########################################################################################################
    #########################################################################################################
    async def create(self, data: Dict[str, Any]) -> Post:
        db_post = Post(**data)
        self.session.add(db_post)
        return db_post

    #########################################################################################################
    #########################################################################################################
    async def update(
        self,
        post_id: uuid.UUID,
        data: Dict[str, Any],
    ) -> Post | None:
        stmt = (
            update(Post)
            .where(Post.id == post_id)
            .values(**data)
            .returning(Post)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def delete(self, post_id: uuid.UUID) -> bool:
        stmt = delete(Post).where(Post.id == post_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0
