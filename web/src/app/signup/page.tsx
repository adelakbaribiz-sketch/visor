"use client";

import Link from "next/link";
import { useState } from "react";
import { VisorMark } from "@/components/AppShell";
import { Surface } from "@/components/Surface";

export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false);

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
          {submitted ? (
            <div className="text-center">
              <h1 className="font-display text-lg text-navy-900 dark:text-foreground">
                Thanks for your interest
              </h1>
              <p className="mt-2 text-sm text-foreground-muted">
                This is a portfolio demo, so no account is actually created
                and no email is sent — signup here is a UI stub only.
              </p>
              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-navy-900 underline dark:text-foreground"
              >
                Try the demo login instead
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-lg text-navy-900 dark:text-foreground">
                Request access
              </h1>
              <p className="mt-1 text-xs text-foreground-muted">
                UI stub only — no account is created and nothing is sent
                anywhere. Use the demo login to explore the product.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="mt-5 space-y-3"
              >
                <div>
                  <label className="text-xs font-medium text-foreground-muted">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
                    placeholder="you@lawfirm.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground-muted">
                    Firm name
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
                    placeholder="Northbridge Immigration Partners"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
                >
                  Request access
                </button>
              </form>
            </>
          )}
        </Surface>
        <p className="mt-4 text-center text-xs text-foreground-muted">
          Already have access? <Link href="/login" className="underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
