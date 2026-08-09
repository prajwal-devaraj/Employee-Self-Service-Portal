"use client";

import { Check, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { LeaveRequest } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function ApprovalsPage() {
  const client = useQueryClient();
  const pending = useQuery({
    queryKey: ["pending-leave"],
    queryFn: () => apiFetch<LeaveRequest[]>("/leave/pending"),
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      apiFetch<LeaveRequest>(`/leave/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status, reviewer_note: null }),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["pending-leave"] }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Manager workspace"
        title="Approvals"
        description="Review pending employee time-off requests."
      />

      {pending.isLoading ? (
        <Skeleton className="h-80" />
      ) : !pending.data?.length ? (
        <EmptyState title="Nothing to approve" description="You have no pending time-off requests right now." />
      ) : (
        <div className="space-y-3">
          {pending.data.map((item) => (
            <div key={item.id} className="card flex flex-col gap-5 p-5 lg:flex-row lg:items-center">
              <div className="min-w-0 flex-1">
                <div className="font-extrabold capitalize">{item.leave_type} leave</div>
                <div className="mt-1 text-sm text-[#676d79]">
                  {formatDate(item.start_date)} – {formatDate(item.end_date)}
                </div>
                <p className="mt-2 text-sm text-[#777c88]">{item.reason}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => review.mutate({ id: item.id, status: "rejected" })}>
                  <X size={15} /> Reject
                </button>
                <button className="btn-primary" onClick={() => review.mutate({ id: item.id, status: "approved" })}>
                  <Check size={15} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
