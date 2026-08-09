export type Role = "employee" | "manager" | "hr" | "admin";

export interface User {
  id: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export interface Employee {
  id: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  location: string;
  hire_date: string;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  manager_id?: string | null;
}

export interface Me {
  user: User;
  employee: Employee | null;
}

export interface DashboardSummary {
  employee_count: number;
  pending_leave_count: number;
  leave_balance_days: number;
  checked_in_today: boolean;
  announcement_count: number;
  latest_net_pay: string | null;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reviewer_note?: string | null;
  created_at: string;
}

export interface Attendance {
  id: string;
  work_date: string;
  check_in: string;
  check_out?: string | null;
  work_location: string;
  note?: string | null;
}

export interface Payslip {
  id: string;
  period: string;
  gross_pay: string;
  deductions: string;
  net_pay: string;
  currency: string;
  document_url?: string | null;
  published_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: string;
  is_pinned: boolean;
  author_id: string;
  published_at: string;
}

export interface AuditLog {
  id: string;
  actor_user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata_json: Record<string, unknown>;
  ip_address?: string | null;
  created_at: string;
}
