import asyncio
from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Announcement, Employee, Payslip, Role, User


async def ensure_user(
    db,
    *,
    email: str,
    password: str,
    role: Role,
    number: str,
    first: str,
    last: str,
    title: str,
    department: str,
    location: str,
) -> tuple[User, Employee]:
    user = await db.scalar(select(User).where(User.email == email))
    if user:
        employee = await db.scalar(select(Employee).where(Employee.user_id == user.id))
        return user, employee

    user = User(email=email, password_hash=hash_password(password), role=role)
    db.add(user)
    await db.flush()
    employee = Employee(
        user_id=user.id,
        employee_number=number,
        first_name=first,
        last_name=last,
        job_title=title,
        department=department,
        location=location,
        hire_date=date(2025, 6, 2),
        bio="Building useful products with a people-first mindset.",
    )
    db.add(employee)
    await db.flush()
    return user, employee


async def seed() -> None:
    async with SessionLocal() as db:
        admin, admin_emp = await ensure_user(
            db, email="admin@peoplehub.dev", password="Admin123!", role=Role.ADMIN,
            number="E1001", first="Avery", last="Stone", title="Platform Administrator",
            department="Technology", location="New York, NY"
        )
        hr, hr_emp = await ensure_user(
            db, email="hr@peoplehub.dev", password="Hr123456!", role=Role.HR,
            number="E1002", first="Maya", last="Patel", title="People Operations Partner",
            department="People", location="Austin, TX"
        )
        manager, manager_emp = await ensure_user(
            db, email="manager@peoplehub.dev", password="Manager123!", role=Role.MANAGER,
            number="E1003", first="Noah", last="Kim", title="Engineering Manager",
            department="Engineering", location="Seattle, WA"
        )
        employee, employee_emp = await ensure_user(
            db, email="employee@peoplehub.dev", password="Employee123!", role=Role.EMPLOYEE,
            number="E1004", first="Jordan", last="Lee", title="Software Engineer",
            department="Engineering", location="Remote - US"
        )
        if employee_emp and manager_emp and employee_emp.manager_id is None:
            employee_emp.manager_id = manager_emp.id

        existing_payslip = await db.scalar(
            select(Payslip).where(
                Payslip.employee_id == employee_emp.id,
                Payslip.period == "2026-08",
            )
        )
        if not existing_payslip:
            db.add(
                Payslip(
                    employee_id=employee_emp.id,
                    period="2026-08",
                    gross_pay=Decimal("7800.00"),
                    deductions=Decimal("1842.50"),
                    net_pay=Decimal("5957.50"),
                    currency="USD",
                )
            )

        existing_announcement = await db.scalar(select(Announcement).limit(1))
        if not existing_announcement:
            db.add_all(
                [
                    Announcement(
                        title="Welcome to the new People Hub",
                        body="Your employee profile, leave, attendance, pay and company updates now live in one secure workspace.",
                        audience="all",
                        is_pinned=True,
                        author_id=hr.id,
                    ),
                    Announcement(
                        title="Quarterly town hall",
                        body="Join the company town hall next Friday for product updates, customer stories and Q&A.",
                        audience="all",
                        is_pinned=False,
                        author_id=admin.id,
                    ),
                ]
            )
        await db.commit()
        print("Seed data ready.")


if __name__ == "__main__":
    asyncio.run(seed())
