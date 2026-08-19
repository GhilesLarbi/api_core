import enum
from abc import ABC, abstractmethod

#########################################################################################################
#########################################################################################################
class ChannelType(str, enum.Enum):
    EMAIL = "email"
    # Future channels:
    # PUSH = "push"
    # WHATSAPP = "whatsapp"
    # SMS = "sms"

#########################################################################################################
#########################################################################################################
class NotificationChannel(ABC):
    """A delivery channel (email, push, whatsapp, ...). Transport only — no rendering."""

    channel_type: ChannelType

    #########################################################################################################
    #########################################################################################################
    @abstractmethod
    async def send(self, *, recipient: str, subject: str, body: str) -> None:
        """Deliver an already-rendered message to a single recipient."""
        ...
