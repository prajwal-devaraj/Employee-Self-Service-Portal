# API overview

Base path: `/api/v1`

## Authentication
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## Employees
- `GET /employees`
- `GET /employees/me`
- `PATCH /employees/me`
- `GET /employees/{employee_id}`
- `PATCH /employees/{employee_id}` — HR/Admin

## Leave
- `GET /leave/mine`
- `POST /leave`
- `POST /leave/{leave_id}/cancel`
- `GET /leave/pending` — Manager/HR/Admin
- `PATCH /leave/{leave_id}/review` — Manager/HR/Admin

## Attendance
- `GET /attendance/mine`
- `POST /attendance/check-in`
- `POST /attendance/check-out`

## Payroll
- `GET /payroll/payslips`

## Announcements
- `GET /announcements`
- `POST /announcements` — HR/Admin

## Audit
- `GET /audit` — HR/Admin

## Dashboard
- `GET /dashboard/summary`

## Operations
- `GET /health`
- `GET /ready`

Interactive OpenAPI documentation is available at `/docs` outside production.
