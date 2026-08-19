from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import List
from app.schemas.common import LocalizedResponse
from app.schemas.permission.base import PermissionLang

#########################################################################################################
#########################################################################################################
class PermissionResponse(LocalizedResponse):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    path: str
    label: str
    description: str
    grantable: bool
    children: List["PermissionResponse"] = Field(default_factory=list)

    @field_validator("path", mode="before")
    @classmethod
    def stringify_path(cls, value) -> str:
        return str(value)

