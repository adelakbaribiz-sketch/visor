"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import type { User } from "@/lib/data/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/updates", label: "Updates", icon: "list" },
  { href: "/chat", label: "Ask Visor", icon: "chat" },
  { href: "/alerts", label: "Alerts", icon: "bell" },
  { href: "/settings", label: "Settings", icon: "gear" },
] as const;

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="8" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6" />
          <path d="M9.5 20a2.5 2.5 0 0 0 5 0" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.96 19a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.96a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1.04-1.56V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.16.62.62 1.14 1.56 1.04H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15z" />
        </svg>
      );
    default:
      return null;
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null | "loading">("loading");

  useEffect(() => {
    // Reading the demo session is deliberately deferred to an effect
    // rather than a useState lazy initializer: localStorage is a
    // client-only external source, and syncing it into React state here
    // (rather than during render) keeps the server-rendered "loading"
    // markup and the client's first paint identical, avoiding a
    // hydration mismatch.
    const current = getCurrentUser();
    if (!current) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from an external, client-only source (localStorage) on mount; see comment above
    setUser(current);
  }, [pathname, router]);

  if (user === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-foreground-muted">Loading Visor…</p>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 flex-col border-r border-border bg-navy-950 text-white md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <VisorMark />
          <span className="font-display text-lg tracking-wide">Visor</span>
        </div>
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-navy-800 text-white"
                    : "text-white/70 hover:bg-navy-900 hover:text-white"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/50">
          Northbridge Immigration Partners
          <br />
          Demo workspace
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
          <div className="md:hidden flex items-center gap-2">
            <VisorMark small />
            <span className="font-display text-base">Visor</span>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground-muted">{user.name}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-100 text-xs font-semibold text-gold-600">
              {user.avatarInitials}
            </span>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted hover:bg-surface-muted"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 px-6 py-6">{children}</main>
        <nav className="flex justify-around border-t border-border bg-surface py-2 md:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                pathname.startsWith(item.href)
                  ? "text-navy-900 dark:text-foreground"
                  : "text-foreground-muted"
              }`}
            >
              <NavIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function VisorMark({ small }: { small?: boolean }) {
  const size = small ? 22 : 26;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="var(--color-gold-500)" />
      <path
        d="M8 12 L16 22 L24 12"
        stroke="var(--color-navy-950)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="10.5" r="2" fill="var(--color-navy-950)" />
    </svg>
  );
}
