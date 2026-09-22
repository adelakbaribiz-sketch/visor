"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { COUNTRIES, VISA_TYPES } from "@/lib/data/fixtures";

const STEPS = ["Firm details", "Countries you track", "Invite your team"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([
    "c-us",
    "c-uk",
  ]);

  function toggleCountry(id: string) {
    setSelectedCountries((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
          Set up your workspace
        </h1>
        <p className="text-sm text-foreground-muted">
          A UI stub — selections here are not persisted anywhere. This shows
          the intended onboarding flow rather than a working configuration
          step.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                i <= step
                  ? "bg-navy-900 text-white"
                  : "bg-surface-muted text-foreground-muted"
              }`}
            >
              {i + 1}
            </div>
            <span className="text-xs text-foreground-muted">{label}</span>
            {i < STEPS.length - 1 && (
              <div className="h-px flex-1 bg-border" />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        {step === 0 && (
          <div className="space-y-3">
            <label className="block text-xs font-medium text-foreground-muted">
              Firm name
              <input
                defaultValue="Northbridge Immigration Partners"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
              />
            </label>
            <label className="block text-xs font-medium text-foreground-muted">
              Firm size
              <select className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700">
                <option>1–10</option>
                <option>11–50</option>
                <option>51–200</option>
                <option>200+</option>
              </select>
            </label>
          </div>
        )}
        {step === 1 && (
          <div>
            <p className="mb-3 text-xs text-foreground-muted">
              Select the countries your firm files in. Visor will track
              embassy/government sources for these.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedCountries.includes(c.id)}
                    onChange={() => toggleCountry(c.id)}
                  />
                  {c.name}
                  <span className="ml-auto text-xs text-foreground-muted">
                    {VISA_TYPES.filter((v) => v.countryId === c.id).length} visa
                    types
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <p className="text-xs text-foreground-muted">
              Invites are not sent in this demo — no email delivery is
              implemented.
            </p>
            <input
              placeholder="colleague@yourfirm.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-navy-700"
            />
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="rounded-md border border-border px-4 py-2 text-sm disabled:opacity-40"
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
          >
            Go to dashboard
          </button>
        )}
      </div>
    </div>
  );
}
