from contextvars import ContextVar
from typing import Optional

from app.core.settings import settings
from app.core.language.enums import Lang

lang: ContextVar[Lang] = ContextVar("lang", default=settings.DEFAULT_LANG)

#########################################################################################################
#########################################################################################################
def get_current_lang() -> Lang:
    return lang.get()

#########################################################################################################
#########################################################################################################
def resolve_lang(accept_language: Optional[str]) -> Lang:
    """Parses an Accept-Language header value to a supported Lang, honouring q-weights and region
    codes (e.g. en-US); falls back to settings.DEFAULT_LANG when nothing supported matches."""
    if not accept_language:
        return settings.DEFAULT_LANG

    supported = {member.value for member in Lang}
    candidates: list[tuple[float, str]] = []
    for part in accept_language.split(","):
        tag, _, params = part.strip().partition(";")
        code = tag.strip().lower().split("-")[0]
        if code not in supported:
            continue
        weight = 1.0
        if params.startswith("q="):
            try:
                weight = float(params[2:])
            except ValueError:
                weight = 1.0
        candidates.append((weight, code))

    if not candidates:
        return settings.DEFAULT_LANG
    candidates.sort(key=lambda candidate: candidate[0], reverse=True)
    return Lang(candidates[0][1])
