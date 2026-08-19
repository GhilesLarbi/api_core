"""Public surface of the structured logging package, re-exporting the action and event
taxonomies plus the setup entrypoint every process calls once at startup."""

from .enums import LogAction, LogEvent
from .setup import setup_logging

__all__ = ["LogAction", "LogEvent", "setup_logging"]
