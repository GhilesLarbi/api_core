from __future__ import annotations

from sqlalchemy import Boolean, Computed, ForeignKey, ForeignKeyConstraint, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped
from app.models.base import Base

#########################################################################################################
#########################################################################################################
class AdminPermission(Base):

    __tablename__ = "admin_permissions"
    __table_args__ = (
        ForeignKeyConstraint(
            ["permission_id", "grantable"],
            ["permissions.id", "permissions.grantable"],
            name="fk_admin_permission_grantable",
            ondelete="RESTRICT",
        ),
        Index("idx_admin_permission_permission_id", "permission_id"),
        {"comment": "Permissions granted to each admin."},
    )

    admin_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("admins.id", ondelete="CASCADE"), primary_key=True)
    permission_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    grantable: Mapped[bool] = mapped_column(Boolean, Computed("true", persisted=True), nullable=False)
