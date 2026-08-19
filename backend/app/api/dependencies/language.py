from typing import Annotated
from fastapi import Depends, Header
from pydantic import BeforeValidator

from app.core.settings import settings
from app.core.language.enums import Lang
from app.core.language.language import resolve_lang

# Header stays typed as Lang so Scalar still renders a fr/en/ar dropdown, but resolve_lang runs
# first and accepts realistic browser values (region codes, q-weights) instead of exact matches only.
LenientLang = Annotated[
    Lang,
    BeforeValidator(resolve_lang),
    Header(alias="Accept-Language"),
]

#########################################################################################################
#########################################################################################################
async def require_lang(accept_language: LenientLang = settings.DEFAULT_LANG) -> Lang:
    return accept_language


LangDep = Annotated[Lang, Depends(require_lang)]
