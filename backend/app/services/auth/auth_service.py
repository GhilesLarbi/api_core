from uuid import UUID, uuid4
from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, List, Optional, Tuple

from app.services.base_service import BaseService
from app.models.session.enums import OwnerType
from app.schemas import session as session_schemas
from app.core.settings import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_token,
    decode_token,
)
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.repositories import SessionRepository

#########################################################################################################
#########################################################################################################
class AuthService(BaseService):
    """Session-only helpers, generic over `owner_type` + `owner_id`.

    Deals exclusively with the sessions table and access/refresh tokens — it
    never touches an account entity or its repository. User and Admin
    services do their own entity wiring and call these helpers for sessions.
    """

    #########################################################################################################
    #########################################################################################################
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)

    #########################################################################################################
    #########################################################################################################
    @property
    def session_repo(self) -> "SessionRepository":
        return self.provider.session_repo

    #########################################################################################################
    #########################################################################################################
    async def start_session(
        self,
        owner_type: OwnerType,
        owner_id: UUID,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[str, str]:
        session_id = uuid4()
        refresh_token = create_refresh_token(subject=str(owner_id), session_id=str(session_id))
        await self.session_repo.create(
            data={
                "id": session_id,
                "owner_type": owner_type,
                "owner_id": owner_id,
                "refresh_token_hash": hash_token(token=refresh_token),
                "expires_at": datetime.now(tz=timezone.utc) + timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE),
                "user_agent": user_agent,
                "ip_address": ip_address,
            }
        )
        await self.session.commit()
        access_token = create_access_token(subject=owner_id)
        return access_token, refresh_token

    #########################################################################################################
    #########################################################################################################
    async def list_sessions(
        self,
        owner_type: OwnerType,
        owner_id: UUID,
        page: int = 1,
        size: int = 20,
    ) -> session_schemas.SessionListResponse:
        skip = (page - 1) * size
        items = await self.session_repo.list_by_owner(
            owner_type=owner_type,
            owner_id=owner_id,
            skip=skip,
            limit=size,
        )
        total = await self.session_repo.count_by_owner(owner_type=owner_type, owner_id=owner_id)
        pages = (total + size - 1) // size if size else 0
        return session_schemas.SessionListResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=pages,
        )

    #########################################################################################################
    #########################################################################################################
    async def revoke_sessions(
        self,
        owner_type: OwnerType,
        owner_id: UUID,
        session_ids: List[UUID],
    ) -> int:
        revoked = await self.session_repo.revoke_by_ids(
            owner_type=owner_type,
            owner_id=owner_id,
            session_ids=session_ids,
        )
        await self.session.commit()
        return revoked

    #########################################################################################################
    #########################################################################################################
    async def revoke_all_sessions(
        self,
        owner_type: OwnerType,
        owner_id: UUID,
    ) -> int:
        revoked = await self.session_repo.revoke_all_by_owner(owner_type=owner_type, owner_id=owner_id)
        await self.session.commit()
        return revoked

    #########################################################################################################
    #########################################################################################################
    async def rotate_refresh(
        self,
        refresh_token: str,
        owner_type: OwnerType,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Tuple[str, str, UUID]:
        payload = decode_token(token=refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

        session_id = payload.get("sid")
        subject = payload.get("sub")
        if not session_id or not subject:
            raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

        db_session = await self.session_repo.get_by_id(session_id=UUID(session_id))
        if (
            not db_session
            or db_session.owner_type != owner_type
            or db_session.expires_at <= datetime.now(tz=timezone.utc)
        ):
            raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

        # Reuse detection: a stale/stolen refresh token → burn the whole session.
        if db_session.refresh_token_hash != hash_token(token=refresh_token):
            await self.session_repo.revoke_by_ids(
                owner_type=owner_type,
                owner_id=db_session.owner_id,
                session_ids=[db_session.id],
            )
            await self.session.commit()
            raise AppError(error_code=ErrorCode.INVALID_OR_EXPIRED_TOKEN)

        # Rotate the refresh token in place.
        new_refresh_token = create_refresh_token(subject=str(db_session.owner_id), session_id=str(db_session.id))
        await self.session_repo.update(
            session_id=db_session.id,
            data={
                "refresh_token_hash": hash_token(token=new_refresh_token),
                "last_used_at": datetime.now(tz=timezone.utc),
            },
        )
        await self.session.commit()

        access_token = create_access_token(subject=db_session.owner_id)
        return access_token, new_refresh_token, db_session.owner_id
