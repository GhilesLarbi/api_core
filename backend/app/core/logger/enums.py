"""Closed vocabularies for every structured log line the backend emits. Every log call must
name a member from each enum or the structlog setup raises at runtime, so any new log line
starts here. Keep the lists intentional — add a member only when a real surface needs it."""

from enum import StrEnum

#########################################################################################################
#########################################################################################################
class LogAction(StrEnum):
    SERVER = "SERVER"
    INBOUND_HTTP = "INBOUND_HTTP"
    OUTBOUND_HTTP = "OUTBOUND_HTTP"

#########################################################################################################
#########################################################################################################
class LogEvent(StrEnum):
    HTTP_REQUEST_COMPLETED = "HTTP request completed"
    HTTP_REQUEST_FAILED = "HTTP request failed with an unhandled error"
    USER_LOGGED = "User loaded and logged by a task"
    REDIS_CONNECTED = "Redis connection pool opened"
    REDIS_CLOSED = "Redis connection pool closed"
    S3_CONNECTED = "S3 connection pool opened"
    S3_CLOSED = "S3 connection pool closed"
    BACKGROUND_TASK_FAILED = "Background task failed with an unhandled error"
    EMAIL_SUPPRESSED = "Email not sent (sending disabled), logged instead"
