from uuid import UUID
from typing import TYPE_CHECKING, Optional
from fastapi import HTTPException
from app.services.base_service import BaseService
from app.models import Post
from app.schemas import post_schemas

if TYPE_CHECKING : 
    from app.services.service_provider import ServiceProvider
    from app.repositories import PostRepository

class PostService(BaseService):
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    @property
    def post_repo(self) -> 'PostRepository':
        return self.provider.post_repo

    ################################################################################################################
    ################################################################################################################
    async def create_post_from_schema(self, create_schema: post_schemas.PostCreate, user_id: UUID) -> Post: 
        data = create_schema.model_dump()
        db_post = await self.post_repo.create(data)
        await self.session.commit()
        await self.session.refresh(db_post)
        return db_post

    ################################################################################################################
    ################################################################################################################
    async def update_post_from_schema(self, update_schema: post_schemas.PostUpdate, db_post: Post) -> Post:
        data = update_schema.model_dump(exclude_unset=True)
        updated_post = await self.post_repo.update(db_post.id, data)
        await self.session.commit()
        return updated_post

    ################################################################################################################
    ################################################################################################################
    async def process_post_publication(self, post_id: UUID):
        pass

    ################################################################################################################
    ################################################################################################################
    async def get_post(self, post_id: UUID) -> Optional[Post]: 
        return await self.post_repo.get_by_id(post_id=post_id)

    ################################################################################################################
    ################################################################################################################
    async def get_post_for_response(self, post_id: UUID) -> Post:
        db_post = await self.get_post(post_id)
        if not db_post:
            raise HTTPException(status_code=404, detail="Post not found")
        return db_post

    ################################################################################################################
    ################################################################################################################
    async def get_post_by_id_and_user(self, post_id: UUID, user_id: UUID) -> Optional[Post]:
        return await self.post_repo.get_by_id_and_user_id(post_id, user_id)

    ################################################################################################################
    ################################################################################################################
    async def delete_post(self, db_post: Post) -> bool: 
        success = await self.post_repo.delete(db_post.id)
        await self.session.commit()
        return success

    ################################################################################################################
    ################################################################################################################
    async def duplicate_post(self, post_id: UUID, user_id: UUID) -> Post: 
        original = await self.get_post_by_id_and_user(post_id, user_id)
        if not original:
            raise HTTPException(status_code=404, detail="Original post not found")
        
        new_post = Post(
            profile_id=original.profile_id,
            scheduled_time=original.scheduled_time,
            is_approved=original.is_approved
        )
        self.session.add(new_post)
        await self.session.commit()
        await self.session.refresh(new_post)
        return new_post