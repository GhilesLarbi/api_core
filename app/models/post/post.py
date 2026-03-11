from __future__ import annotations

from sqlalchemy import ForeignKey, DateTime, Boolean, null
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.sql import func
from app.models.base import Base
from typing import TYPE_CHECKING

from datetime import datetime, timezone
import uuid

if TYPE_CHECKING:
    from .. import Profile


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    scheduled_time: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True, default=None, server_default=null(), index=True)

    is_approved : Mapped[bool] = mapped_column(Boolean, nullable=True, default=None, server_default=null())

    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=lambda: datetime.now(timezone.utc), default=lambda: datetime.now(timezone.utc))

    profile_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    profile: Mapped["Profile"] = relationship(back_populates="posts")