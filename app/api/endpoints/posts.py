from fastapi import APIRouter
from app.schemas import post_schemas
from app.api.dependencies.factories import PostServiceDep, ProfileServiceDep
from app.api.dependencies.auth import AuthenticatedUser, OwnedPost

router = APIRouter()

################################################################################################################
################################################################################################################
@router.post("/duplicate", response_model=post_schemas.PostResponse)
async def duplicate_post(db_post: OwnedPost, db_user: AuthenticatedUser, post_service: PostServiceDep): 
    return await post_service.duplicate_post(post_id=db_post.id, user_id=db_user.id)

################################################################################################################
################################################################################################################
@router.put("/{post_id}", response_model=post_schemas.PostResponse)
async def update_post_by_id(post_update: post_schemas.PostUpdate, db_post: OwnedPost, post_service: PostServiceDep):
    return await post_service.update_post_from_schema(update_schema=post_update, db_post=db_post)

################################################################################################################
################################################################################################################
@router.get("/{post_id}", response_model=post_schemas.PostResponse)
async def retrieve_post_by_id(db_post: OwnedPost):
    return db_post

################################################################################################################
################################################################################################################
@router.delete("/{post_id}")
async def delete_single_post(db_post: OwnedPost, post_service: PostServiceDep):
    await post_service.delete_post(db_post=db_post)
    return {"success": True, "message":"post deleted successfully !"}

################################################################################################################
################################################################################################################
@router.post("", response_model=post_schemas.PostResponse)
async def create_post(post: post_schemas.PostCreate, db_user: AuthenticatedUser, profile_service: ProfileServiceDep, post_service: PostServiceDep):    
    await profile_service.get_and_verify_ownership(profile_id=post.profile_id, user_id=db_user.id)
    db_post = await post_service.create_post_from_schema(create_schema=post, user_id=db_user.id)
    await post_service.process_post_publication(post_id=db_post.id)
    return db_post