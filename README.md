# Employee Self-Service Portal

A production-style Employee Self-Service (ESS) platform built as a modern monorepo.

## What is included

- Secure sign-in with Argon2 password hashing, JWT access/refresh sessions and HttpOnly cookies
- Role-based access control: Employee, Manager, HR and Admin
- Employee profile and directory
- Leave requests and manager/HR approvals
- Attendance check-in/check-out and history
- Payslip metadata and compensation visibility controls
- Company announcements
- Dashboard KPIs
- Immutable-style audit trail for sensitive changes
- Async FastAPI + SQLAlchemy 2 + PostgreSQL
- Redis-ready caching/rate-limit infrastructure
- Next.js App Router + React + Tailwind CSS
- Docker Compose local environment
- Alembic migrations
- Pytest API tests + frontend Vitest tests
- Ruff, mypy, ESLint, TypeScript
- GitHub Actions CI
- Health/readiness endpoints and structured logging
- Seed data for an instant demo

## Architecture

```text
Browser
  |
  v
Next.js 16 web app :3000
  |
  | HTTPS / JSON, credentials included
  v
FastAPI async API :8000
  |             \
  v              v
PostgreSQL 18   Redis 8.2 LTS
```

See `docs/ARCHITECTURE.md` for design details.

## Quick start with Docker

```bash
cp .env.example .env
docker compose up --build
```

Then open:
- Portal: http://localhost:3000
- API docs: http://localhost:8000/docs
- API health: http://localhost:8000/health

### Demo users

| Role | Email | Password |
|---|---|---|
| Admin | admin@peoplehub.dev | Admin123! |
| HR | hr@peoplehub.dev | Hr123456! |
| Manager | manager@peoplehub.dev | Manager123! |
| Employee | employee@peoplehub.dev | Employee123! |

> Demo passwords are for local development only. Change all seeded credentials before any real deployment.

## Local development without Docker

### Backend

```bash
cd services/api
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[dev]"
cp ../../.env.example ../../.env
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload
```

### Frontend

```bash
cd apps/web
npm install
npm run dev
```

## Useful commands

```bash
make up
make down
make logs
make test
make lint
make seed
```

## Production notes

This repository is production-oriented, but a real company deployment should still:
1. Store secrets in a managed secret manager.
2. Put the application behind TLS and a WAF/reverse proxy.
3. Set `COOKIE_SECURE=true`.
4. Restrict CORS to your real frontend origin.
5. Integrate enterprise SSO (OIDC/SAML), HRIS/payroll providers and object storage.
6. Use managed PostgreSQL/Redis with backups and PITR.
7. Configure alerting, tracing, SLOs and vulnerability/dependency scanning.
8. Review country/state payroll, privacy, retention and labor requirements with counsel.

## License

MIT — see `LICENSE`.
