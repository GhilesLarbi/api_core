from __future__ import annotations

from sqlalchemy import ForeignKey, DateTime, String, null
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.sql import func
from app.models.base import Base
import uuid

from typing import List, TYPE_CHECKING


if TYPE_CHECKING:
    from .. import (Post, User)


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name: Mapped[str] = mapped_column(String, unique=False, nullable=True, default=None, server_default=null())
    avatar_url: Mapped[str] = mapped_column(String, nullable=True, default=None, server_default=null())

    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # User Relationship
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    user: Mapped["User"] = relationship(back_populates="profiles")

    posts: Mapped[List["Post"]] = relationship(back_populates="profile", cascade="all, delete-orphan")