REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_FILTER_BACKENDS": ("django_filters.rest_framework.DjangoFilterBackend",),
    "DEFAULT_SCHEMA_CLASS": "config.settings.base.schema.CustomAutoSchema",
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}

DJOSER = {
    "LOGIN_FIELD": "email",
    "USER_CREATE_PASSWORD_RETYPE": True,
    "SERIALIZERS": {
        "user": "users.serializers.UserSerializer",
        "current_user": "users.serializers.UserSerializer",
    },
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Todo API",
    "DESCRIPTION": "Una API para gestionar tareas, hecha con Django REST Framework.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "TAGS": [
        {
            "name": "Authentication",
            "description": "Endpoints para registro, login y gestión de tokens JWT.",
        },
        {
            "name": "Tasks",
            "description": "Operaciones CRUD para las tareas de los usuarios.",
        },
    ],
    "POSTPROCESSING_HOOKS": [
        "config.settings.base.schema.retag_endpoints",
    ],
}
