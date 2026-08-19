from uuid import UUID, uuid4
from typing import TYPE_CHECKING, List, Optional, Tuple
from app.services.base_service import BaseService
from app.models import Admin
from app.models.session.enums import OwnerType
from app.schemas import admin as admin_schemas, session as session_schemas
from app.core.security import get_password_hash, verify_password
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode
from app.clients.haveibeenpwned.client import HaveibeenpwnedClient
from app.core.storage.client import StorageClient

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.services.auth.auth_service import AuthService
    from app.repositories import AdminRepository

#########################################################################################################
#########################################################################################################
class AdminService(BaseService):
    #########################################################################################################
    #########################################################################################################
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    #########################################################################################################
    #########################################################################################################
    @property
    def admin_repo(self) -> "AdminRepository":
        return self.provider.admin_repo

    #########################################################################################################
    #########################################################################################################
    @property
    def auth_service(self) -> "AuthService":
        return self.provider.auth_service

    #########################################################################################################
    #########################################################################################################
    async def _ensure_password_uncompromised(self, password: str) -> None:
        if await HaveibeenpwnedClient.is_password_compromised(password=password):
            raise AppError(error_code=ErrorCode.COMPROMISED_PASSWORD)

    #########################################################################################################
    #########################################################################################################
    async def authenticate_admin(
        self,
        email: str,
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> admin_schemas.AdminTokenResponse:
        db_admin = await self.admin_repo.get_by_email(email=email)
        if not db_admin or not db_admin.hashed_password or not verify_password(
            plain_password=password,
            hashed_password=db_admin.hashed_password,
        ):
            raise AppError(error_code=ErrorCode.UNAUTHORIZED_ACCESS)

        access_token, refresh_token = await self.auth_service.start_session(
            owner_type=OwnerType.ADMIN,
            owner_id=db_admin.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        return admin_schemas.AdminTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            admin=db_admin,
        )

    #########################################################################################################
    #########################################################################################################
    async def refresh_access_token(
        self,
        refresh_token: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> admin_schemas.AdminTokenResponse:
        access_token, new_refresh_token, owner_id = await self.auth_service.rotate_refresh(
            refresh_token=refresh_token,
            owner_type=OwnerType.ADMIN,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db_admin = await self.admin_repo.get_by_id(admin_id=owner_id)
        return admin_schemas.AdminTokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            admin=db_admin,
        )

    #########################################################################################################
    #########################################################################################################
    async def change_password(
        self,
        admin_id: UUID,
        old_password: str,
        new_password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> admin_schemas.AdminTokenResponse:
        db_admin = await self.get_admin_for_response(admin_id)
        if not db_admin.hashed_password or not verify_password(
            plain_password=old_password,
            hashed_password=db_admin.hashed_password,
        ):
            raise AppError(error_code=ErrorCode.BAD_REQUEST)
        await self._ensure_password_uncompromised(password=new_password)

        await self.admin_repo.update(
            admin_id=admin_id,
            data={"hashed_password": get_password_hash(password=new_password)},
        )
        await self.session.commit()
        await self.auth_service.revoke_all_sessions(owner_type=OwnerType.ADMIN, owner_id=admin_id)

        access_token, refresh_token = await self.auth_service.start_session(
            owner_type=OwnerType.ADMIN,
            owner_id=admin_id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db_admin = await self.admin_repo.get_by_id(admin_id=admin_id)
        return admin_schemas.AdminTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            admin=db_admin,
        )

    #########################################################################################################
    #########################################################################################################
    async def list_sessions(
        self,
        admin_id: UUID,
        page: int = 1,
        size: int = 20,
    ) -> session_schemas.SessionListResponse:
        return await self.auth_service.list_sessions(
            owner_type=OwnerType.ADMIN,
            owner_id=admin_id,
            page=page,
            size=size,
        )

    #########################################################################################################
    #########################################################################################################
    async def revoke_sessions(
        self,
        admin_id: UUID,
        session_ids: List[UUID],
    ) -> int:
        return await self.auth_service.revoke_sessions(
            owner_type=OwnerType.ADMIN,
            owner_id=admin_id,
            session_ids=session_ids,
        )

    #########################################################################################################
    #########################################################################################################
    async def create_admin(self, admin_create: admin_schemas.AdminCreate) -> Admin:
        """Creates an admin with no permissions. Granting is a separate action behind its own leaf, so
        the account starts able to sign in and nothing else."""
        existing = await self.admin_repo.get_by_email(email=admin_create.email)
        if existing:
            raise AppError(error_code=ErrorCode.ALREADY_EXISTS)

        admin_data = admin_create.model_dump(mode="json")
        password = admin_data.pop("password")
        await self._ensure_password_uncompromised(password=password)
        admin_data["hashed_password"] = get_password_hash(password=password)

        admin_data["id"] = uuid4()
        if admin_data.get("avatar_url"):
            admin_data["avatar_url"] = await StorageClient.copy_to_permanent_storage(
                url=admin_data["avatar_url"],
                owner_type=OwnerType.ADMIN,
                owner_id=admin_data["id"],
            )

        db_admin = await self.admin_repo.create(admin_data)
        await self.session.commit()
        return await self.admin_repo.get_by_id(admin_id=db_admin.id)

    #########################################################################################################
    #########################################################################################################
    async def list_admins(
        self,
        q: Optional[str] = None,
        sort_by: admin_schemas.AdminSortBy = admin_schemas.AdminSortBy.CREATED_AT,
        sort_direction: admin_schemas.AdminSortDirection = admin_schemas.AdminSortDirection.DESC,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[Admin], int]:
        return await self.admin_repo.list_all(
            q=q,
            sort_by=sort_by,
            sort_direction=sort_direction,
            page=page,
            limit=limit,
        )

    #########################################################################################################
    #########################################################################################################
    async def get_admin(self, admin_id: UUID) -> Optional[Admin]:
        return await self.admin_repo.get_by_id(admin_id)

    #########################################################################################################
    #########################################################################################################
    async def get_admin_for_response(self, admin_id: UUID) -> Admin:
        admin = await self.get_admin(admin_id)
        if not admin:
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)
        return admin

    #########################################################################################################
    #########################################################################################################
    async def has_permission(
        self,
        admin_id: UUID,
        path: str,
    ) -> bool:
        return await self.admin_repo.has_permission(admin_id=admin_id, path=path)

    #########################################################################################################
    #########################################################################################################
    async def _write_update(
        self,
        admin_id: UUID,
        update_data: dict,
        password_changed: bool,
    ) -> Admin:
        """The half both update paths share: the email must stay unique, an avatar has to be moved out
        of temporary storage, and a changed password ends every session that admin had open."""
        if update_data.get("email"):
            taken = await self.admin_repo.get_by_email(email=update_data["email"])
            if taken and taken.id != admin_id:
                raise AppError(error_code=ErrorCode.ALREADY_EXISTS)

        if update_data.get("avatar_url"):
            update_data["avatar_url"] = await StorageClient.copy_to_permanent_storage(
                url=update_data["avatar_url"],
                owner_type=OwnerType.ADMIN,
                owner_id=admin_id,
            )

        await self.admin_repo.update(admin_id=admin_id, data=update_data)
        await self.session.commit()

        if password_changed:
            await self.auth_service.revoke_all_sessions(owner_type=OwnerType.ADMIN, owner_id=admin_id)

        return await self.admin_repo.get_by_id(admin_id)

    #########################################################################################################
    #########################################################################################################
    async def update_admin(
        self,
        admin_id: UUID,
        admin_update: admin_schemas.AdminUpdate,
    ) -> Admin:
        """An admin editing their own record. Replacing the password means proving the current one."""
        db_admin = await self.get_admin_for_response(admin_id)
        update_data = admin_update.model_dump(mode="json", exclude_unset=True)
        old_password = update_data.pop("old_password", None)
        new_password = update_data.pop("new_password", None)

        if new_password:
            if not old_password or not db_admin.hashed_password or not verify_password(
                plain_password=old_password,
                hashed_password=db_admin.hashed_password,
            ):
                raise AppError(error_code=ErrorCode.BAD_REQUEST)
            await self._ensure_password_uncompromised(password=new_password)
            update_data["hashed_password"] = get_password_hash(password=new_password)

        return await self._write_update(
            admin_id=admin_id,
            update_data=update_data,
            password_changed=bool(new_password),
        )

    #########################################################################################################
    #########################################################################################################
    async def update_admin_profile(
        self,
        admin_id: UUID,
        admin_profile_update: admin_schemas.AdminProfileUpdate,
    ) -> Admin:
        """An admin editing someone else's record. Passwords are not reachable from here; setting one
        is its own action behind its own permission."""
        await self.get_admin_for_response(admin_id)
        return await self._write_update(
            admin_id=admin_id,
            update_data=admin_profile_update.model_dump(mode="json", exclude_unset=True),
            password_changed=False,
        )

    #########################################################################################################
    #########################################################################################################
    async def replace_permissions(
        self,
        admin_id: UUID,
        paths: List[str],
    ) -> Admin:
        """Makes the admin hold exactly these permissions and no others.

        The paths arrive already narrowed to declared leaves by the schema, so the only thing left to
        catch is one that has not been seeded into the table yet, which resolves to nothing."""
        await self.get_admin_for_response(admin_id)

        unique_paths = list(dict.fromkeys(paths))
        found = await self.admin_repo.get_grantable_by_paths(paths=unique_paths)
        if len(found) != len(unique_paths):
            raise AppError(error_code=ErrorCode.INVALID_PARAMETERS)

        await self.admin_repo.replace_permissions(
            admin_id=admin_id,
            permission_ids=[permission.id for permission in found],
        )
        await self.session.commit()
        return await self.admin_repo.get_by_id(admin_id)

    #########################################################################################################
    #########################################################################################################
    async def delete_admin(
        self,
        admin_id: UUID,
        requested_by_id: UUID,
    ) -> bool:
        """Deleting your own account is refused: there is no signup route to come back through, so it
        is the one deletion nobody can undo from inside the product."""
        if admin_id == requested_by_id:
            raise AppError(error_code=ErrorCode.BAD_REQUEST)

        await self.get_admin_for_response(admin_id)
        await self.auth_service.revoke_all_sessions(owner_type=OwnerType.ADMIN, owner_id=admin_id)
        await self.admin_repo.delete(admin_id)
        await self.session.commit()
        return True

    #########################################################################################################
    #########################################################################################################
    async def reset_admin_password(
        self,
        admin_id: UUID,
        password: str,
    ) -> Admin:
        """Sets another admin's password without their current one, for the case they have lost it.
        Every session that admin had open ends, since whoever held them may be why it is being reset."""
        await self.get_admin_for_response(admin_id)
        await self._ensure_password_uncompromised(password=password)
        return await self._write_update(
            admin_id=admin_id,
            update_data={"hashed_password": get_password_hash(password=password)},
            password_changed=True,
        )
