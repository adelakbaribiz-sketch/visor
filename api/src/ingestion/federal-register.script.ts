/**
 * Real ingestion path: fetch -> parse -> store, against the U.S. Federal
 * Register's public JSON API (https://www.federalregister.gov/developers/documentation/api/v1),
 * which is free, requires no API key, and regularly publishes immigration
 * rules (mostly from DHS/USCIS/DOS). This is the ONE real external source
 * this project ingests from, per project scope.
 *
 * IMPORTANT — sandbox limitation, not a code defect: this script was
 * written and type-checked in a development sandbox with NO outbound
 * network access (verified: `curl https://www.federalregister.gov/...`
 * timed out after 15s, as did a plain `curl https://www.google.com`).
 * That means this script's HTTP call has NOT been exercised against the
 * live API from this environment. Run it yourself with:
 *
 *   cd api && npm run ingest:federal-register
 *
 * and report back what happened — see docs/DEMO.md and LIMITATIONS.md,
 * which document this honestly instead of claiming a live run that did
 * not happen.
 *
 * Idempotent: each Federal Register document's `document_number` is
 * stored as ImmigrationUpdate.externalId (unique), so re-running this
 * script upserts rather than duplicates.
 */
import { PrismaClient, type Priority } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const API_BASE = 'https://www.federalregister.gov/api/v1/documents.json';
const US_COUNTRY_CODE = 'US';

interface FederalRegisterDocument {
  document_number: string;
  title: string;
  abstract: string | null;
  html_url: string;
  publication_date: string; // YYYY-MM-DD
  agencies?: { name: string }[];
  type: string; // e.g. "Rule", "Proposed Rule", "Notice"
}

interface FederalRegisterResponse {
  count: number;
  results: FederalRegisterDocument[];
}

function buildQueryUrl(): string {
  const params = new URLSearchParams({
    'per_page': '40',
    'order': 'newest',
    'conditions[term]': 'immigration',
    'conditions[type][]': 'RULE',
  });
  // Append a second type filter separately since URLSearchParams would
  // overwrite a repeated key if set via the object form above.
  params.append('conditions[type][]', 'PRORULE');
  params.append('conditions[type][]', 'NOTICE');
  return `${API_BASE}?${params.toString()}`;
}

function priorityFor(doc: FederalRegisterDocument): Priority {
  if (doc.type === 'Rule') return 'HIGH';
  if (doc.type === 'Proposed Rule') return 'MEDIUM';
  return 'LOW';
}

async function fetchDocuments(): Promise<FederalRegisterDocument[]> {
  const url = buildQueryUrl();
  console.log(`Fetching: ${url}`);

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Federal Register API returned HTTP ${res.status}: ${await res.text()}`);
  }

  const body = (await res.json()) as FederalRegisterResponse;
  console.log(`Federal Register reports ${body.count} total matches; fetched ${body.results.length}.`);
  return body.results;
}

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const country = await prisma.country.upsert({
      where: { code: US_COUNTRY_CODE },
      update: {},
      create: { code: US_COUNTRY_CODE, name: 'United States' },
    });

    const documents = await fetchDocuments();
    let upserted = 0;

    for (const doc of documents) {
      const data = {
        title: doc.title.slice(0, 500),
        summary: (doc.abstract ?? 'No abstract provided by the Federal Register API.').slice(0, 2000),
        sourceUrl: doc.html_url,
        sourceName: `Federal Register — ${doc.agencies?.[0]?.name ?? 'Unknown agency'}`,
        countryId: country.id,
        priority: priorityFor(doc),
        publishedAt: new Date(doc.publication_date),
        tags: [doc.type.toLowerCase().replace(/\s+/g, '-')],
      };

      await prisma.immigrationUpdate.upsert({
        where: { externalId: doc.document_number },
        update: data,
        create: { ...data, externalId: doc.document_number },
      });
      upserted += 1;
    }

    console.log(`Ingestion complete. Upserted ${upserted} documents into ImmigrationUpdate for ${country.name}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Federal Register ingestion failed:', error);
  process.exitCode = 1;
});
