"use client";

import { Clock3, LogIn, LogOut, MapPin } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch, ApiError } from "@/lib/api";
import type { Attendance } from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function AttendancePage() {
  const queryClient = useQueryClient();

  const records = useQuery({
    queryKey: ["attendance"],
    queryFn: () => apiFetch<Attendance[]>("/attendance/mine"),
  });

  const checkIn = useMutation({
    mutationFn: () =>
      apiFetch<Attendance>("/attendance/check-in", {
        method: "POST",
        body: JSON.stringify({ work_location: "Office" }),
      }),
    onSuccess: invalidate,
  });

  const checkOut = useMutation({
    mutationFn: () => apiFetch<Attendance>("/attendance/check-out", { method: "POST" }),
    onSuccess: invalidate,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["attendance"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
  }

  const today = records.data?.[0];
  const todayDate = new Date().toISOString().slice(0, 10);
  const checkedInToday = today?.work_date === todayDate;
  const completeToday = checkedInToday && !!today?.check_out;
  const error =
    (checkIn.error instanceof ApiError && checkIn.error.message) ||
    (checkOut.error instanceof ApiError && checkOut.error.message) ||
    "";

  return (
    <>
      <PageHeader
        eyebrow="Workday"
        title="Attendance"
        description="Record your workday and review your recent attendance history."
        action={
          <div className="flex gap-2">
            {!checkedInToday && (
              <button className="btn-primary" onClick={() => checkIn.mutate()} disabled={checkIn.isPending}>
                <LogIn size={16} /> Check in
              </button>
            )}
            {checkedInToday && !completeToday && (
              <button className="btn-primary" onClick={() => checkOut.mutate()} disabled={checkOut.isPending}>
                <LogOut size={16} /> Check out
              </button>
            )}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="card p-5 md:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-extrabold uppercase tracking-[0.1em] text-[#979ba6]">Today</div>
              <h2 className="mt-2 text-xl font-extrabold">
                {completeToday ? "Workday complete" : checkedInToday ? "You’re checked in" : "Ready when you are"}
              </h2>
              <p className="mt-2 text-sm text-[#6d7280]">
                {checkedInToday
                  ? `Started ${formatDateTime(today.check_in)}${today.check_out ? ` · finished ${formatDateTime(today.check_out)}` : ""}`
                  : "Your check-in time will appear here."}
              </p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#efefff] text-[#5757ce]">
              <Clock3 size={20} />
            </div>
          </div>
          {error && <div className="mt-4 rounded-xl bg-[#fff1f2] px-3 py-2 text-sm font-semibold text-[#b33b45]">{error}</div>}
        </div>

        <div className="card p-5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3f4f7] text-[#686e7b]">
            <MapPin size={18} />
          </div>
          <div className="mt-4 text-xs font-extrabold uppercase tracking-[0.1em] text-[#979ba6]">Location</div>
          <div className="mt-1 font-extrabold">{today?.work_location ?? "Not set"}</div>
        </div>
      </div>

      <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.08em] text-[#7d828f]">Recent activity</h2>
      {records.isLoading ? (
        <Skeleton className="h-72" />
      ) : !records.data?.length ? (
        <EmptyState title="No attendance records" description="Your first check-in will start your attendance history." />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-[#eef0f3]">
            {records.data.map((item) => (
              <div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center">
                <div className="font-bold">{formatDate(item.work_date)}</div>
                <div className="text-sm text-[#666c79]">In: {formatDateTime(item.check_in)}</div>
                <div className="text-sm text-[#666c79]">Out: {item.check_out ? formatDateTime(item.check_out) : "—"}</div>
                <span className={`status ${item.check_out ? "status-approved" : "status-pending"}`}>
                  {item.check_out ? "Complete" : "Active"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
