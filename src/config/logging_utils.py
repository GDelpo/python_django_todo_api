import logging
import time
import uuid
import contextvars
from typing import Optional

# Context variables used across request lifecycle
request_id_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="-")
start_time_var: contextvars.ContextVar[Optional[float]] = contextvars.ContextVar("start_time", default=None)


class RequestIDFilter(logging.Filter):
    """Injects request_id into log records if available."""

    def filter(self, record: logging.LogRecord) -> bool:  # pragma: no cover - trivial
        try:
            record.request_id = request_id_var.get()
        except Exception:
            record.request_id = "-"
        return True


def new_request_id(header_value: Optional[str]) -> str:
    """Pick X-Request-ID from header if provided, otherwise generate a UUID4."""
    if header_value:
        return header_value.strip() or str(uuid.uuid4())
    return str(uuid.uuid4())


def begin_timing() -> None:
    start_time_var.set(time.perf_counter())


def end_timing_ms() -> float:
    start = start_time_var.get()
    if start is None:
        return 0.0
    return (time.perf_counter() - start) * 1000.0
