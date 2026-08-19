from time import monotonic
from typing import Optional

from sqlalchemy import select

from app.core.settings import settings
from app.core.connections import AsyncSessionLocal
from app.schemas.app_config import AppConfigData, AppConfigUpdate

_config: Optional[AppConfigData] = None
_loaded_at: float = 0.0


#########################################################################################################
#########################################################################################################
async def _load() -> AppConfigData:
    """Reads the stored settings, creating them on first run so a fresh database needs no seeding.
    The model is imported here rather than at module level: app.models reaches back into app.core
    through the schemas, and importing it at the top would close that loop."""
    from app.models import AppConfig

    async with AsyncSessionLocal() as session:
        config = (await session.execute(select(AppConfig).limit(1))).scalar_one_or_none()
        if config is None:
            defaults = AppConfigData()
            config = AppConfig(
                maintenance_mode=defaults.maintenance_mode,
                support_email=defaults.support_email,
            )
            session.add(config)
            await session.commit()
        return AppConfigData(
            maintenance_mode=config.maintenance_mode,
            support_email=config.support_email,
        )


#########################################################################################################
#########################################################################################################
async def get_app_config() -> AppConfigData:
    """The current settings. Import this rather than the value it returns — anything holding the
    object itself keeps whichever copy existed when it was imported, and never sees a change."""
    global _config, _loaded_at

    if _config is None or monotonic() - _loaded_at > settings.APP_CONFIG_RELOAD_INTERVAL:
        _config = await _load()
        _loaded_at = monotonic()
    return _config


#########################################################################################################
#########################################################################################################
def invalidate_app_config() -> None:
    """Drops this worker's copy so the next read goes back to the database. Called after an admin
    writes; the other workers pick the change up when their own window closes."""
    global _config
    _config = None


#########################################################################################################
#########################################################################################################
async def update_app_config(update: AppConfigUpdate) -> AppConfigData:
    from app.models import AppConfig

    async with AsyncSessionLocal() as session:
        config = (await session.execute(select(AppConfig).limit(1))).scalar_one_or_none()
        if config is None:
            defaults = AppConfigData()
            config = AppConfig(
                maintenance_mode=defaults.maintenance_mode,
                support_email=defaults.support_email,
            )
            session.add(config)
        for name, value in update.model_dump(mode="json", exclude_unset=True).items():
            setattr(config, name, value)
        await session.commit()
        invalidate_app_config()
        return AppConfigData(
            maintenance_mode=config.maintenance_mode,
            support_email=config.support_email,
        )
