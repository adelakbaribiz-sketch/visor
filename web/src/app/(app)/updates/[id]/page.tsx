import Link from "next/link";
import { notFound } from "next/navigation";
import { PriorityBadge } from "@/components/Badge";
import {
  getCountryById,
  getUpdateById,
  getUpdates,
  getVisaTypeById,
} from "@/lib/data/client";
import { Surface } from "@/components/Surface";

export default async function UpdateDetailPage({
  params,
}: PageProps<"/updates/[id]">) {
  const { id } = await params;
  const update = await getUpdateById(id);
  if (!update) notFound();

  const [country, visaType, related] = await Promise.all([
    getCountryById(update.countryId),
    getVisaTypeById(update.visaTypeId),
    getUpdates({ countryId: update.countryId }),
  ]);
  const relatedOthers = related.filter((u) => u.id !== update.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/updates" className="text-sm text-foreground-muted hover:underline">
        ← Back to updates
      </Link>

      <Surface padding="lg">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl text-navy-900 dark:text-foreground">
            {update.title}
          </h1>
          <PriorityBadge priority={update.priority} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-muted">
          <span>{country?.name ?? "Unknown country"}</span>
          {visaType && <span>{visaType.code} — {visaType.label}</span>}
          <span>Published {new Date(update.publishedAt).toLocaleDateString()}</span>
          <span>Ingested {new Date(update.ingestedAt).toLocaleDateString()}</span>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-foreground">
          {update.summary}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {update.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs text-foreground-muted"
            >
              #{t}
            </span>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-border bg-surface-muted p-4 text-xs text-foreground-muted">
          <p>
            <span className="font-medium text-foreground">Source:</span>{" "}
            {update.sourceName}
          </p>
          <a
            href={update.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block break-all text-navy-900 underline dark:text-foreground"
          >
            {update.sourceUrl}
          </a>
          <p className="mt-2">
            This is seeded demo content — the title and summary are fictional
            samples written for this project, not a transcription of a real
            government notice. See docs/DEMO.md.
          </p>
        </div>
      </Surface>

      {relatedOthers.length > 0 && (
        <Surface>
          <h2 className="font-display text-base text-navy-900 dark:text-foreground">
            More from {country?.name}
          </h2>
          <ul className="mt-3 divide-y divide-border">
            {relatedOthers.map((u) => (
              <li key={u.id} className="py-2">
                <Link
                  href={`/updates/${u.id}`}
                  className="text-sm text-navy-900 hover:underline dark:text-foreground"
                >
                  {u.title}
                </Link>
              </li>
            ))}
          </ul>
        </Surface>
      )}
    </div>
  );
}
