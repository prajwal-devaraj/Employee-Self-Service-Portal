"use client";

import { RotateCcw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="card max-w-md p-8 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0f1] text-[#bf3a45]">!</div>
        <h1 className="text-xl font-extrabold">Something didn’t load</h1>
        <p className="mt-2 text-sm leading-6 text-[#6c7280]">The portal hit an unexpected error. You can safely retry this view.</p>
        <button className="btn-primary mt-6" onClick={reset}><RotateCcw size={16} /> Try again</button>
      </div>
    </main>
  );
}
