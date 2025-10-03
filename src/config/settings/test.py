import importlib as _importlib

_base = _importlib.import_module("config.settings.base")
for _k, _v in _base.__dict__.items():
    if _k.isupper():
        globals()[_k] = _v

REST_FRAMEWORK = globals()["REST_FRAMEWORK"]

# Testing overrides
DEBUG = False
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"

REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"] = [
    "rest_framework.renderers.JSONRenderer",
]
