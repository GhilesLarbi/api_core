from typing import TYPE_CHECKING, Any
from uuid import UUID

import structlog

from app.core.settings import settings
from app.core.templates import jinja_env
from app.core.security import create_password_reset_token, create_email_verification_token, create_email_change_token
from app.core.exceptions.exceptions import AppError
from app.core.exceptions.enums import ErrorCode
from app.core.logger import LogAction, LogEvent
from app.services.base_service import BaseService
from app.services.notification.channels import (
    ChannelType,
    EmailChannel,
    NotificationChannel,
)

if TYPE_CHECKING:
    from app.services.service_provider import ServiceProvider
    from app.models import User
    from app.repositories import UserRepository

logger = structlog.get_logger(__name__)

#########################################################################################################
#########################################################################################################
class NotificationService(BaseService):

    #########################################################################################################
    #########################################################################################################
    def __init__(self, provider: "ServiceProvider"):
        super().__init__(provider)
        self._channels: dict[ChannelType, NotificationChannel] = {
            ChannelType.EMAIL: EmailChannel(),
        }

    #########################################################################################################
    #########################################################################################################
    @property
    def user_repo(self) -> "UserRepository":
        return self.provider.user_repo

    #########################################################################################################
    #########################################################################################################
    async def send_email_verification(self, user_id: UUID) -> None:
        user = await self._get_user(user_id)
        await self._send_email(
            to=user.email,
            subject="Verify your email address",
            template="emails/email_verification_resend.html",
            context={
                "user_name": user.first_name or "",
                "verification_url": self._server_link("user/verify-email", create_email_verification_token(str(user.id))),
            },
        )

    #########################################################################################################
    #########################################################################################################
    async def send_email_change(
        self,
        user_id: UUID,
        new_email: str,
    ) -> None:
        user = await self._get_user(user_id)
        token = create_email_change_token(
            user_id=str(user.id),
            new_email=new_email,
            current_email=user.email,
        )
        await self._send_email(
            to=new_email,
            subject="Confirm your new email address",
            template="emails/confirm_email_change.html",
            context={
                "user_name": user.first_name or "",
                "verification_url": self._server_link("user/email-change/confirm", token),
            },
        )

    #########################################################################################################
    #########################################################################################################
    async def send_password_reset(self, user_id: UUID) -> None:
        user = await self._get_user(user_id)
        await self._send_email(
            to=user.email,
            subject="Reset your password",
            template="emails/reset_password.html",
            context={
                "reset_url": self._link(
                    host=settings.USER_WEB_HOST,
                    path="reset-password",
                    token=create_password_reset_token(user_id=str(user.id), password_hash=user.hashed_password),
                ),
            },
        )

    #########################################################################################################
    #########################################################################################################
    async def _get_user(self, user_id: UUID) -> "User":
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise AppError(error_code=ErrorCode.ITEM_NOT_FOUND)
        return user

    #########################################################################################################
    #########################################################################################################
    def _link(
        self,
        host: str,
        path: str,
        token: str,
    ) -> str:
        base = str(host).rstrip("/")
        return f"{base}/{path}?token={token}"

    #########################################################################################################
    #########################################################################################################
    def _server_link(
        self,
        path: str,
        token: str,
    ) -> str:
        base = str(settings.SERVER_HOST).rstrip("/")
        return f"{base}{settings.API_V1_STR}/{path}?token={token}"

    #########################################################################################################
    #########################################################################################################
    def _channel(self, channel_type: ChannelType) -> NotificationChannel:
        channel = self._channels.get(channel_type)
        if channel is None:
            raise ValueError(f"No channel registered for '{channel_type.value}'")
        return channel

    #########################################################################################################
    #########################################################################################################
    async def _send_email(
        self,
        *,
        to: str,
        subject: str,
        template: str,
        context: dict[str, Any],
    ) -> None:
        if not settings.SEND_EMAILS:
            logger.info(
                LogEvent.EMAIL_SUPPRESSED,
                action=LogAction.SERVER,
                to=to,
                subject=subject,
                template=template,
                context=context,
            )
            return
        body = jinja_env.get_template(template).render(**context)
        await self._channel(ChannelType.EMAIL).send(
            recipient=to, subject=subject, body=body
        )
