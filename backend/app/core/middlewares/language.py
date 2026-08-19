"""Pure ASGI middleware that resolves the request's language from the Accept-Language header and
stores it in the lang ContextVar before anything else runs — so endpoints, services and the
exception handlers can all read it via get_current_lang() without threading it through calls."""

from starlette.datastructures import Headers
from starlette.types import ASGIApp, Receive, Scope, Send

from app.core.language.language import lang, resolve_lang

#########################################################################################################
#########################################################################################################
class LanguageMiddleware:
    #########################################################################################################
    #########################################################################################################
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    #########################################################################################################
    #########################################################################################################
    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = Headers(scope=scope)
        token = lang.set(resolve_lang(headers.get("accept-language")))
        try:
            await self.app(scope, receive, send)
        finally:
            lang.reset(token)
