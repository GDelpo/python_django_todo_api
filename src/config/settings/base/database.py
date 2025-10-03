from .paths import BASE_DIR, env

# DATABASE_URL or fallback to SQLite
DATABASES = {
    "default": env.db(
        "DATABASE_URL", default=f"sqlite:///{(BASE_DIR / 'db.sqlite3').as_posix()}"
    )
}

db = DATABASES["default"]
engine = db.get("ENGINE", "")
is_pg = engine.endswith(("postgresql", "postgresql_psycopg2"))

# Simple, sensible defaults; override via env if needed
db["ATOMIC_REQUESTS"] = env.bool("DB_ATOMIC_REQUESTS", default=is_pg)
db["CONN_MAX_AGE"] = env.int("DB_CONN_MAX_AGE", default=60 if is_pg else 0)

if is_pg:
    options = {}
    # SSL mode: opt-in or explicit value
    sslmode = env.str("DB_SSLMODE", default=None)
    if env.bool("DB_SSL_REQUIRED", default=False):
        sslmode = sslmode or "require"
    if sslmode:
        options["sslmode"] = sslmode

    # Timeouts (only if provided)
    connect_timeout = env.int("DB_CONNECT_TIMEOUT", default=None)
    if connect_timeout:
        options["connect_timeout"] = connect_timeout

    statement_timeout_ms = env.int("DB_STATEMENT_TIMEOUT", default=None)
    if statement_timeout_ms:
        options["options"] = f"-c statement_timeout={statement_timeout_ms}"

    if options:
        db.setdefault("OPTIONS", {}).update(options)


AUTH_USER_MODEL = "users.User"
