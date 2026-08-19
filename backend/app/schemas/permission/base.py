from typing import Optional
from app.schemas.common import ShortStr, MultilingualBase

#########################################################################################################
#########################################################################################################
class PermissionLang(MultilingualBase):
    fr: Optional[ShortStr] = None
    en: Optional[ShortStr] = None
    ar: Optional[ShortStr] = None
