from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Optional, List, Tuple
from app.services.base_service import BaseService
from app.models import User
from app.models.session.enums import OwnerType
from app.schemas import user as user_schemas, session as session_schemas
from app.core.security import (
    get_password_hash,
    verify_password,
    hash_token,
    decode_password_reset_token,
    decode_email_verification_token,
    decode_email_change_token,
)
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode
from app.clients.haveibeenpwned.client import HaveibeenpwnedClient
from app.core.storage.client import StorageClient

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.services.auth.auth_service import AuthService
    from app.repositories import UserRepository

#########################################################################################################
#########################################################################################################
class UserService(BaseService):
    #########################################################################################################
    #########################################################################################################
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    #########################################################################################################
    #########################################################################################################
    @property
    def user_repo(self) -> "UserRepository":
        return self.provider.user_repo

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
    async def register_new_user(
        self,
        user_create: user_schemas.UserCreate,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> user_schemas.UserTokenResponse:
        existing = await self.user_repo.get_by_email(email=user_create.email)
        if existing:
            raise AppError(error_code=ErrorCode.ALREADY_EXISTS)

        user_data = user_create.model_dump(mode="json")
        password = user_data.pop("password")
        await self._ensure_password_uncompromised(password=password)
        user_data["hashed_password"] = get_password_hash(password=password)

        db_user = await self.user_repo.create(user_data)
        await self.session.commit()
        db_user = await self.user_repo.get_by_id(user_id=db_user.id)

        access_token, refresh_token = await self.auth_service.start_session(
            owner_type=OwnerType.USER,
            owner_id=db_user.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        return user_schemas.UserTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=db_user,
        )

    #########################################################################################################
    #########################################################################################################
    async def authenticate_user(
        self,
        email: str,
        password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> user_schemas.UserTokenResponse:
        db_user = await self.user_repo.get_by_email(email=email)
        if not db_user or not verify_password(plain_password=password, hashed_password=db_user.hashed_password):
            raise AppError(error_code=ErrorCode.UNAUTHORIZED_ACCESS)

        access_token, refresh_token = await self.auth_service.start_session(
            owner_type=OwnerType.USER,
            owner_id=db_user.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        return user_schemas.UserTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=db_user,
        )

    #########################################################################################################
    #########################################################################################################
    async def refresh_access_token(
        self,
        refresh_token: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> user_schemas.UserTokenResponse:
        access_token, new_refresh_token, owner_id = await self.auth_service.rotate_refresh(
            refresh_token=refresh_token,
            owner_type=OwnerType.USER,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db_user = await self.user_repo.get_by_id(user_id=owner_id)
        return user_schemas.UserTokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            user=db_user,
        )

    #########################################################################################################
    #########################################################################################################
    async def change_password(
        self,
        user_id: UUID,
        old_password: str,
        new_password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> user_schemas.UserTokenResponse:
        db_user = await self.get_user_for_response(user_id)
        if not verify_password(plain_password=old_password, hashed_password=db_user.hashed_password):
            raise AppError(error_code=ErrorCode.BAD_REQUEST)
        await self._ensure_password_uncompromised(password=new_password)

        await self.user_repo.update(
            user_id=user_id,
            data={"hashed_password": get_password_hash(password=new_password)},
        )
        await self.session.commit()
        await self.auth_service.revoke_all_sessions(owner_type=OwnerType.USER, owner_id=user_id)

        access_token, refresh_token = await self.auth_service.start_session(
            owner_type=OwnerType.USER,
            owner_id=user_id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db_user = await self.user_repo.get_by_id(user_id=user_id)
        return user_schemas.UserTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=db_user,
        )

    #########################################################################################################
    #########################################################################################################
    async def reset_password(
        self,
        token: str,
        new_password: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> user_schemas.UserTokenResponse:
        payload = decode_password_reset_token(token)
        if not payload:
            raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

        db_user = await self.user_repo.get_by_id(user_id=UUID(payload["sub"]))
        if not db_user or payload.get("pfp") != hash_token(token=db_user.hashed_password):
            raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)
        await self._ensure_password_uncompromised(password=new_password)

        await self.user_repo.update(
            user_id=db_user.id,
            data={"hashed_password": get_password_hash(password=new_password)},
        )
        await self.session.commit()
        await self.auth_service.revoke_all_sessions(owner_type=OwnerType.USER, owner_id=db_user.id)

        access_token, refresh_token = await self.auth_service.start_session(
            owner_type=OwnerType.USER,
            owner_id=db_user.id,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db_user = await self.user_repo.get_by_id(user_id=db_user.id)
        return user_schemas.UserTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=db_user,
        )

    #########################################################################################################
    #########################################################################################################
    async def verify_email(self, token: str) -> bool:
        payload = decode_email_verification_token(token)
        if not payload:
            return False

        db_user = await self.user_repo.get_by_id(user_id=UUID(payload["sub"]))
        if not db_user:
            return False

        await self.user_repo.update(
            user_id=db_user.id,
            data={"email_verified_at": datetime.now(tz=timezone.utc)},
        )
        await self.session.commit()
        return True

    #########################################################################################################
    #########################################################################################################
    async def confirm_email_change(self, token: str) -> bool:
        payload = decode_email_change_token(token)
        if not payload:
            return False

        db_user = await self.user_repo.get_by_id(user_id=UUID(payload["sub"]))
        if not db_user or payload.get("pfp") != hash_token(token=db_user.email):
            return False

        new_email = payload["email"]
        existing = await self.user_repo.get_by_email(email=new_email)
        if existing and existing.id != db_user.id:
            return False

        await self.user_repo.update(
            user_id=db_user.id,
            data={"email": new_email, "email_verified_at": datetime.now(tz=timezone.utc)},
        )
        await self.session.commit()
        return True

    #########################################################################################################
    #########################################################################################################
    async def list_sessions(
        self,
        user_id: UUID,
        page: int = 1,
        size: int = 20,
    ) -> session_schemas.SessionListResponse:
        return await self.auth_service.list_sessions(
            owner_type=OwnerType.USER,
            owner_id=user_id,
            page=page,
            size=size,
        )

    #########################################################################################################
    #########################################################################################################
    async def revoke_sessions(
        self,
        user_id: UUID,
        session_ids: List[UUID],
    ) -> int:
        return await self.auth_service.revoke_sessions(
            owner_type=OwnerType.USER,
            owner_id=user_id,
            session_ids=session_ids,
        )

    #########################################################################################################
    #########################################################################################################
    async def get_user(self, user_id: UUID) -> Optional[User]:
        return await self.user_repo.get_by_id(user_id)

    #########################################################################################################
    #########################################################################################################
    async def get_user_for_response(self, user_id: UUID) -> User:
        user = await self.get_user(user_id)
        if not user:
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)
        return user

    #########################################################################################################
    #########################################################################################################
    async def update_user(self, user_id: UUID, user_update: user_schemas.UserUpdate) -> User:
        await self.get_user_for_response(user_id)
        update_data = user_update.model_dump(mode="json", exclude_unset=True)
        if update_data.get("avatar_url"):
            update_data["avatar_url"] = await StorageClient.copy_to_permanent_storage(
                url=update_data["avatar_url"],
                owner_type=OwnerType.USER,
                owner_id=user_id,
            )
        await self.user_repo.update(user_id=user_id, data=update_data)
        await self.session.commit()
        return await self.user_repo.get_by_id(user_id)

    #########################################################################################################
    #########################################################################################################
    async def list_users(
        self,
        q: Optional[str] = None,
        sort_by: user_schemas.UserSortBy = user_schemas.UserSortBy.CREATED_AT,
        sort_direction: user_schemas.UserSortDirection = user_schemas.UserSortDirection.DESC,
        page: int = 1,
        limit: int = 10,
    ) -> Tuple[List[User], int]:
        return await self.user_repo.list_all(
            q=q,
            sort_by=sort_by,
            sort_direction=sort_direction,
            page=page,
            limit=limit,
        )

    #########################################################################################################
    #########################################################################################################
    async def admin_create_user(self, user_create: user_schemas.UserAdminCreate) -> User:
        existing = await self.user_repo.get_by_email(email=user_create.email)
        if existing:
            raise AppError(error_code=ErrorCode.ALREADY_EXISTS)

        user_data = user_create.model_dump(mode="json")
        password = user_data.pop("password")
        await self._ensure_password_uncompromised(password=password)
        user_data["hashed_password"] = get_password_hash(password=password)

        user_data["id"] = uuid4()
        if user_data.get("avatar_url"):
            user_data["avatar_url"] = await StorageClient.copy_to_permanent_storage(
                url=user_data["avatar_url"],
                owner_type=OwnerType.USER,
                owner_id=user_data["id"],
            )

        db_user = await self.user_repo.create(user_data)
        await self.session.commit()
        return await self.user_repo.get_by_id(user_id=db_user.id)

    #########################################################################################################
    #########################################################################################################
    async def admin_update_user(
        self,
        user_id: UUID,
        user_update: user_schemas.UserAdminUpdate,
    ) -> User:
        await self.get_user_for_response(user_id)
        update_data = user_update.model_dump(mode="json", exclude_unset=True)

        if update_data.get("email"):
            taken = await self.user_repo.get_by_email(email=update_data["email"])
            if taken and taken.id != user_id:
                raise AppError(error_code=ErrorCode.ALREADY_EXISTS)

        if update_data.get("avatar_url"):
            update_data["avatar_url"] = await StorageClient.copy_to_permanent_storage(
                url=update_data["avatar_url"],
                owner_type=OwnerType.USER,
                owner_id=user_id,
            )

        await self.user_repo.update(user_id=user_id, data=update_data)
        await self.session.commit()
        return await self.user_repo.get_by_id(user_id)

    #########################################################################################################
    #########################################################################################################
    async def delete_user(self, user_id: UUID) -> bool:
        await self.auth_service.revoke_all_sessions(owner_type=OwnerType.USER, owner_id=user_id)
        await self.user_repo.delete(user_id)
        await self.session.commit()
        return True

    #########################################################################################################
    #########################################################################################################
    async def send_password_reset_email(self, email: str) -> None:
        user = await self.user_repo.get_by_email(email=email)
        if not user:
            return
        await self.provider.notification_service.send_password_reset(user_id=user.id)

    #########################################################################################################
    #########################################################################################################
    async def send_verification_email(self, user_id: UUID) -> None:
        await self.provider.notification_service.send_email_verification(user_id=user_id)

    #########################################################################################################
    #########################################################################################################
    async def check_email_available(self, new_email: str) -> None:
        existing = await self.user_repo.get_by_email(email=new_email)
        if existing:
            raise AppError(error_code=ErrorCode.ALREADY_EXISTS)

    #########################################################################################################
    #########################################################################################################
    async def send_email_change_email(
        self,
        user_id: UUID,
        new_email: str,
    ) -> None:
        await self.provider.notification_service.send_email_change(user_id=user_id, new_email=new_email)
