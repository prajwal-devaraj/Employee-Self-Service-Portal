from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.models import LeaveStatus, LeaveType, Role


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class Message(BaseModel):
    message: str


class UserPublic(ORMModel):
    id: UUID
    email: EmailStr
    role: Role
    is_active: bool


class EmployeePublic(ORMModel):
    id: UUID
    employee_number: str
    first_name: str
    last_name: str
    job_title: str
    department: str
    location: str
    hire_date: date
    phone: str | None = None
    bio: str | None = None
    avatar_url: str | None = None
    manager_id: UUID | None = None


class MeResponse(BaseModel):
    user: UserPublic
    employee: EmployeePublic | None


class EmployeeUpdate(BaseModel):
    phone: str | None = Field(default=None, max_length=40)
    bio: str | None = Field(default=None, max_length=1000)
    location: str | None = Field(default=None, max_length=160)


class EmployeeAdminUpdate(EmployeeUpdate):
    job_title: str | None = Field(default=None, max_length=160)
    department: str | None = Field(default=None, max_length=120)
    manager_id: UUID | None = None


class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str = Field(min_length=3, max_length=1000)

    @model_validator(mode="after")
    def validate_dates(self) -> "LeaveCreate":
        if self.end_date < self.start_date:
            raise ValueError("end_date must be on or after start_date")
        return self


class LeaveReview(BaseModel):
    status: LeaveStatus
    reviewer_note: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def only_review_states(self) -> "LeaveReview":
        if self.status not in {LeaveStatus.APPROVED, LeaveStatus.REJECTED}:
            raise ValueError("review status must be approved or rejected")
        return self


class LeavePublic(ORMModel):
    id: UUID
    employee_id: UUID
    leave_type: LeaveType
    start_date: date
    end_date: date
    reason: str
    status: LeaveStatus
    reviewer_id: UUID | None
    reviewer_note: str | None
    created_at: datetime
    updated_at: datetime


class AttendanceCheckIn(BaseModel):
    work_location: str = Field(default="Office", min_length=2, max_length=120)
    note: str | None = Field(default=None, max_length=500)


class AttendancePublic(ORMModel):
    id: UUID
    employee_id: UUID
    work_date: date
    check_in: datetime
    check_out: datetime | None
    work_location: str
    note: str | None


class PayslipPublic(ORMModel):
    id: UUID
    employee_id: UUID
    period: str
    gross_pay: Decimal
    deductions: Decimal
    net_pay: Decimal
    currency: str
    document_url: str | None
    published_at: datetime


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    body: str = Field(min_length=3, max_length=10000)
    audience: str = Field(default="all", max_length=80)
    is_pinned: bool = False


class AnnouncementPublic(ORMModel):
    id: UUID
    title: str
    body: str
    audience: str
    is_pinned: bool
    author_id: UUID
    published_at: datetime


class AuditPublic(ORMModel):
    id: UUID
    actor_user_id: UUID | None
    action: str
    entity_type: str
    entity_id: str | None
    metadata_json: dict
    ip_address: str | None
    created_at: datetime


class DashboardSummary(BaseModel):
    employee_count: int
    pending_leave_count: int
    leave_balance_days: int
    checked_in_today: bool
    announcement_count: int
    latest_net_pay: Decimal | None = None
