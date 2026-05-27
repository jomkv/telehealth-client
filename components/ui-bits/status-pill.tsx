import { cn } from "@/lib/utils";
import type { ConsultationStatus } from "@/@types/consultation";

const styles: Record<ConsultationStatus, string> = {
  PENDING: "bg-muted text-foreground",
  ONGOING: "bg-[var(--signal)] text-white",
  DONE: "bg-foreground text-background",
  CANCELLED: "bg-transparent text-muted-foreground border border-border",
};

const labels: Record<ConsultationStatus, string> = {
  PENDING: "Upcoming",
  ONGOING: "Live now",
  DONE: "Completed",
  CANCELLED: "Cancelled",
};

interface StatusPillProps {
  status: ConsultationStatus;
  className?: string;
}

export function StatusPill({ status, className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
        styles[status],
        className,
      )}
    >
      {status === "ONGOING" && (
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
      )}
      {labels[status]}
    </span>
  );
}
