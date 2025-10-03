from .paths import env

LOG_LEVEL = env("LOG_LEVEL", default="INFO").upper()
ACCESS_LOG_LEVEL = env("ACCESS_LOG_LEVEL", default="INFO").upper()

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "request_id": {"()": "config.logging_utils.RequestIDFilter"},
    },
    "formatters": {
        # Simple para desarrollo local
        "simple": {
            "format": "%(levelname)s %(asctime)s %(name)s [req=%(request_id)s]: %(message)s",
            "style": "%",
        },
        # Formato tipo JSON (una línea) adecuado para agregadores
        "json_line": {
            "format": "level=%(levelname)s ts=%(asctime)s logger=%(name)s req=%(request_id)s message=%(message)s",
            "style": "%",
        },
        # Access log uniforme
        "access": {
            "format": "%(message)s",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": env("LOG_FORMATTER", default="simple"),
            "filters": ["request_id"],
        },
        "access_console": {
            "class": "logging.StreamHandler",
            "formatter": "access",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": LOG_LEVEL,
    },
    "loggers": {
        # Access log separado, útil para Nginx/ELB o dashboards
        "access": {
            "handlers": ["access_console"],
            "level": ACCESS_LOG_LEVEL,
            "propagate": False,
        },
        # Reduce verbosidad de Django en producción si se desea
        "django": {"level": env("DJANGO_LOG_LEVEL", default=LOG_LEVEL)},
        "django.server": {"level": env("DJANGO_SERVER_LOG_LEVEL", default=LOG_LEVEL)},
        "django.request": {"level": env("DJANGO_REQUEST_LOG_LEVEL", default=LOG_LEVEL)},
        "rest_framework": {"level": env("DRF_LOG_LEVEL", default=LOG_LEVEL)},
    },
}
