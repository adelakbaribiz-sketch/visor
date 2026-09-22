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
    <div className="rounded-lg border border-border bg-surface p-5">
      <p className="text-sm text-foreground-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-navy-900 dark:text-foreground">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-foreground-muted">{hint}</p>}
    </div>
  );
}
