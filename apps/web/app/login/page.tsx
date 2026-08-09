"use client";

import { ArrowRight, Building2, CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { apiFetch, ApiError } from "@/lib/api";
import type { Me } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("employee@peoplehub.dev");
  const [password, setPassword] = useState("Employee123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const me = await apiFetch<Me>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      queryClient.setQueryData(["me"], me);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#19192b] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#6868ef]/25 blur-3xl" />
        <div className="absolute -bottom-40 left-20 h-96 w-96 rounded-full bg-[#28a87b]/15 blur-3xl" />
        <div className="relative flex items-center gap-3 text-sm font-extrabold">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] bg-[#6868ef]">
            <Building2 size={20} />
          </span>
          People Hub
        </div>

        <div className="relative my-auto max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#c8c8ff]">
            <Sparkles size={14} />
            Work, without the paperwork
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.06] tracking-[-0.05em]">
            Everything about your workday, in one calm place.
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#b9bac7]">
            Manage time off, attendance, pay, your profile and company updates from a secure employee workspace.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {["Fast self-service", "Private by design", "Clear approvals", "One source of truth"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm font-semibold text-[#dedee8]">
                <CheckCircle2 size={17} className="text-[#69d4a8]" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-[#747687]">Employee Experience Platform · 2026</div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-[430px]">
          <div className="mb-9 lg:hidden">
            <div className="flex items-center gap-2 font-extrabold">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#5b5bd6] text-white">
                <Building2 size={18} />
              </span>
              People Hub
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#efefff] text-[#5555cf]">
              <LockKeyhole size={20} />
            </div>
            <h2 className="text-3xl font-extrabold tracking-[-0.035em]">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-[#747986]">Sign in with your company account to continue.</p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Work email</span>
              <input
                className="input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold">Password</span>
              <input
                className="input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </label>

            {error && (
              <div className="rounded-xl border border-[#ffd6d9] bg-[#fff2f3] px-3 py-2.5 text-sm font-semibold text-[#b43741]">
                {error}
              </div>
            )}

            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="mt-7 rounded-2xl border border-[#e8e9ef] bg-white p-4 text-xs leading-5 text-[#747986]">
            <strong className="text-[#343741]">Demo account:</strong> employee@peoplehub.dev / Employee123!
          </div>
        </div>
      </section>
    </main>
  );
}
