from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.sql import func
from app.models.base import Base
from app.models.types import PydanticListType
from app.schemas.post.base import PostMedia
import uuid

from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user.user import User

#########################################################################################################
#########################################################################################################
class Post(Base):
    __tablename__ = "posts"
    __table_args__ = (
        Index("idx_post_user_id", "user_id"),
        Index("idx_post_created_at", "created_at"),
        {"comment": "Posts published by users."},
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(String, nullable=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"), nullable=False)
    media: Mapped[List[PostMedia]] = mapped_column(PydanticListType(PostMedia), nullable=False, default=list, server_default=text("'[]'::jsonb"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    author: Mapped["User"] = relationship()
