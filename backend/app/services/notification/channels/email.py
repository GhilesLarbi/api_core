from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType

from app.core.settings import settings
from app.core.secrets import secrets
from app.services.notification.channels.base import ChannelType, NotificationChannel

#########################################################################################################
#########################################################################################################
class EmailChannel(NotificationChannel):
    """SMTP email transport via fastapi-mail."""

    channel_type = ChannelType.EMAIL

    #########################################################################################################
    #########################################################################################################
    def __init__(self) -> None:
        self._config = ConnectionConfig(
            MAIL_USERNAME=secrets.MAIL_USERNAME,
            MAIL_PASSWORD=secrets.MAIL_PASSWORD,
            MAIL_FROM=secrets.MAIL_FROM,
            MAIL_PORT=secrets.MAIL_PORT,
            MAIL_SERVER=secrets.MAIL_SERVER,
            MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
            MAIL_STARTTLS=settings.MAIL_STARTTLS,
            MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
            USE_CREDENTIALS=True,
            VALIDATE_CERTS=True,
        )
        self._client = FastMail(self._config)

    #########################################################################################################
    #########################################################################################################
    async def send(self, *, recipient: str, subject: str, body: str) -> None:
        message = MessageSchema(
            subject=subject,
            recipients=[recipient],
            body=body,
            subtype=MessageType.html,
        )
        await self._client.send_message(message)
