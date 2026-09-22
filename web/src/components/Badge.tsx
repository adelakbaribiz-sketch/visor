import type { AlertStatus, Priority } from "@/lib/data/types";

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: "bg-surface-muted text-foreground-muted border-border",
  MEDIUM: "bg-info-100 text-info-600 border-info-600/20",
  HIGH: "bg-warning-100 text-warning-600 border-warning-600/20",
  CRITICAL: "bg-danger-100 text-danger-600 border-danger-600/30",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {priority === "CRITICAL" && (
        <span className="h-1.5 w-1.5 rounded-full bg-danger-600" aria-hidden />
      )}
      {priority.charAt(0) + priority.slice(1).toLowerCase()}
    </span>
  );
}

const ALERT_STYLES: Record<AlertStatus, string> = {
  UNREAD: "bg-gold-100 text-gold-600 border-gold-600/30",
  READ: "bg-surface-muted text-foreground-muted border-border",
  DISMISSED: "bg-surface-muted text-foreground-muted/60 border-border",
};

export function AlertStatusBadge({ status }: { status: AlertStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${ALERT_STYLES[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function DemoDataBadge({ label = "Demo data" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gold-600/30 bg-gold-100 px-2.5 py-0.5 text-xs font-medium text-gold-600">
      {label}
    </span>
  );
}
