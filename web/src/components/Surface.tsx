import type { ElementType, HTMLAttributes } from "react";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  /** Rendered element; use "section" where the panel is a document section. */
  as?: ElementType;
  /** md = p-5 (default, dense panels), lg = p-6 (forms / detail cards). */
  padding?: "md" | "lg";
};

const PADDING = { md: "p-5", lg: "p-6" } as const;

/**
 * Base flat card container — the standard panel used throughout the app
 * (lists, forms, tables, secondary panels). This is the
 * `rounded-lg border border-border bg-surface p-5|p-6` pattern that was
 * copy-pasted ~18 times across 11 files before this component existed;
 * consolidating it here means the visual language changes in one place.
 *
 * Deliberately flat: per the 3D design direction (see
 * docs/UPGRADE-REPORT.md), depth is reserved for `ElevatedSurface` and
 * used only on semantically important content — dense panels stay flat
 * and fast.
 */
export function Surface({
  as: Tag = "div",
  padding = "md",
  className = "",
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={`rounded-lg border border-border bg-surface ${PADDING[padding]} ${className}`}
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
 * inert under `prefers-reduced-motion` (global rule in globals.css).
 *
 * Not for tables, forms, or dense list panels — those stay flat
 * (`Surface`) per the "3D is semantic, not decorative" rule.
 */
export function ElevatedSurface({
  as: Tag = "div",
  padding = "md",
  className = "",
  ...props
}: SurfaceProps) {
  return (
    <Tag
      className={`rounded-lg border border-border bg-surface ${PADDING[padding]} shadow-[var(--elevation-1)] transition-[transform,box-shadow] duration-[var(--motion-base)] ease-[var(--motion-ease)] hover:-translate-y-0.5 hover:shadow-[var(--elevation-2)] ${className}`}
      {...props}
    />
  );
}
