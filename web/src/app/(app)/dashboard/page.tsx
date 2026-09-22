import Link from "next/link";
import { PriorityBadge, DemoDataBadge } from "@/components/Badge";
import { StatCard } from "@/components/StatCard";
import { BarChart } from "@/components/charts/BarChart";
import { Sparkline } from "@/components/charts/Sparkline";
import { getCountries, getUpdates, getUsageStats } from "@/lib/data/client";

export default async function DashboardPage() {
  const [stats, updates, countries] = await Promise.all([
    getUsageStats(),
    getUpdates(),
    getCountries(),
  ]);
  const recent = updates.slice(0, 5);
  const countryName = (id: string) =>
    countries.find((c) => c.id === id)?.name ?? id;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-foreground-muted">
            Snapshot of tracked immigration updates across your firm&apos;s
            countries and visa types.
          </p>
        </div>
        <DemoDataBadge label="Counts computed from seeded demo records" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total updates tracked" value={stats.totalUpdates} />
        <StatCard
          label="Updates in last 30 days"
          value={stats.updatesLast30Days}
        />
        <StatCard label="Countries tracked" value={stats.countriesTracked} />
        <StatCard label="Unread alerts" value={stats.unreadAlerts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-5 lg:col-span-2">
          <h2 className="font-display text-base text-navy-900 dark:text-foreground">
            Updates by week
          </h2>
          <p className="text-xs text-foreground-muted">Last 6 weeks</p>
          <div className="mt-4">
            <Sparkline data={stats.updatesTimeline} />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-display text-base text-navy-900 dark:text-foreground">
            By priority
          </h2>
          <div className="mt-4 space-y-2">
            {(Object.entries(stats.updatesByPriority) as [string, number][]).map(
              ([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <PriorityBadge priority={priority as never} />
                  <span className="text-sm font-medium text-foreground">
                    {count}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-base text-navy-900 dark:text-foreground">
          Updates by country
        </h2>
        <div className="mt-4">
          <BarChart
            data={stats.updatesByCountry.map((c) => ({
              label: c.countryName.length > 10 ? c.countryName.slice(0, 9) + "…" : c.countryName,
              value: c.count,
            }))}
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base text-navy-900 dark:text-foreground">
            Most recent updates
          </h2>
          <Link
            href="/updates"
            className="text-sm font-medium text-navy-900 underline dark:text-foreground"
          >
            View all
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {recent.map((u) => (
            <li key={u.id} className="flex items-start justify-between gap-4 py-3">
              <div>
                <Link
                  href={`/updates/${u.id}`}
                  className="text-sm font-medium text-navy-900 hover:underline dark:text-foreground"
                >
                  {u.title}
                </Link>
                <p className="mt-1 text-xs text-foreground-muted">
                  {countryName(u.countryId)} · {new Date(u.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <PriorityBadge priority={u.priority} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
