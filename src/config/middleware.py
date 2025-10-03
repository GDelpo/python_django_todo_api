from __future__ import annotations

import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import HttpRequest, HttpResponse

from .logging_utils import (
    request_id_var,
    new_request_id,
    begin_timing,
    end_timing_ms,
)


access_logger = logging.getLogger("access")


class RequestIDAndAccessLogMiddleware(MiddlewareMixin):
    """Assigns a request_id and logs access line with timing, user and status.

    - Accepts inbound X-Request-ID if present, otherwise generates one.
    - Exposes request_id in response header for correlation.
    - Logs a single access line on response.
    """

    header_name = "HTTP_X_REQUEST_ID"
    response_header = "X-Request-ID"

    def process_request(self, request: HttpRequest):  # type: ignore[override]
        rid = new_request_id(request.META.get(self.header_name))
        request_id_var.set(rid)
        begin_timing()
        # attach to request for app usage if needed
        setattr(request, "request_id", rid)

    def process_response(self, request: HttpRequest, response: HttpResponse):  # type: ignore[override]
        try:
            rid = request_id_var.get()
        except Exception:
            rid = "-"
        # Add header for clients
        response[self.response_header] = rid

        # Build metadata
        method = getattr(request, "method", "-")
        path = getattr(request, "path", "-")
        status = getattr(response, "status_code", 0)
        user = getattr(getattr(request, "user", None), "id", None)
        user_repr = str(user) if user else "anon"
        ip = request.META.get("HTTP_X_FORWARDED_FOR") or request.META.get("REMOTE_ADDR") or "-"
        duration = end_timing_ms()

        access_logger.info(
            "method=%s path=%s status=%s user=%s ip=%s duration_ms=%.2f request_id=%s",
            method,
            path,
            status,
            user_repr,
            ip,
            duration,
            rid,
        )
        return response
