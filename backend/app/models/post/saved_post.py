from __future__ import annotations

from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from app.models.base import Base

#########################################################################################################
#########################################################################################################
class SavedPost(Base):
    __tablename__ = "saved_posts"
    __table_args__ = (
        Index("idx_saved_post_post_id", "post_id"),
        {"comment": "Posts a user saved."},
    )

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    post_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
