"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { VisorMark } from "@/components/AppShell";
import { login } from "@/lib/auth";
import { DEMO_USERS } from "@/lib/data/fixtures";
import { Surface } from "@/components/Surface";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("priya@northbridge.demo");
  const [password, setPassword] = useState("demo-password");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const user = login(email, password);
    if (!user) {
      setError("No demo user matches that email. Try one of the accounts below.");
      return;
    }
    const next = params.get("next") || "/dashboard";
    router.push(next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <VisorMark />
          <span className="font-display text-2xl text-navy-900 dark:text-foreground">
            Visor
          </span>
        </div>
        <Surface padding="lg">
          <h1 className="font-display text-lg text-navy-900 dark:text-foreground">
            Log in to your workspace
          </h1>
          <p className="mt-1 text-xs text-foreground-muted">
            Demo auth: this form checks against seeded sample accounts only.
            Any password works. Not a real login system — see docs/SECURITY.md.
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground-muted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
                required
              />
            </div>
            {error && <p className="text-xs text-danger-600">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
            >
              Log in
            </button>
          </form>
        </Surface>
        <div className="mt-4 rounded-lg border border-border bg-surface-muted p-4 text-xs text-foreground-muted">
          <p className="font-medium text-foreground">Demo accounts</p>
          <ul className="mt-2 space-y-1">
            {DEMO_USERS.map((u) => (
              <li key={u.id} className="flex justify-between">
                <span>{u.name}</span>
                <span className="font-mono">{u.email}</span>
                <span>{u.role}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-center text-xs text-foreground-muted">
          No account? <Link href="/signup" className="underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
