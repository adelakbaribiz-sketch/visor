import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface SearchHit {
  id: string;
  title: string;
  summary: string;
  countryName: string;
  priority: string;
  publishedAt: Date;
  rank: number;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Real Postgres full-text search over ImmigrationUpdate.title/summary
   * using to_tsvector/websearch_to_tsquery, ranked with ts_rank. This is
   * the backing implementation for the "Ask Visor" chat endpoint — a
   * keyword search, not an LLM call. See docs/ARCHITECTURE.md "Chatbot"
   * for why, and llm-summarizer.ts for the documented, unused extension
   * point.
   *
   * Falls back to a plain ILIKE match if the tsquery is empty (e.g. the
   * user only typed stopwords), so short/odd queries still return
   * something reasonable instead of nothing.
   */
  async search(tenantId: string, query: string, limit = 5): Promise<SearchHit[]> {
    const q = query.trim();
    if (!q) return [];

    const ftsResults = await this.prisma.$queryRaw<SearchHit[]>`
      SELECT
        u.id,
        u.title,
        u.summary,
        c.name AS "countryName",
        u.priority::text AS priority,
        u."publishedAt",
        ts_rank(
          to_tsvector('english', u.title || ' ' || u.summary || ' ' || array_to_string(u.tags, ' ')),
          websearch_to_tsquery('english', ${q})
        ) AS rank
      FROM "ImmigrationUpdate" u
      JOIN "Country" c ON c.id = u."countryId"
      WHERE to_tsvector('english', u.title || ' ' || u.summary || ' ' || array_to_string(u.tags, ' '))
            @@ websearch_to_tsquery('english', ${q})
        AND (u."tenantId" IS NULL OR u."tenantId" = ${tenantId})
      ORDER BY rank DESC, u."publishedAt" DESC
      LIMIT ${limit}
    `;

    if (ftsResults.length > 0) return ftsResults;

    // ILIKE fallback — still a real database query, not a mock.
    const like = `%${q}%`;
    return this.prisma.$queryRaw<SearchHit[]>`
      SELECT
        u.id,
        u.title,
        u.summary,
        c.name AS "countryName",
        u.priority::text AS priority,
        u."publishedAt",
        0::float AS rank
      FROM "ImmigrationUpdate" u
      JOIN "Country" c ON c.id = u."countryId"
      WHERE (u.title ILIKE ${like} OR u.summary ILIKE ${like})
        AND (u."tenantId" IS NULL OR u."tenantId" = ${tenantId})
      ORDER BY u."publishedAt" DESC
      LIMIT ${limit}
    `;
  }
}
