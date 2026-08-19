from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.sql import func
from app.models.base import Base
import uuid

from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.admin.permission import Permission

#########################################################################################################
#########################################################################################################
class Admin(Base):

    __tablename__ = "admins"
    __table_args__ = (
        Index("idx_admin_email", "email", unique=True),
        {"comment": "Admin accounts that manage the platform."},
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    email: Mapped[str] = mapped_column(String, nullable=False)
    hashed_password: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    avatar_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    permissions: Mapped[List["Permission"]] = relationship(secondary="admin_permissions", viewonly=True, order_by="Permission.path")
