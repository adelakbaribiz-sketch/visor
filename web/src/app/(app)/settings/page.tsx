import { DemoDataBadge } from "@/components/Badge";
import { DEMO_USERS, DEMO_TENANT } from "@/lib/data/fixtures";

const STATUS_ROWS: { area: string; status: string; note: string }[] = [
  { area: "Authentication (this frontend)", status: "MOCK", note: "localStorage session, any password accepted for a seeded email" },
  { area: "Authentication (api/ service)", status: "REAL", note: "JWT + bcrypt, verified against a running Postgres instance — see docs/DEMO.md" },
  { area: "Update data shown here", status: "SIMULATED", note: "Fictional seed fixtures, not a live crawl" },
  { area: "Federal Register ingestion script", status: "REAL, UNVERIFIED IN THIS SANDBOX", note: "Fetch/parse/store code exists in api/src/ingestion; this environment has no outbound network access to run it against the live API" },
  { area: "Chat search", status: "REAL", note: "Keyword match over the records in this browser session" },
  { area: "LLM-powered chat summarization", status: "NOT ENABLED", note: "Optional extension point behind OPENAI_API_KEY; not wired to any provider" },
  { area: "Email / Telegram alert delivery", status: "NOT IMPLEMENTED", note: "Alerts are stored records only" },
  { area: "Billing", status: "NOT IMPLEMENTED", note: "No Stripe integration; see ROADMAP.md" },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
          Settings
        </h1>
        <p className="text-sm text-foreground-muted">
          Workspace, team, and an honest status of what in this demo is real
          vs. simulated.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-base text-navy-900 dark:text-foreground">
          Workspace
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-foreground-muted">Name</dt>
            <dd>{DEMO_TENANT.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-foreground-muted">Plan</dt>
            <dd>{DEMO_TENANT.planLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <h2 className="font-display text-base text-navy-900 dark:text-foreground">
          Team
        </h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-foreground-muted">
            <tr>
              <th className="py-1 font-medium">Name</th>
              <th className="py-1 font-medium">Email</th>
              <th className="py-1 font-medium">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DEMO_USERS.map((u) => (
              <tr key={u.id}>
                <td className="py-2">{u.name}</td>
                <td className="py-2 text-foreground-muted">{u.email}</td>
                <td className="py-2">
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-foreground-muted">
          Inviting new team members is not implemented in this demo.
        </p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base text-navy-900 dark:text-foreground">
            What&apos;s real in this build
          </h2>
          <DemoDataBadge label="Honesty table" />
        </div>
        <div className="mt-3 divide-y divide-border">
          {STATUS_ROWS.map((row) => (
            <div key={row.area} className="py-2.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-foreground">
                  {row.area}
                </span>
                <span className="whitespace-nowrap rounded-full border border-border px-2 py-0.5 text-xs text-foreground-muted">
                  {row.status}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-foreground-muted">{row.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
