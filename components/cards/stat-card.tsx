import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-[2rem] bg-card p-6">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-[#F37338]" aria-hidden />
        {label}
      </p>

      <p className="mt-3 text-4xl font-medium tracking-tight">{value}</p>

      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
