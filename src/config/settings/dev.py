import importlib as _importlib

# Load base settings into this module without star-imports
_base = _importlib.import_module("config.settings.base")
for _k, _v in _base.__dict__.items():
    if _k.isupper():
        globals()[_k] = _v

# Local references to satisfy static analyzers
REST_FRAMEWORK = globals()["REST_FRAMEWORK"]
CORS_ALLOWED_ORIGINS = globals()["CORS_ALLOWED_ORIGINS"]

# Development overrides
DEBUG = True

# Browsable API enabled in dev
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
    "rest_framework.renderers.BrowsableAPIRenderer",
]

# Dev CORS: permitir orígenes típicos de localhost
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS or [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]
