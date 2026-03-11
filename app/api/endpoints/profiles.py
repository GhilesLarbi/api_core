from fastapi import APIRouter
from app.schemas import profile_schemas
from app.api.dependencies.factories import ProfileServiceDep
from app.api.dependencies.auth import AuthenticatedUser, OwnedProfile
from typing import List

router = APIRouter()

################################################################################################################
################################################################################################################
@router.post("/create", response_model=profile_schemas.ProfileResponse)
async def create_user_profile(profile_create: profile_schemas.ProfileCreate, db_user: AuthenticatedUser, profile_service: ProfileServiceDep):
    return await profile_service.create_profile_for_user(user_id=db_user.id, profile_create=profile_create)

################################################################################################################
################################################################################################################
@router.get("/me/all", response_model=List[profile_schemas.ProfileResponse])
async def read_all_profiles_for_current_user(db_user: AuthenticatedUser, profile_service: ProfileServiceDep):
    return await profile_service.get_user_profiles_for_response(user_id=db_user.id)

################################################################################################################
################################################################################################################
@router.put("/{profile_id}", response_model=profile_schemas.ProfileResponse)
async def update_profile_for_current_user(profile_update: profile_schemas.ProfileUpdate, db_profile: OwnedProfile, profile_service: ProfileServiceDep):
    return await profile_service.update_profile(profile_id=db_profile.id, profile_update=profile_update)

################################################################################################################
################################################################################################################
@router.delete("/{profile_id}")
async def delete_profile_for_current_user(db_profile: OwnedProfile, profile_service: ProfileServiceDep):
    await profile_service.delete_profile(profile_id=db_profile.id)
    return {"success": True, "message": "Profile deleted successfully"}