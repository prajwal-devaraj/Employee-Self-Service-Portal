"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PageHeader, Skeleton } from "@/components/ui";
import { apiFetch, ApiError } from "@/lib/api";
import type { Employee, Me } from "@/lib/types";
import { initials } from "@/lib/utils";

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => apiFetch<Me>("/auth/me") });
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (me.data?.employee) {
      setPhone(me.data.employee.phone ?? "");
      setLocation(me.data.employee.location ?? "");
      setBio(me.data.employee.bio ?? "");
    }
  }, [me.data]);

  const update = useMutation({
    mutationFn: () =>
      apiFetch<Employee>("/employees/me", {
        method: "PATCH",
        body: JSON.stringify({ phone: phone || null, location, bio: bio || null }),
      }),
    onSuccess: () => {
      setMessage("Profile saved");
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error) => setMessage(error instanceof ApiError ? error.message : "Could not save profile"),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    update.mutate();
  }

  const employee = me.data?.employee;
  if (me.isLoading) return <Skeleton className="h-[540px] w-full" />;

  return (
    <>
      <PageHeader
        eyebrow="Personal"
        title="My profile"
        description="Keep the contact details your coworkers and People team use up to date."
      />

      {!employee ? (
        <div className="card p-6">No employee profile is attached to this account.</div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
          <aside className="card p-6">
            <div className="grid h-20 w-20 place-items-center rounded-[24px] bg-[#ededff] text-xl font-extrabold text-[#5050c6]">
              {initials(employee.first_name, employee.last_name)}
            </div>
            <h2 className="mt-5 text-xl font-extrabold">{employee.first_name} {employee.last_name}</h2>
            <p className="mt-1 text-sm font-semibold text-[#626875]">{employee.job_title}</p>
            <div className="mt-5 inline-flex rounded-full bg-[#f2f3f6] px-3 py-1 text-xs font-bold text-[#5f6470]">
              {employee.department}
            </div>

            <div className="mt-7 space-y-4 border-t border-[#eceef2] pt-6 text-sm">
              <Row icon={Mail} value={me.data?.user.email ?? ""} />
              <Row icon={MapPin} value={employee.location} />
              <Row icon={Phone} value={employee.phone || "Add a phone number"} />
            </div>

            <div className="mt-7 rounded-2xl bg-[#fafafd] p-4">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#989ca7]">Employee ID</div>
              <div className="mt-1 font-mono text-sm font-bold">{employee.employee_number}</div>
            </div>
          </aside>

          <form onSubmit={submit} className="card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1f1ff] text-[#5b5bd6]">
                <UserRound size={19} />
              </div>
              <div>
                <h2 className="font-extrabold">Contact & profile</h2>
                <p className="text-xs text-[#858a97]">Changes are audited for account safety.</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Phone</span>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 010 1234" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold">Work location</span>
                <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} required />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold">About me</span>
              <textarea
                className="input min-h-36 resize-y"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={1000}
                placeholder="A short intro for your coworkers…"
              />
              <span className="mt-1 block text-right text-xs text-[#9a9ea8]">{bio.length}/1000</span>
            </label>

            <div className="mt-7 flex items-center justify-between gap-4 border-t border-[#eceef2] pt-6">
              <div className="text-sm font-semibold text-[#68707d]">{message}</div>
              <button className="btn-primary" disabled={update.isPending}>
                <Save size={16} /> {update.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

function Row({
  icon: Icon,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-[#5c626f]">
      <Icon size={16} className="text-[#969aa5]" />
      <span className="truncate">{value}</span>
    </div>
  );
}
