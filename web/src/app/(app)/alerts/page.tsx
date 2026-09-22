import { AlertStatusBadge, DemoDataBadge, PriorityBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { getAlerts, getUpdateById } from "@/lib/data/client";
import { DEMO_USERS } from "@/lib/data/fixtures";
import Link from "next/link";

export default async function AlertsPage() {
  const alerts = await getAlerts();
  const rows = await Promise.all(
    alerts.map(async (a) => ({
      alert: a,
      update: await getUpdateById(a.updateId),
      user: DEMO_USERS.find((u) => u.id === a.userId) ?? null,
    })),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
            Alerts
          </h1>
          <p className="text-sm text-foreground-muted">
            In-app notification records generated when a tracked update is
            ingested. Email/Telegram delivery is not implemented — see
            LIMITATIONS.md.
          </p>
        </div>
        <DemoDataBadge label="Notification records only" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No alerts yet"
          description="Alerts are created when a new update matches a followed country or visa type."
        />
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
          {rows.map(({ alert, update, user }) => (
            <div key={alert.id} className="flex items-start gap-4 px-5 py-4">
              <div className="flex-1">
                {update ? (
                  <Link
                    href={`/updates/${update.id}`}
                    className="text-sm font-medium text-navy-900 hover:underline dark:text-foreground"
                  >
                    {update.title}
                  </Link>
                ) : (
                  <span className="text-sm text-foreground-muted">
                    Referenced update not found
                  </span>
                )}
                <p className="mt-1 text-xs text-foreground-muted">
                  {user?.name ?? "Unknown user"} · in-app ·{" "}
                  {new Date(alert.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {update && <PriorityBadge priority={update.priority} />}
                <AlertStatusBadge status={alert.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
