// Thin data-access layer for the Visor frontend.
//
// Every page imports from here, never from ./fixtures directly. Today
// every function reads from the in-memory fixtures below. To point the
// app at the real NestJS API instead, swap the function bodies to call
// `fetch(`${process.env.NEXT_PUBLIC_API_URL}/...`)` while keeping the
// same signatures and return types — no page/component changes required.
// This is the extension point documented in docs/ARCHITECTURE.md.
//
// process.env.NEXT_PUBLIC_API_URL is read but unused today; it is wired
// through env config so the swap above is a localized change.

import {
  ALERTS,
  COUNTRIES,
  DEMO_TENANT,
  IMMIGRATION_UPDATES,
  VISA_TYPES,
} from "./fixtures";
import type {
  AlertRecord,
  Country,
  ImmigrationUpdate,
  Priority,
  UsageStats,
  VisaType,
} from "./types";

export interface UpdateFilters {
  query?: string;
  countryId?: string;
  visaTypeId?: string;
  priority?: Priority;
}

function matchesQuery(update: ImmigrationUpdate, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    update.title.toLowerCase().includes(q) ||
    update.summary.toLowerCase().includes(q) ||
    update.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export async function getCountries(): Promise<Country[]> {
  return COUNTRIES;
}

export async function getVisaTypes(countryId?: string): Promise<VisaType[]> {
  return countryId
    ? VISA_TYPES.filter((v) => v.countryId === countryId)
    : VISA_TYPES;
}

export async function getUpdates(
  filters: UpdateFilters = {},
): Promise<ImmigrationUpdate[]> {
  return IMMIGRATION_UPDATES.filter((u) => {
    if (filters.countryId && u.countryId !== filters.countryId) return false;
    if (filters.visaTypeId && u.visaTypeId !== filters.visaTypeId) return false;
    if (filters.priority && u.priority !== filters.priority) return false;
    if (filters.query && !matchesQuery(u, filters.query)) return false;
    return true;
  }).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function getUpdateById(
  id: string,
): Promise<ImmigrationUpdate | null> {
  return IMMIGRATION_UPDATES.find((u) => u.id === id) ?? null;
}

export async function getAlerts(): Promise<AlertRecord[]> {
  return [...ALERTS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getCountryById(id: string): Promise<Country | null> {
  return COUNTRIES.find((c) => c.id === id) ?? null;
}

export async function getVisaTypeById(id: string | null): Promise<VisaType | null> {
  if (!id) return null;
  return VISA_TYPES.find((v) => v.id === id) ?? null;
}

/**
 * Keyword search used by both the /updates filter box and the /chat
 * assistant. This is the same matching approach the real backend uses
 * (Postgres ILIKE / to_tsvector, see api/src/search) — a plain
 * case-insensitive substring/keyword match, deliberately not an LLM call.
 * See docs/ARCHITECTURE.md "Chatbot" for why.
 */
export async function searchUpdates(query: string): Promise<ImmigrationUpdate[]> {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);
  if (terms.length === 0) return [];

  return IMMIGRATION_UPDATES.filter((u) => {
    const haystack = `${u.title} ${u.summary} ${u.tags.join(" ")}`.toLowerCase();
    return terms.some((t) => haystack.includes(t));
  })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 5);
}

export async function getUsageStats(): Promise<UsageStats> {
  const updates = IMMIGRATION_UPDATES;
  const now = new Date("2026-09-22T09:00:00.000Z");
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30);

  const updatesLast30Days = updates.filter(
    (u) => new Date(u.publishedAt) >= thirtyDaysAgo,
  ).length;

  const updatesByPriority: Record<Priority, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  for (const u of updates) updatesByPriority[u.priority]++;

  const countryCounts = new Map<string, number>();
  for (const u of updates) {
    countryCounts.set(u.countryId, (countryCounts.get(u.countryId) ?? 0) + 1);
  }
  const updatesByCountry = COUNTRIES.map((c) => ({
    countryName: c.name,
    count: countryCounts.get(c.id) ?? 0,
  })).sort((a, b) => b.count - a.count);

  // Bucket updates into 7-day windows over the last 6 weeks for the
  // dashboard sparkline — computed from the same fixture dates above,
  // not a separately fabricated series.
  const weeks: { date: string; count: number }[] = [];
  for (let w = 5; w >= 0; w--) {
    const start = new Date(now);
    start.setUTCDate(start.getUTCDate() - (w + 1) * 7);
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() - w * 7);
    const count = updates.filter((u) => {
      const d = new Date(u.publishedAt);
      return d >= start && d < end;
    }).length;
    weeks.push({ date: start.toISOString().slice(0, 10), count });
  }

  const unreadAlerts = ALERTS.filter((a) => a.status === "UNREAD").length;

  return {
    totalUpdates: updates.length,
    updatesLast30Days,
    countriesTracked: COUNTRIES.length,
    unreadAlerts,
    updatesByPriority,
    updatesByCountry,
    updatesTimeline: weeks,
  };
}

export async function getTenant() {
  return DEMO_TENANT;
}
