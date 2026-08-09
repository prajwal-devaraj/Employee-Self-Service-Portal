"use client";

import { FileClock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { AuditLog } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AuditPage() {
  const audit = useQuery({
    queryKey: ["audit"],
    queryFn: () => apiFetch<AuditLog[]>("/audit?limit=100"),
  });

  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Audit log"
        description="A chronological record of security-sensitive actions across the portal."
      />

      {audit.isLoading ? (
        <Skeleton className="h-96" />
      ) : !audit.data?.length ? (
        <EmptyState title="No audit activity yet" description="Security-sensitive actions will be recorded here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-[#eef0f3]">
            {audit.data.map((entry) => (
              <div key={entry.id} className="grid gap-3 px-5 py-4 md:grid-cols-[40px_1.2fr_1fr_1fr] md:items-center">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f3f6] text-[#6b7180]">
                  <FileClock size={16} />
                </div>
                <div>
                  <div className="text-sm font-extrabold">{entry.action}</div>
                  <div className="mt-1 text-xs text-[#9296a1]">{formatDateTime(entry.created_at)}</div>
                </div>
                <div className="text-sm text-[#646a77]">{entry.entity_type}</div>
                <div className="truncate font-mono text-xs text-[#8a8f9b]">{entry.entity_id ?? "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
