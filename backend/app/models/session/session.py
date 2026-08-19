from __future__ import annotations

from datetime import datetime
from sqlalchemy import String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped
from sqlalchemy.sql import func
from app.models.base import Base
from app.models.session.enums import OwnerType
import uuid

from typing import Optional

#########################################################################################################
#########################################################################################################
class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    owner_type: Mapped[OwnerType] = mapped_column(SQLEnum(OwnerType, name="owner_type"), nullable=False, index=True)
    owner_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)

    refresh_token_hash: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    user_agent: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
