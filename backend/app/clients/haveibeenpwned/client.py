import hashlib

from app.clients.haveibeenpwned.api import HaveibeenpwnedApi

#########################################################################################################
#########################################################################################################
class HaveibeenpwnedClient:

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    async def password_breach_count(password: str) -> int:
        sha1 = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
        prefix, suffix = sha1[:5], sha1[5:]
        body = await HaveibeenpwnedApi.range(hash_prefix=prefix)
        for line in body.splitlines():
            line_suffix, _, count = line.partition(":")
            if line_suffix == suffix:
                return int(count)
        return 0

    #########################################################################################################
    #########################################################################################################
    @staticmethod
    async def is_password_compromised(password: str) -> bool:
        return await HaveibeenpwnedClient.password_breach_count(password=password) > 0
