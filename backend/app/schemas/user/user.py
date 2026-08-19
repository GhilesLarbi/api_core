from uuid import UUID
from pydantic import BaseModel, EmailStr, ConfigDict, ValidationInfo, field_validator, HttpUrl
from typing import Optional
from datetime import datetime
from app.schemas.common import Name, Password

#########################################################################################################
#########################################################################################################
class UserCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    email: EmailStr
    first_name: Optional[Name] = None
    last_name: Optional[Name] = None
    password: Password

    @field_validator('email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        return v.lower()

#########################################################################################################
#########################################################################################################
class UserUpdate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    first_name: Optional[Name] = None
    last_name: Optional[Name] = None

    avatar_url: Optional[HttpUrl] = None

#########################################################################################################
#########################################################################################################
class PasswordChange(BaseModel):
    old_password: str
    new_password: Password

#########################################################################################################
#########################################################################################################
class PasswordForgot(BaseModel):
    email: EmailStr

    @field_validator('email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        return v.lower()

#########################################################################################################
#########################################################################################################
class PasswordReset(BaseModel):
    token: str
    new_password: Password

#########################################################################################################
#########################################################################################################
class EmailChange(BaseModel):
    new_email: EmailStr

    @field_validator('new_email')
    def lowercase_email(cls, v: str, info: ValidationInfo) -> str:
        return v.lower()

#########################################################################################################
#########################################################################################################
class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID

    created_at: Optional[datetime] = None
    email: EmailStr
    first_name: Optional[Name] = None
    last_name: Optional[Name] = None

    email_verified_at: Optional[datetime] = None
    avatar_url: Optional[HttpUrl] = None

#########################################################################################################
#########################################################################################################
class UserTokenResponse(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    user: Optional[UserResponse] = None
