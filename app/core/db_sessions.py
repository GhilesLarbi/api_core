from typing import AsyncGenerator
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.secrets import secrets

#################################################################################################
#################################################################################################
def get_postgresql_url() -> str:
    DB_user = secrets.POSTGRES_USER
    DB_pass = secrets.POSTGRES_PASSWORD
    DB_name = secrets.POSTGRES_DB
    DB_port = secrets.POSTGRES_PORT
    DB_host = secrets.POSTGRES_PROXY_HOST

    # print( f"postgresql+asyncpg://{DB_user}:{DB_pass}@{DB_host}:{DB_port}/{DB_name}")
    return f"postgresql+asyncpg://{DB_user}:{DB_pass}@{DB_host}:{DB_port}/{DB_name}"



SQLALCHEMY_DATABASE_URL = get_postgresql_url()



#################################################################################################
#################################################################################################
async_engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL, 
    pool_pre_ping=True, 
    pool_size=30, 
    max_overflow=50, 
    pool_timeout=30, 
    pool_recycle=1800, 
    echo=False
)
AsyncSessionLocal = sessionmaker(
    autocommit=False, 
    class_=AsyncSession, 
    autoflush=True, 
    bind=async_engine, 
    expire_on_commit=False
)

#################################################################################################
#################################################################################################
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency that provides a transactional SQLAlchemy async session.
    It automatically commits the transaction if the request is successful,
    and rolls back if any exception occurs.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()            
        except Exception as e:
            await session.rollback()     
            raise
        finally: 
            await session.close()