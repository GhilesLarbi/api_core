from uuid import UUID
from typing import TYPE_CHECKING, List, Optional, Tuple
from app.services.base_service import BaseService
from app.models import Post, User
from app.models.session.enums import OwnerType
from app.schemas import post as post_schemas
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode
from app.core.storage.client import StorageClient

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.repositories import PostRepository

#########################################################################################################
#########################################################################################################
class PostService(BaseService):
    #########################################################################################################
    #########################################################################################################
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    #########################################################################################################
    #########################################################################################################
    @property
    def post_repo(self) -> "PostRepository":
        return self.provider.post_repo

    #########################################################################################################
    #########################################################################################################
    async def list_public(
        self,
        q: Optional[str] = None,
        ids: Optional[List[UUID]] = None,
        page: int = 1,
        limit: int = 10,
        user: Optional[User] = None,
    ) -> Tuple[List[post_schemas.PostResponse], int]:
        items, total = await self.post_repo.list_public(q=q, ids=ids, page=page, limit=limit)
        responses = [post_schemas.PostResponse.model_validate(post) for post in items]
        if user:
            saved = await self.post_repo.saved_ids(
                user_id=user.id,
                post_ids=[post.id for post in items],
            )
            for response in responses:
                response.is_saved = response.id in saved
        return responses, total

    #########################################################################################################
    #########################################################################################################
    async def get_public(
        self,
        post_id: UUID,
        user: Optional[User] = None,
    ) -> post_schemas.PostResponse:
        db_post = await self.post_repo.get_public_by_id(post_id=post_id)
        if not db_post:
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)

        response = post_schemas.PostResponse.model_validate(db_post)
        if user:
            saved = await self.post_repo.saved_ids(user_id=user.id, post_ids=[db_post.id])
            response.is_saved = db_post.id in saved
        return response

    #########################################################################################################
    #########################################################################################################
    async def create_post(
        self,
        user_id: UUID,
        post_create: post_schemas.PostCreate,
    ) -> Post:
        post_data = post_create.model_dump(mode="json")
        for media in post_data["media"]:
            media["url"] = await StorageClient.copy_to_permanent_storage(
                url=media["url"],
                owner_type=OwnerType.USER,
                owner_id=user_id,
            )
        post_data["user_id"] = user_id

        db_post = await self.post_repo.create(data=post_data)
        await self.session.commit()
        return await self.post_repo.get_by_id(post_id=db_post.id)

    #########################################################################################################
    #########################################################################################################
    async def save_post(
        self,
        user_id: UUID,
        post_id: UUID,
    ) -> None:
        if not await self.post_repo.get_public_by_id(post_id=post_id):
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)

        await self.post_repo.save(user_id=user_id, post_id=post_id)
        await self.session.commit()

    #########################################################################################################
    #########################################################################################################
    async def unsave_post(
        self,
        user_id: UUID,
        post_id: UUID,
    ) -> None:
        await self.post_repo.unsave(user_id=user_id, post_id=post_id)
        await self.session.commit()

    #########################################################################################################
    #########################################################################################################
    async def list_saved(
        self,
        user_id: UUID,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[post_schemas.PostResponse], int]:
        items, total = await self.post_repo.list_saved(user_id=user_id, page=page, limit=limit)
        responses = [post_schemas.PostResponse.model_validate(post) for post in items]
        for response in responses:
            response.is_saved = True
        return responses, total

    #########################################################################################################
    #########################################################################################################
    async def merge_saved(
        self,
        user_id: UUID,
        post_ids: List[UUID],
    ) -> None:
        await self.post_repo.merge_saved(user_id=user_id, post_ids=post_ids)
        await self.session.commit()

    #########################################################################################################
    #########################################################################################################
    async def admin_list_posts(
        self,
        q: Optional[str] = None,
        is_hidden: Optional[bool] = None,
        sort_by: post_schemas.PostSortBy = post_schemas.PostSortBy.CREATED_AT,
        sort_direction: post_schemas.PostSortDirection = post_schemas.PostSortDirection.DESC,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Post], int]:
        return await self.post_repo.list_admin(
            q=q,
            is_hidden=is_hidden,
            sort_by=sort_by,
            sort_direction=sort_direction,
            page=page,
            limit=limit,
        )

    #########################################################################################################
    #########################################################################################################
    async def admin_update_post(
        self,
        post_id: UUID,
        post_update: post_schemas.PostAdminUpdate,
    ) -> Post:
        db_post = await self.post_repo.get_by_id(post_id=post_id)
        if not db_post:
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)

        post_data = post_update.model_dump(mode="json", exclude_unset=True)
        if "media" in post_data and post_data["media"]:
            for media in post_data["media"]:
                media["url"] = await StorageClient.copy_to_permanent_storage(
                    url=media["url"],
                    owner_type=OwnerType.USER,
                    owner_id=db_post.user_id,
                )

        await self.post_repo.update(
            post_id=post_id,
            data=post_data,
        )
        await self.session.commit()
        return await self.post_repo.get_by_id(post_id=post_id)

    #########################################################################################################
    #########################################################################################################
    async def admin_delete_post(self, post_id: UUID) -> bool:
        if not await self.post_repo.get_by_id(post_id=post_id):
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)

        await self.post_repo.delete(post_id=post_id)
        await self.session.commit()
        return True
