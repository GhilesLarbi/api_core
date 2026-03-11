from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from app.models.base import Base
import uuid

from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .. import Profile

class User(Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    first_name: Mapped[str] = mapped_column(String, unique=False, index=True, nullable=True)
    last_name: Mapped[str] = mapped_column(String, unique=False, index=True, nullable=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=True)

    # Relationships
    profiles: Mapped[List["Profile"]] = relationship(back_populates="user", cascade="all, delete-orphan")