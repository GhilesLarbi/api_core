from app.repositories.base_repository import BaseRepository
from app.models import Admin, AdminPermission, Permission
from app.schemas.admin import AdminSortBy, AdminSortDirection
from sqlalchemy import select, update, delete, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy_utils import Ltree
from typing import Dict, Any, List, Optional, Tuple
import uuid

#########################################################################################################
#########################################################################################################
class AdminRepository(BaseRepository):
    #########################################################################################################
    #########################################################################################################
    async def get_by_id(self, admin_id: uuid.UUID) -> Admin | None:
        """Gets an admin by ID, with their granted permissions loaded.

        The grants are eager-loaded because the response carries them: leaving them lazy would mean
        the relationship is touched during serialization, which raises under asyncpg.

        `populate_existing` makes this read authoritative. Sessions are opened with
        expire_on_commit=False, so an admin already in the identity map keeps whatever its
        relationship held when it was first loaded, and the read a write does right after committing
        would hand back the state from before that write."""
        stmt = (
            select(Admin)
            .options(selectinload(Admin.permissions))
            .where(Admin.id == admin_id)
            .execution_options(populate_existing=True)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def get_by_email(self, email: str) -> Admin | None:
        """Gets an admin by email, with their granted permissions loaded."""
        stmt = (
            select(Admin)
            .options(selectinload(Admin.permissions))
            .where(func.lower(Admin.email) == email.lower())
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def list_all(
        self,
        q: Optional[str] = None,
        sort_by: AdminSortBy = AdminSortBy.CREATED_AT,
        sort_direction: AdminSortDirection = AdminSortDirection.DESC,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Admin], int]:
        """Lists admins (paginated); when q is given, case-insensitively matches email, first name or
        last name. Returns (items, total matching count).

        The count is taken from the filtered query before the grants are eager-loaded, so it stays a
        plain row count rather than being affected by the join."""
        stmt = select(Admin)
        if q:
            pattern = f"%{q}%"
            stmt = stmt.where(
                or_(Admin.email.ilike(pattern), Admin.first_name.ilike(pattern), Admin.last_name.ilike(pattern))
            )

        total = await self.session.scalar(select(func.count()).select_from(stmt.subquery()))

        sort_columns = {
            AdminSortBy.EMAIL: Admin.email,
            AdminSortBy.FIRST_NAME: Admin.first_name,
            AdminSortBy.LAST_NAME: Admin.last_name,
            AdminSortBy.CREATED_AT: Admin.created_at,
        }
        sort_column = sort_columns[sort_by]
        order_by = sort_column.asc() if sort_direction == AdminSortDirection.ASC else sort_column.desc()

        stmt = (
            stmt.options(selectinload(Admin.permissions))
            .order_by(order_by)
            .offset((page - 1) * limit)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return result.scalars().all(), total

    #########################################################################################################
    #########################################################################################################
    async def has_permission(
        self,
        admin_id: uuid.UUID,
        path: str,
    ) -> bool:
        """Whether the admin holds this exact permission.

        Only leaves are grantable, so the match is plain equality on the path rather than an ancestor
        test: holding `admins` is not a thing that can happen."""
        stmt = (
            select(AdminPermission.admin_id)
            .join(Permission, Permission.id == AdminPermission.permission_id)
            .where(AdminPermission.admin_id == admin_id, Permission.path == Ltree(path))
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.first() is not None

    #########################################################################################################
    #########################################################################################################
    async def get_grantable_by_paths(self, paths: List[str]) -> List[Permission]:
        """The grantable permissions among the given paths. A caller comparing the count against what it
        asked for learns in one query that every path exists in the table and is a leaf."""
        if not paths:
            return []
        stmt = select(Permission).where(
            Permission.path.in_([Ltree(path) for path in paths]),
            Permission.grantable.is_(True),
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    #########################################################################################################
    #########################################################################################################
    async def replace_permissions(
        self,
        admin_id: uuid.UUID,
        permission_ids: List[uuid.UUID],
    ) -> None:
        """Makes the admin's grants exactly this set. `grantable` is generated by the database and never
        written here, so a row pointing at a branch has nowhere to resolve through the foreign key."""
        await self.session.execute(delete(AdminPermission).where(AdminPermission.admin_id == admin_id))
        for permission_id in permission_ids:
            self.session.add(AdminPermission(admin_id=admin_id, permission_id=permission_id))

    #########################################################################################################
    #########################################################################################################
    async def create(self, data: Dict[str, Any]) -> Admin:
        db_admin = Admin(**data)
        self.session.add(db_admin)
        return db_admin

    #########################################################################################################
    #########################################################################################################
    async def update(self, admin_id: uuid.UUID, data: Dict[str, Any]) -> Admin | None:
        stmt = (
            update(Admin)
            .where(Admin.id == admin_id)
            .values(**data)
            .returning(Admin)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    #########################################################################################################
    #########################################################################################################
    async def delete(self, admin_id: uuid.UUID) -> bool:
        stmt = delete(Admin).where(Admin.id == admin_id)
        result = await self.session.execute(stmt)
        return result.rowcount > 0
