// Domain types for the Visor frontend.
//
// These intentionally mirror the Prisma schema in api/prisma/schema.prisma
// (see docs/DATA_MODEL.md) so the mock data layer and a future real API
// response shape line up without a rewrite of the UI.

export type Role = "ADMIN" | "ATTORNEY" | "PARALEGAL" | "CLIENT";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type AlertStatus = "UNREAD" | "READ" | "DISMISSED";

export interface Tenant {
  id: string;
  name: string;
  planLabel: string; // e.g. "Demo workspace" — no real billing plan exists
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  avatarInitials: string;
}

export interface Country {
  id: string;
  code: string; // ISO 3166-1 alpha-2
  name: string;
}

export interface VisaType {
  id: string;
  countryId: string;
  code: string;
  label: string;
}

export interface ImmigrationUpdate {
  id: string;
  tenantId: string;
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  countryId: string;
  visaTypeId: string | null;
  priority: Priority;
  publishedAt: string;
  ingestedAt: string;
  tags: string[];
}

export interface AlertRecord {
  id: string;
  tenantId: string;
  updateId: string;
  userId: string;
  status: AlertStatus;
  createdAt: string;
  channel: "IN_APP"; // email/Telegram delivery is NOT IMPLEMENTED — see LIMITATIONS.md
}

export interface UsageStats {
  totalUpdates: number;
  updatesLast30Days: number;
  countriesTracked: number;
  unreadAlerts: number;
  updatesByPriority: Record<Priority, number>;
  updatesByCountry: { countryName: string; count: number }[];
  updatesTimeline: { date: string; count: number }[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  matchedUpdateIds?: string[];
  createdAt: string;
}
