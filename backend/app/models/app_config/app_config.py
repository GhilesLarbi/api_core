from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Index, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from app.models.base import Base
import uuid

from typing import Optional

#########################################################################################################
#########################################################################################################
class AppConfig(Base):
    __tablename__ = "app_config"
    __table_args__ = (
        Index("idx_app_config_singleton", "is_singleton", unique=True),
        {"comment": "Application-wide settings an admin can change without a deploy."},
    )

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    is_singleton: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    maintenance_mode: Mapped[bool] = mapped_column(Boolean, default=False, server_default=text("false"), nullable=False)
    support_email: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
