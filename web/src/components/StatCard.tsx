import { ElevatedSurface } from "./Surface";

// KPI cards are the dashboard's "primary insight" surface (see
// docs/UPGRADE-REPORT.md, "Dashboard hierarchy") — the one place a subtle
// hover-lift earns its keep, since these are the numbers a firm checks
// first. Everything else on the dashboard stays flat.
export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <ElevatedSurface>
      <p className="text-sm text-foreground-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-navy-900 dark:text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
    </ElevatedSurface>
  );
}
