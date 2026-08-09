"use client";

import { Bell, Pin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { Announcement } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export default function AnnouncementsPage() {
  const announcements = useQuery({
    queryKey: ["announcements"],
    queryFn: () => apiFetch<Announcement[]>("/announcements"),
  });

  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="Company news"
        description="Important updates, events and announcements from across the organization."
      />

      {announcements.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : !announcements.data?.length ? (
        <EmptyState title="No announcements" description="Company updates will appear here." />
      ) : (
        <div className="space-y-4">
          {announcements.data.map((item) => (
            <article key={item.id} className="card p-6">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#efefff] text-[#5757ce]">
                  {item.is_pinned ? <Pin size={18} /> : <Bell size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold tracking-[-0.02em]">{item.title}</h2>
                    {item.is_pinned && <span className="rounded-full bg-[#f1f1ff] px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#5959c7]">Pinned</span>}
                  </div>
                  <div className="mt-1 text-xs text-[#9397a2]">{formatDateTime(item.published_at)} · {item.audience}</div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#5f6572]">{item.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
