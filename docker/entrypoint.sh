#!/usr/bin/env sh
set -euo pipefail

cd /app/src

: "${DJANGO_SETTINGS_MODULE:=config.settings.prod}"
# Ensure child processes inherit the settings module
export DJANGO_SETTINGS_MODULE
: "${DJANGO_MANAGEPY_MIGRATE:=true}"
: "${DJANGO_COLLECTSTATIC:=true}"

echo "[entrypoint] Using settings: ${DJANGO_SETTINGS_MODULE}"

# Determine if Postgres is required (prod, explicit flag, or compose profile contains pg)
require_postgres=false
case "${DJANGO_SETTINGS_MODULE}" in
  *prod*) require_postgres=true ;;
esac
if [ "${REQUIRE_POSTGRES:-}" = "true" ]; then
  require_postgres=true
fi
if [ -n "${COMPOSE_PROFILES:-}" ] && echo "${COMPOSE_PROFILES}" | grep -q "pg"; then
  require_postgres=true
fi

# If Postgres is required, ensure we have either a Postgres DATABASE_URL or POSTGRES_* to derive it
if [ "${require_postgres}" = "true" ]; then
  has_pg_url=false
  if [ -n "${DATABASE_URL:-}" ] && echo "${DATABASE_URL}" | grep -Eq '^postgres(ql)?://'; then
    has_pg_url=true
  fi
  if [ "${has_pg_url}" != "true" ]; then
    if [ -z "${POSTGRES_DB:-}" ] || [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_PASSWORD:-}" ]; then
      echo >&2 "[entrypoint][FATAL] Se requiere Postgres pero faltan variables. Definí DATABASE_URL (postgres://) o POSTGRES_DB/POSTGRES_USER/POSTGRES_PASSWORD."
      echo >&2 "[entrypoint][HINT] Dev con Postgres: agregá COMPOSE_PROFILES=pg y POSTGRES_* en .env. Prod: definí credenciales o DATABASE_URL."
      exit 1
    fi
  fi
fi

# If DATABASE_URL is not set but POSTGRES_* are, derive it (helps local/prod)
if [ -z "${DATABASE_URL:-}" ] \
   && [ -n "${POSTGRES_DB:-}" ] \
   && [ -n "${POSTGRES_USER:-}" ] \
   && [ -n "${POSTGRES_PASSWORD:-}" ]; then
  : "${POSTGRES_HOST:=db}"
  export DATABASE_URL="postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}"
  echo "[entrypoint] Derived DATABASE_URL for Postgres host ${POSTGRES_HOST}."
fi

if [ "${DJANGO_MANAGEPY_MIGRATE}" = "true" ]; then
  echo "[entrypoint] Applying migrations..."
  python manage.py migrate --noinput
fi

if [ "${DJANGO_COLLECTSTATIC}" = "true" ]; then
  echo "[entrypoint] Collecting static files..."
  python manage.py collectstatic --noinput
fi

# Optional: create superuser if env vars are provided (idempotent)
if [ "${DJANGO_CREATE_SUPERUSER:-true}" = "true" ] \
   && [ -n "${DJANGO_SUPERUSER_EMAIL:-}" ] \
   && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
  echo "[entrypoint] Ensuring superuser ${DJANGO_SUPERUSER_EMAIL} exists..."
  # createsuperuser reads DJANGO_SUPERUSER_* when --noinput está activo
  # Si ya existe, ignora el error (--noinput devuelve código distinto). 
  python manage.py createsuperuser --noinput --email "${DJANGO_SUPERUSER_EMAIL}" || true
fi

echo "[entrypoint] Starting: $*"
exec "$@"
