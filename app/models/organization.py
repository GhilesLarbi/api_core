from __future__ import annotations
import uuid
from typing import List
from sqlalchemy import String, ARRAY, null
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from app.models.base import Base

from typing import TYPE_CHECKING

if TYPE_CHECKING : 
    from app.models.document import Document

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)    
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    url: Mapped[str | None] = mapped_column(String, nullable=True)
    documents: Mapped[List["Document"]] = relationship("Document", back_populates="organization", cascade="all, delete-orphan")