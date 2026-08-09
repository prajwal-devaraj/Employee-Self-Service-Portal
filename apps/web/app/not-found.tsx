import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="card max-w-md p-8 text-center">
        <div className="text-6xl font-extrabold tracking-[-0.06em] text-[#d6d7df]">404</div>
        <h1 className="mt-3 text-xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-sm text-[#707684]">That page doesn’t exist in People Hub.</p>
        <Link className="btn-primary mt-6" href="/dashboard">Back to overview</Link>
      </div>
    </main>
  );
}
