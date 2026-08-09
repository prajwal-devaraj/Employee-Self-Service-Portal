import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <div className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6b6bd9]">
            {eyebrow}
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#171a23]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="card flex min-h-52 flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 h-10 w-10 rounded-2xl bg-[#efefff]" />
      <h3 className="font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-[#6b7280]">{description}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-[#eceef3]", className)} />;
}
