"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PriorityBadge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import type { Country, ImmigrationUpdate, Priority, VisaType } from "@/lib/data/types";

const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export function UpdatesExplorer({
  updates,
  countries,
  visaTypes,
}: {
  updates: ImmigrationUpdate[];
  countries: Country[];
  visaTypes: VisaType[];
}) {
  const [query, setQuery] = useState("");
  const [countryId, setCountryId] = useState("");
  const [priority, setPriority] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return updates.filter((u) => {
      if (countryId && u.countryId !== countryId) return false;
      if (priority && u.priority !== priority) return false;
      if (q) {
        const haystack = `${u.title} ${u.summary} ${u.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [updates, query, countryId, priority]);

  const countryName = (id: string) => countries.find((c) => c.id === id)?.name ?? id;
  const visaLabel = (id: string | null) =>
    id ? visaTypes.find((v) => v.id === id)?.code ?? id : "—";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, summary, or tag…"
          className="w-64 rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy-700"
        />
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy-700"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-navy-700"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        {(query || countryId || priority) && (
          <button
            onClick={() => {
              setQuery("");
              setCountryId("");
              setPriority("");
            }}
            className="text-sm text-foreground-muted underline"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-foreground-muted">
          {filtered.length} of {updates.length} updates
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No updates match those filters"
          description="Try clearing a filter or searching a broader term. This list is seeded demo data, not a live feed."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-foreground-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Country</th>
                <th className="px-4 py-3 font-medium">Visa type</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-surface-muted">
                  <td className="max-w-md px-4 py-3">
                    <Link
                      href={`/updates/${u.id}`}
                      className="font-medium text-navy-900 hover:underline dark:text-foreground"
                    >
                      {u.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {countryName(u.countryId)}
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {visaLabel(u.visaTypeId)}
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={u.priority} />
                  </td>
                  <td className="px-4 py-3 text-foreground-muted">
                    {new Date(u.publishedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
