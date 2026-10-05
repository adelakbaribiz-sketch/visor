import type { HTMLAttributes } from "react";

type SurfaceProps = HTMLAttributes<HTMLDivElement>;

/**
 * Base flat card container — the standard panel used throughout the app
 * (lists, forms, tables, secondary panels). This is the exact
 * `rounded-lg border border-border bg-surface p-5` pattern that appeared
 * ~18 times across 11 files before this component existed; consolidating
 * it here means the visual language changes in one place, not eleven.
 *
 * Deliberately flat: per the 3D design direction (see
 * docs/UPGRADE-REPORT.md), depth is reserved for `ElevatedSurface` and
 * used only on semantically important content — dense panels stay flat
 * and fast.
 */
export function Surface({ className = "", ...props }: SurfaceProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-5 ${className}`}
      {...props}
    />
  );
}

/**
 * Elevated surface for semantically important content only — KPI stat
 * cards, hero/primary panels. Adds a subtle brand-tinted shadow (see the
 * `--elevation-*` tokens in globals.css) and a short, GPU-friendly
 * hover-lift built from `transform` + `box-shadow` only (never a
 * layout-affecting property), so it doesn't trigger reflow. Fully
 * inert under `prefers-reduced-motion` (see the global rule in
 * globals.css) and costs nothing on pages that don't use it.
 *
 * Not for tables, forms, or dense list panels — those should stay flat
 * (`Surface`) per the brief's "3D is semantic, not decorative" rule.
 */
export function ElevatedSurface({ className = "", ...props }: SurfaceProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-5 shadow-[var(--elevation-1)] transition-[transform,box-shadow] duration-[var(--motion-base)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)] ${className}`}
      {...props}
    />
  );
}
