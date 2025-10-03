"""Default to base settings for compatibility.

This module re-exports UPPERCASE settings from config.settings.base without using
star imports, keeping linters happy while preserving Django expectations.
"""

import importlib as _importlib

_base = _importlib.import_module("config.settings.base")
__all__ = [k for k, v in _base.__dict__.items() if k.isupper()]
globals().update({k: v for k, v in _base.__dict__.items() if k in __all__})
