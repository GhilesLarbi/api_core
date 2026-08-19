from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict, HttpUrl, ValidationInfo, field_validator
from typing import List, Optional
from datetime import datetime
from app.core.permissions import PermissionPath
from app.schemas.common import PhoneNumber, Name, Password
from app.schemas.admin.base import AdminUpdateBase

#########################################################################################################
#########################################################################################################
class AdminCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    password: Password

    first_name: Name
    last_name: Name
    phone: Optional[PhoneNumber] = None
    avatar_url: Optional[HttpUrl] = None

    @field_validator('email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        return v.lower()

#########################################################################################################
#########################################################################################################
class AdminUpdate(AdminUpdateBase):
    old_password: Optional[str] = None
    new_password: Optional[Password] = None

#########################################################################################################
#########################################################################################################
class AdminProfileUpdate(AdminUpdateBase):
    pass

#########################################################################################################
#########################################################################################################
class AdminPasswordReset(BaseModel):
    password: Password

#########################################################################################################
#########################################################################################################
class AdminPermissionsUpdate(BaseModel):
    permissions: List[PermissionPath]

#########################################################################################################
#########################################################################################################
class AdminResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: Optional[datetime] = None
    email: EmailStr

    first_name: Name
    last_name: Name
    phone: Optional[PhoneNumber] = None
    avatar_url: Optional[HttpUrl] = None

    permissions: List[PermissionPath] = []

    @field_validator("permissions", mode="before")
    def flatten_paths(cls, value) -> List[str]:
        return [str(getattr(permission, "path", permission)) for permission in value or []]

#########################################################################################################
#########################################################################################################
class AdminTokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    admin: Optional[AdminResponse] = None
