import os
from pathlib import Path

import environ

# Base paths
BASE_DIR = Path(__file__).resolve().parents[3]

# Environment
env = environ.Env(
    DEBUG=(bool, True),
    SECRET_KEY=(str, "django-insecure-CHANGE_ME"),
    ALLOWED_HOSTS=(list, []),
    CSRF_TRUSTED_ORIGINS=(list, []),
)

# Load .env from project root (one level above src)
environ.Env.read_env(os.path.join(BASE_DIR, "..", ".env"))
