from tenacity import retry, stop_after_attempt

from app.core.http_client import http_client
from app.core.settings import settings

#########################################################################################################
#########################################################################################################
class HaveibeenpwnedApi:
    BASE_URL = "https://api.pwnedpasswords.com"

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    @retry(reraise=True, stop=stop_after_attempt(3))
    async def range(hash_prefix: str) -> str:
        async with http_client() as client:
            response = await client.get(
                f"{HaveibeenpwnedApi.BASE_URL}/range/{hash_prefix}",
                headers={"Add-Padding": "true"},
                timeout=settings.REQUESTS_TIME_OUT,
            )
            response.raise_for_status()
            return response.text
