# 📝 Invera ToDo-List Challenge

![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.x-green?logo=django)
![DRF](https://img.shields.io/badge/Django%20REST%20Framework-red)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![Postgres](https://img.shields.io/badge/Postgres-optional-informational?logo=postgresql)

Solución al challenge de **ToDo-List API** construida con **Django + DRF**.

---

## ✨ Características

* 🔑 Autenticación JWT (Djoser + Simple JWT)
* ✅ CRUD de tareas por usuario
* 🔍 Filtros y búsqueda avanzada
* 📖 Documentación Swagger/OpenAPI
* 🐳 Docker Compose con SQLite/Postgres
* 🩺 Endpoint `/health/` para chequeo
* ⚙️ Configuración separada dev/prod

---

## 📦 Requisitos

* [Docker & Docker Compose](https://docs.docker.com/) (recomendado)
* O bien: **Python 3.12+** (para correr sin Docker)

---

## ⚙️ Variables de Entorno

Copiar el archivo base y ajustar lo necesario:

```bash
cp .env.example .env
```

* **Dev (SQLite):** no requiere variables.
* **Dev (Postgres):** `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
* **Prod local:** mismas credenciales de Postgres + `DEBUG=false`, `ALLOWED_HOSTS`, etc.
* Opcionales: `DEV_PORT`, `DEV_PG_PORT`, `DATABASE_URL`.

---

## 🚀 Quickstart

### 🔹 Opción A: Dev con Docker + SQLite (default)

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

👉 Levanta rápido sin configurar nada.

* API Docs → [http://localhost:8000/api/docs/](http://localhost:8000/api/docs/)
* Health → [http://localhost:8000/health/](http://localhost:8000/health/)

---

### 🔹 Opción B: Dev con Docker + Postgres

```bash
docker compose -f docker/docker-compose.yml --profile pg up --build -d
```

👉 Activa el servicio de Postgres, requiere setear `POSTGRES_*` en `.env`.

Tips:

* Evitá pasar `--profile pg` siempre → agregá `COMPOSE_PROFILES=pg` en `.env`.
* Podés definir `DEV_PG_PORT` si el `5432` está ocupado.

---

### 🔹 Opción C: Simulación de Producción (Gunicorn + Postgres)

```bash
docker compose \
  -f docker/docker-compose.prod.yml \
  -f docker/docker-compose.prod.local.yml up --build -d
```

👉 Setup cercano a producción, con Gunicorn y Postgres.
👉 Opcional: crear admin automático con `DJANGO_CREATE_SUPERUSER=true` y credenciales en `.env`.

---

### 🔹 Opción D: Local sin Docker (venv + Python)

```bash
python -m venv env
source env/bin/activate  # Linux/macOS
.\env\Scripts\Activate.ps1  # Windows

pip install -r requirements.txt
cp .env.example .env

cd src
python manage.py migrate
python manage.py runserver
```

---

## 📡 Endpoints Principales

| Endpoint            | Método(s)      | Descripción           | Auth |
| ------------------- | -------------- | --------------------- | ---- |
| `/docs/`            | GET            | Documentación Swagger | ❌    |
| `/auth/users/`      | POST           | Registro de usuario   | ❌    |
| `/auth/jwt/create/` | POST           | Login                 | ❌    |
| `/tasks/`           | GET/POST       | Listar o crear tareas | ✅    |
| `/tasks/{id}/`      | GET/PUT/DELETE | Detalle de tarea      | ✅    |
| `/health/`          | GET            | Estado de la API      | ❌    |

---

## ⚡ Probar la API

Podés probar con la interfaz Swagger en `/api/docs/` o con los siguientes scripts.

<details>
<summary><strong>Ejemplo con PowerShell</strong></summary>

```powershell
# Datos del nuevo usuario
$user = @{
    email = 'test@example.com';
    password = 'TestPassword123!'
} | ConvertTo-Json

# 1. Registrar usuario
Invoke-RestMethod -Method POST -Uri http://localhost:8000/api/auth/users/ -ContentType 'application/json' -Body $user

# 2. Obtener token de acceso
$tokenResponse = Invoke-RestMethod -Method POST -Uri http://localhost:8000/api/auth/jwt/create/ -ContentType 'application/json' -Body $user
$accessToken = $tokenResponse.access
$headers = @{ Authorization = "Bearer $accessToken" }

# 3. Crear una nueva tarea
$task = @{
    title = 'Mi primera tarea';
    description = 'Completar el challenge de Invera'
} | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:8000/api/tasks/ -Headers $headers -ContentType 'application/json' -Body $task

# 4. Listar todas las tareas
Invoke-RestMethod -Method GET -Uri http://localhost:8000/api/tasks/ -Headers $headers
```

</details>

---

<details>
<summary><strong>Ejemplo con Bash + cURL</strong></summary>

```bash
#!/bin/bash

# 1. Registrar usuario
curl -X POST http://localhost:8000/api/auth/users/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword123!"}'

# 2. Obtener token y guardarlo
ACCESS_TOKEN=$(curl -X POST http://localhost:8000/api/auth/jwt/create/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPassword123!"}' | jq -r '.access')

# 3. Crear una nueva tarea
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Mi primera tarea", "description": "Completar el challenge de Invera"}'

# 4. Listar todas las tareas
curl -X GET http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

> ⚠️ Requiere `jq` para parsear el token de acceso.
> Instalalo en Ubuntu/Debian con: `sudo apt install jq`

</details>

---

## ❓ FAQ

* **Puerto ocupado:** Definí `DEV_PORT=8080` en `.env`.
* **Variables no se aplican en Docker:** Corré `docker compose down` y luego `up --build -d`.
* **Postgres falla:** Usá `--profile pg` o `COMPOSE_PROFILES=pg` y definí `POSTGRES_*`.
