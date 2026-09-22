import Link from "next/link";
import { VisorMark } from "@/components/AppShell";

const FEATURES = [
  {
    title: "Continuous source monitoring",
    body: "Visor watches embassy, government, and news sources for immigration rule changes so your team doesn't have to check manually.",
  },
  {
    title: "One searchable record",
    body: "Every change is normalized into a single record — country, visa type, priority, source link — and stored centrally for the whole firm.",
  },
  {
    title: "Ask Visor",
    body: "A keyword-search assistant over your update history answers 'what changed for H-1B this month' in seconds, not a source-by-source hunt.",
  },
  {
    title: "Real-time change alerts",
    body: "Attorneys and paralegals see new high-priority changes the moment they're ingested, scoped to the countries and visa types they follow.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <VisorMark />
            <span className="font-display text-xl text-navy-900 dark:text-foreground">
              Visor
            </span>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm text-foreground-muted hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              Get a demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20">
          <span className="inline-flex items-center rounded-full border border-gold-600/30 bg-gold-100 px-3 py-1 text-xs font-medium text-gold-600">
            Demo build — sample data, not a live product
          </span>
          <h1 className="mt-6 max-w-2xl font-display text-4xl leading-tight text-navy-900 sm:text-5xl dark:text-foreground">
            Immigration rules change weekly. Your firm shouldn&apos;t find out
            from a client.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-foreground-muted">
            Visor centralizes embassy and government immigration updates,
            makes them searchable in plain language, and alerts your team the
            moment something relevant changes.
          </p>
          <div className="mt-8 flex gap-3">
            <Link
              href="/login"
              className="rounded-md bg-navy-900 px-5 py-3 text-sm font-medium text-white hover:bg-navy-800"
            >
              View the demo dashboard
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-surface-muted"
            >
              Explore without logging in
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-border p-5">
                <h3 className="font-display text-base text-navy-900 dark:text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm text-foreground-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="font-display text-2xl text-navy-900 dark:text-foreground">
            Built for immigration teams, not generic legal ops
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-4">
            {["Admin", "Attorney", "Paralegal", "Client"].map((role) => (
              <div
                key={role}
                className="rounded-lg border border-border bg-surface px-4 py-3 text-sm"
              >
                <p className="font-medium text-navy-900 dark:text-foreground">
                  {role}
                </p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Role-scoped access to updates, alerts, and the firm
                  workspace.
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-6 text-xs text-foreground-muted">
        <div className="mx-auto max-w-6xl">
          Visor is a portfolio demo project. No real customers, revenue, or
          live crawling occur in this deployment — see{" "}
          <Link href="/settings" className="underline">
            the settings page
          </Link>{" "}
          and the project docs for what is real vs. simulated.
        </div>
      </footer>
    </div>
  );
}
