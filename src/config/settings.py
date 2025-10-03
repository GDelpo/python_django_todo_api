"""Thin compat module: re-export base settings.

Prefer using `config.settings.dev` or `config.settings.prod` explicitly.
"""

import importlib as _importlib

_base = _importlib.import_module("config.settings.base")
__all__ = [k for k, v in _base.__dict__.items() if k.isupper()]
globals().update({k: v for k, v in _base.__dict__.items() if k in __all__})
