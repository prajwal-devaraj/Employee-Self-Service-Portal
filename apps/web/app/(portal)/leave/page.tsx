"use client";

import { CalendarPlus, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch, ApiError } from "@/lib/api";
import type { LeaveRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function LeavePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [leaveType, setLeaveType] = useState("vacation");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const leave = useQuery({
    queryKey: ["leave-mine"],
    queryFn: () => apiFetch<LeaveRequest[]>("/leave/mine"),
  });

  const create = useMutation({
    mutationFn: () =>
      apiFetch<LeaveRequest>("/leave", {
        method: "POST",
        body: JSON.stringify({
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          reason,
        }),
      }),
    onSuccess: () => {
      setShowForm(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["leave-mine"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
    onError: (err) => setError(err instanceof ApiError ? err.message : "Could not create request"),
  });

  const cancel = useMutation({
    mutationFn: (id: string) => apiFetch(`/leave/${id}/cancel`, { method: "POST" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leave-mine"] }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    create.mutate();
  }

  return (
    <>
      <PageHeader
        eyebrow="Time away"
        title="Time off"
        description="Request leave, track approvals and keep your plans visible."
        action={
          <button className="btn-primary" onClick={() => setShowForm((v) => !v)}>
            <CalendarPlus size={16} /> {showForm ? "Close form" : "Request time off"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={submit} className="card mb-6 p-6">
          <div className="grid gap-5 md:grid-cols-3">
            <label>
              <span className="mb-2 block text-sm font-bold">Type</span>
              <select className="input" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                <option value="vacation">Vacation</option>
                <option value="sick">Sick</option>
                <option value="personal">Personal</option>
                <option value="parental">Parental</option>
                <option value="bereavement">Bereavement</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">Start date</span>
              <input className="input" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </label>
            <label>
              <span className="mb-2 block text-sm font-bold">End date</span>
              <input className="input" type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </label>
          </div>
          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-bold">Reason</span>
            <textarea className="input min-h-24" value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} maxLength={1000} />
          </label>
          <div className="mt-5 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#b43741]">{error}</div>
            <button className="btn-primary" disabled={create.isPending}>
              {create.isPending ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      )}

      {leave.isLoading ? (
        <Skeleton className="h-72" />
      ) : !leave.data?.length ? (
        <EmptyState title="No time-off requests yet" description="When you request leave, its status will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#fafafd] text-xs uppercase tracking-wide text-[#878c98]">
                <tr>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Dates</th>
                  <th className="px-5 py-4">Reason</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0f3]">
                {leave.data.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-bold capitalize">{item.leave_type}</td>
                    <td className="px-5 py-4 text-[#626875]">{formatDate(item.start_date)} – {formatDate(item.end_date)}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-[#626875]">{item.reason}</td>
                    <td className="px-5 py-4"><span className={`status status-${item.status}`}>{item.status}</span></td>
                    <td className="px-5 py-4 text-right">
                      {["pending", "approved"].includes(item.status) && (
                        <button onClick={() => cancel.mutate(item.id)} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b33a44]">
                          <XCircle size={14} /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
