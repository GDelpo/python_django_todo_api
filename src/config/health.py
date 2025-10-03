import django
from django.conf import settings
from django.db import connection
from django.utils.timezone import now
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@extend_schema(tags=["Healthcheck"])
@api_view(["GET"])
@permission_classes([AllowAny])
def healthcheck(request):
    db_ok = True
    db_error = None
    try:
        connection.ensure_connection()
    except Exception as exc:  # pragma: no cover (only on failure)
        db_ok = False
        db_error = str(exc)

    payload = {
        "name": "Todo API",
        "status": "ok" if db_ok else "degraded",
        "time": now().isoformat(),
        "version": "1.0.0",
        "django": django.get_version(),
        "debug": bool(settings.DEBUG),
        "database": {"ok": db_ok},
    }
    if db_error:
        payload["database"]["error"] = db_error

    return Response(payload)
