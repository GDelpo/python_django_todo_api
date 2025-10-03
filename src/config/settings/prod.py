import importlib as _importlib

_base = _importlib.import_module("config.settings.base")
# Export all uppercase base settings
for _k, _v in _base.__dict__.items():
    if _k.isupper():
        globals()[_k] = _v

# Direct references
REST_FRAMEWORK = getattr(_base, "REST_FRAMEWORK")  # type: ignore[attr-defined]
env = getattr(_base, "env")  # from paths

# Production overrides
DEBUG = False

# Security hardening suitable for HTTPS environments (adjust via env)
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=False)
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=0)
SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS", default=False
)
SECURE_HSTS_PRELOAD = env.bool("SECURE_HSTS_PRELOAD", default=False)

# Browsable API disabled in production
REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
]
