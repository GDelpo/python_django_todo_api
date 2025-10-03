"""Aggregate all base settings in a compact, low-verbosity way.

This module imports the submodules under `config.settings.base` and exports
all UPPERCASE names (Django settings) found in them. This avoids long lists of
re-exports and stays close to the code, while keeping star-imports out.
"""

from importlib import import_module as _import_module

_SUBMODULES = (
    "apps",
    "cors",
    "custom",
    "database",
    "django",
    "logging",
    "paths",
    "security",
)

__all__ = []  # populated dynamically

for _name in _SUBMODULES:
    _mod = _import_module(f"{__name__}.{_name}")
    for _k, _v in _mod.__dict__.items():
        if _k.isupper():
            globals()[_k] = _v
            __all__.append(_k)

# Note: any optional settings (like SECURE_PROXY_SSL_HEADER) will be exported
# only if defined by their submodule, which is the desired behavior.

# Back-compat: export the `env` helper even though it's lowercase.
try:  # pragma: no cover
    _paths = _import_module(f"{__name__}.paths")
    env = getattr(_paths, "env")  # type: ignore
    globals()["env"] = env
    __all__.append("env")
except Exception:
    pass
