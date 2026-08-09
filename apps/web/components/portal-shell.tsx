"use client";

import {
  BadgeDollarSign,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardClock,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import type { Me, Role } from "@/lib/types";
import { cn, initials } from "@/lib/utils";
import { Skeleton } from "@/components/ui";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  roles?: Role[];
};

const nav: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/profile", label: "My profile", icon: UserRound },
  { href: "/people", label: "People", icon: UsersRound },
  { href: "/leave", label: "Time off", icon: CalendarDays },
  { href: "/attendance", label: "Attendance", icon: ClipboardClock },
  { href: "/pay", label: "Pay", icon: BadgeDollarSign },
  { href: "/announcements", label: "Company news", icon: Bell },
  { href: "/approvals", label: "Approvals", icon: ShieldCheck, roles: ["manager", "hr", "admin"] },
  { href: "/audit", label: "Audit log", icon: FileClock, roles: ["hr", "admin"] },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<Me>("/auth/me"),
    retry: false,
  });

  useEffect(() => {
    if (me.isError) router.replace("/login");
  }, [me.isError, router]);

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" }).catch(() => undefined);
    queryClient.clear();
    router.replace("/login");
  }

  if (me.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-7xl gap-6 p-6">
        <Skeleton className="hidden w-64 rounded-3xl lg:block" />
        <div className="flex-1 space-y-5 pt-4">
          <Skeleton className="h-11 w-64" />
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </main>
    );
  }

  if (!me.data) return null;

  const user = me.data;
  const visibleNav = nav.filter((item) => !item.roles || item.roles.includes(user.user.role));

  const Sidebar = () => (
    <aside className="flex h-full flex-col p-4">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3 px-2 py-2">
        <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#5b5bd6] text-white">
          <Building2 size={20} />
        </div>
        <div>
          <div className="text-[15px] font-extrabold tracking-[-0.02em]">People Hub</div>
          <div className="text-[11px] font-medium text-[#8a8f9d]">Employee workspace</div>
        </div>
      </Link>

      <nav className="space-y-1">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                active
                  ? "bg-[#efefff] text-[#4b4bc4]"
                  : "text-[#5e6472] hover:bg-[#f7f7fa] hover:text-[#20232c]",
              )}
            >
              <Icon size={18} strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[#eceef2] pt-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl px-2 py-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e9ff] text-xs font-extrabold text-[#5050c4]">
            {initials(user.employee?.first_name, user.employee?.last_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-bold">
              {user.employee ? `${user.employee.first_name} ${user.employee.last_name}` : user.user.email}
            </div>
            <div className="truncate text-xs capitalize text-[#8a8f9d]">{user.user.role}</div>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#737887] hover:bg-[#fff2f3] hover:text-[#b93640]">
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="mx-auto min-h-screen max-w-[1500px]">
      <div className="fixed inset-y-5 left-5 hidden w-[248px] overflow-hidden rounded-[26px] border border-[#e5e7ed] bg-white shadow-sm lg:block">
        <Sidebar />
      </div>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e9ebf0] bg-[#f6f7fb]/90 px-4 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-extrabold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#5b5bd6] text-white"><Building2 size={17} /></span>
          People Hub
        </Link>
        <button className="rounded-xl border border-[#e3e5eb] bg-white p-2" onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="h-full w-[290px] bg-white shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="absolute left-[244px] top-4">
              <button onClick={() => setMobileOpen(false)} className="rounded-full bg-white p-2 shadow" aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[273px] lg:px-8 lg:py-9">
        {children}
      </main>
    </div>
  );
}
