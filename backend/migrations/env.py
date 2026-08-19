import asyncio
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from alembic.autogenerate import comparators
from alembic.util.langhelpers import DispatchPriority
import alembic_postgresql_enum  # noqa: F401  registers its comparators on import
import re
import sqlalchemy
from app.models.base import Base
from app.models import *


#########################################################################################################
#########################################################################################################
def defer_third_party_comparators() -> None:
    """Make comparators registered by extensions run after alembic's own.

    Alembic keeps its built-in comparators in plugins and, at autogenerate time, branches the global
    dispatcher first and appends those plugins after it. Anything an extension registered globally
    therefore runs before alembic has produced a single operation, and an extension that inspects that
    list finds it empty: enum types get an explicit CREATE on top of the one create_table already
    emits, and create_type=False is never injected. Priority is the only ordering lever, so every
    globally registered comparator moves to the lowest one. Alembic registers nothing there itself,
    so this only ever moves third-party functions."""
    registry = comparators._registry
    for key in [key for key in registry if key[2] is not DispatchPriority.LAST]:
        target, qualifier, _ = key
        registry[(target, qualifier, DispatchPriority.LAST)].extend(registry.pop(key))


#########################################################################################################
#########################################################################################################
def render_item(
    item_type,
    obj,
    autogen_context,
) -> bool:
    """Record the imports a rendered type needs, so generated migrations are runnable as written.

    Alembic renders a type it does not own as `<module>.<Class>(...)` but never records the import for
    it, and a type's own repr can embed bare sqlalchemy names such as `Text()`. Both are read back off
    the rendered text, so this stays independent of which types the project actually uses. Returning
    False leaves the rendering itself to alembic."""
    if item_type == "type":
        module = type(obj).__module__
        if not module.startswith("sqlalchemy."):
            autogen_context.imports.add(f"import {module}")
            for name in set(re.findall(r"(?<![\w.])([A-Z]\w*)\(", repr(obj))):
                if hasattr(sqlalchemy, name):
                    autogen_context.imports.add(f"from sqlalchemy import {name}")
    return False


# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
# from myapp import mymodel
# target_metadata = mymodel.Base.metadata
target_metadata = Base.metadata

defer_third_party_comparators()

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.

from app.core.secrets import secrets

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = secrets.DATABASE_URL # config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_server_default=True,
        compare_type=True,
        render_item=render_item,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_server_default=True,
        compare_type=True,
        render_item=render_item,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    configuration = config.get_section(config.config_ini_section, {})
    configuration["sqlalchemy.url"] = secrets.DATABASE_URL
    connectable = async_engine_from_config(
        #config.get_section(config.config_ini_section, {}),
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
