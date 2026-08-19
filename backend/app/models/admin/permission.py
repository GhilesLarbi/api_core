from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, Boolean, Index, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.sql import func
from sqlalchemy_utils import Ltree, LtreeType
from app.models.base import Base
from app.models.types import PydanticType
from app.schemas.permission import PermissionLang
import uuid

from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.admin.admin import Admin

#########################################################################################################
#########################################################################################################
class Permission(Base):

    __tablename__ = "permissions"
    __table_args__ = (
        UniqueConstraint("id", "grantable", name="uq_permission_id_grantable"),
        Index("idx_permission_path", "path", unique=True),
        Index("idx_permission_path_gist", "path", postgresql_using="gist"),
        {"comment": "Seeded tree of admin permissions."},
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    path: Mapped[Ltree] = mapped_column(LtreeType, nullable=False)
    grantable: Mapped[bool] = mapped_column(Boolean, nullable=False)

    label: Mapped[PermissionLang] = mapped_column(PydanticType(PermissionLang), nullable=False)
    description: Mapped[PermissionLang] = mapped_column(PydanticType(PermissionLang), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    admins: Mapped[List["Admin"]] = relationship(secondary="admin_permissions", viewonly=True, order_by="Admin.email")
