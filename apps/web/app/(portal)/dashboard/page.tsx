"use client";

import {
  ArrowUpRight,
  BadgeDollarSign,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { PageHeader, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { Announcement, DashboardSummary, Me } from "@/lib/types";
import { formatDateTime, money } from "@/lib/utils";

export default function DashboardPage() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiFetch<Me>("/auth/me") });
  const summary = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch<DashboardSummary>("/dashboard/summary"),
  });
  const announcements = useQuery({
    queryKey: ["announcements"],
    queryFn: () => apiFetch<Announcement[]>("/announcements"),
  });

  const firstName = me.data?.employee?.first_name ?? "there";

  return (
    <>
      <PageHeader
        eyebrow="People Hub"
        title={`Good afternoon, ${firstName}.`}
        description="Here’s a clean view of what needs your attention today."
        action={
          <Link href="/profile" className="btn-secondary">
            View profile <ArrowUpRight size={16} />
          </Link>
        }
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Leave balance"
          value={summary.data ? `${summary.data.leave_balance_days} days` : undefined}
          detail="Available this year"
          icon={CalendarDays}
        />
        <MetricCard
          label="Attendance"
          value={summary.data ? (summary.data.checked_in_today ? "Checked in" : "Not checked in") : undefined}
          detail="Today"
          icon={Clock3}
          positive={summary.data?.checked_in_today}
        />
        <MetricCard
          label="Latest take-home"
          value={summary.data ? money(summary.data.latest_net_pay) : undefined}
          detail="Most recent payslip"
          icon={BadgeDollarSign}
        />
        <MetricCard
          label="People"
          value={summary.data ? String(summary.data.employee_count) : undefined}
          detail="Company directory"
          icon={UsersRound}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eceef2] px-6 py-5">
            <div>
              <h2 className="font-extrabold tracking-[-0.02em]">Company news</h2>
              <p className="mt-1 text-xs text-[#858a98]">Latest updates from your organization</p>
            </div>
            <Link href="/announcements" className="text-xs font-bold text-[#5656cb]">View all</Link>
          </div>
          <div className="divide-y divide-[#eef0f3]">
            {announcements.isLoading && (
              <div className="space-y-3 p-6">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-12 w-full" />
              </div>
            )}
            {announcements.data?.slice(0, 3).map((item) => (
              <article key={item.id} className="px-6 py-5">
                <div className="mb-2 flex items-center gap-2">
                  {item.is_pinned && (
                    <span className="rounded-full bg-[#efefff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#5555c8]">
                      Pinned
                    </span>
                  )}
                  <span className="text-xs text-[#9a9eaa]">{formatDateTime(item.published_at)}</span>
                </div>
                <h3 className="text-sm font-extrabold">{item.title}</h3>
                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#686e7b]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="font-extrabold tracking-[-0.02em]">Quick actions</h2>
            <div className="mt-5 space-y-2">
              <QuickLink href="/leave" icon={CalendarDays} label="Request time off" />
              <QuickLink href="/attendance" icon={Clock3} label="Open attendance" />
              <QuickLink href="/pay" icon={BadgeDollarSign} label="View payslips" />
            </div>
          </div>

          <div className="rounded-[20px] border border-[#dfeee7] bg-[#f3fbf7] p-6">
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-[#dff4e9] text-[#118557]">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="font-extrabold">You’re all caught up</h3>
            <p className="mt-2 text-sm leading-6 text-[#5f7469]">
              {summary.data?.pending_leave_count
                ? `${summary.data.pending_leave_count} time-off request is still pending.`
                : "No urgent employee tasks are waiting for you."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  positive,
}: {
  label: string;
  value?: string;
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
  positive?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1f1ff] text-[#5757ce]">
          <Icon size={19} />
        </div>
        {positive && <span className="h-2 w-2 rounded-full bg-[#21a66e]" />}
      </div>
      <div className="text-xs font-bold uppercase tracking-[0.08em] text-[#9397a3]">{label}</div>
      {value ? <div className="mt-1.5 text-2xl font-extrabold tracking-[-0.03em]">{value}</div> : <Skeleton className="mt-2 h-8 w-28" />}
      <div className="mt-1 text-xs text-[#8b909c]">{detail}</div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-bold text-[#4d5260] hover:border-[#e7e8ee] hover:bg-[#fafafd]">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f3f4f7] text-[#676c79]"><Icon size={16} /></span>
      <span className="flex-1">{label}</span>
      <ArrowUpRight size={15} className="text-[#a1a5af]" />
    </Link>
  );
}
