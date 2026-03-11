import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from app.core.secrets import secrets
from app.core.config import settings

################################################################################################################
################################################################################################################
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

################################################################################################################
################################################################################################################
def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_bytes)

################################################################################################################
################################################################################################################
def create_access_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(
        to_encode, 
        secrets.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )

################################################################################################################
################################################################################################################
def decode_access_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token, 
            secrets.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload.get("sub")
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None