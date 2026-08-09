"use client";

import { MapPin, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { EmptyState, PageHeader, Skeleton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import type { Employee } from "@/lib/types";
import { initials } from "@/lib/utils";

export default function PeoplePage() {
  const [query, setQuery] = useState("");
  const people = useQuery({
    queryKey: ["employees"],
    queryFn: () => apiFetch<Employee[]>("/employees?limit=100"),
  });

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return people.data ?? [];
    return (people.data ?? []).filter((person) =>
      [person.first_name, person.last_name, person.job_title, person.department, person.location]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [people.data, query]);

  return (
    <>
      <PageHeader
        eyebrow="Organization"
        title="People"
        description="Find teammates and understand who does what across the company."
        action={
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#969ba7]" />
            <input className="input pl-10" placeholder="Search people…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        }
      />

      {people.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No people found" description="Try a different name, team, title or location." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((person) => (
            <article key={person.id} className="card p-5 transition hover:-translate-y-0.5">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#efefff] text-sm font-extrabold text-[#5656ca]">
                  {initials(person.first_name, person.last_name)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-extrabold">{person.first_name} {person.last_name}</h2>
                  <p className="mt-1 truncate text-sm font-semibold text-[#626875]">{person.job_title}</p>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#f4f5f7] px-2.5 py-1 text-xs font-bold text-[#646a77]">{person.department}</span>
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-[#eef0f3] pt-4 text-xs font-medium text-[#888d99]">
                <MapPin size={14} /> {person.location}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
