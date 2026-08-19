import bcrypt
import jwt
import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from app.core.secrets import secrets
from app.core.settings import settings

#########################################################################################################
#########################################################################################################
def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

#########################################################################################################
#########################################################################################################
def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_bytes)

#########################################################################################################
#########################################################################################################
def create_access_token(subject: str | int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(seconds=settings.ACCESS_TOKEN_EXPIRE)
    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(
        to_encode, 
        secrets.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )

#########################################################################################################
#########################################################################################################
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

#########################################################################################################
#########################################################################################################
def create_refresh_token(
    subject: str,
    session_id: str,
) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(seconds=settings.REFRESH_TOKEN_EXPIRE)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "sid": str(session_id),
        "type": "refresh",
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(
        payload=to_encode,
        key=secrets.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

#########################################################################################################
#########################################################################################################
def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

#########################################################################################################
#########################################################################################################
def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            jwt=token,
            key=secrets.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None

#########################################################################################################
#########################################################################################################
def create_password_reset_token(
    user_id: str,
    password_hash: str,
) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(seconds=settings.PASSWORD_RESET_TOKEN_EXPIRE)
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "type": "pwd_reset",
        "pfp": hash_token(token=password_hash),
    }
    return jwt.encode(
        payload=to_encode,
        key=secrets.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

#########################################################################################################
#########################################################################################################
def decode_password_reset_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            jwt=token,
            key=secrets.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None
    if payload.get("type") != "pwd_reset":
        return None
    return payload

#########################################################################################################
#########################################################################################################
def create_email_verification_token(user_id: str) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(seconds=settings.EMAIL_VERIFICATION_TOKEN_EXPIRE)
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "type": "email_verify",
    }
    return jwt.encode(
        payload=to_encode,
        key=secrets.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

#########################################################################################################
#########################################################################################################
def decode_email_verification_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            jwt=token,
            key=secrets.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None
    if payload.get("type") != "email_verify":
        return None
    return payload

#########################################################################################################
#########################################################################################################
def create_email_change_token(
    user_id: str,
    new_email: str,
    current_email: str,
) -> str:
    expire = datetime.now(tz=timezone.utc) + timedelta(seconds=settings.EMAIL_CHANGE_TOKEN_EXPIRE)
    to_encode = {
        "exp": expire,
        "sub": str(user_id),
        "email": new_email,
        "type": "email_change",
        "pfp": hash_token(token=current_email),
    }
    return jwt.encode(
        payload=to_encode,
        key=secrets.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )

#########################################################################################################
#########################################################################################################
def decode_email_change_token(token: str) -> dict | None:
    try:
        payload = jwt.decode(
            jwt=token,
            key=secrets.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None
    if payload.get("type") != "email_change":
        return None
    return payload