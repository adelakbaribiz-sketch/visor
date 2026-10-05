import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { SearchService } from './search.service.js';

// These tests only inspect the SQL template Prisma would receive (the
// real query has never been run against Postgres in the build sandbox —
// see docs/LIMITATIONS.md). They guard that the tenant scope clause and
// its bound parameter can't be dropped by a future edit.
describe('SearchService tenant scoping', () => {
  it('binds the tenant id into both the full-text and ILIKE fallback queries', async () => {
    const queryRaw = vi.fn().mockResolvedValue([]);
    const service = new SearchService({ $queryRaw: queryRaw } as unknown as PrismaService);

    await service.search('tenant-a', 'h-1b fee');

    expect(queryRaw).toHaveBeenCalledTimes(2); // FTS (empty) then fallback
    for (const [strings, ...values] of queryRaw.mock.calls as [string[], ...unknown[]][]) {
      expect(strings.join('?')).toContain('"tenantId" IS NULL OR u."tenantId" =');
      expect(values).toContain('tenant-a');
    }
  });

  it('returns nothing for a blank query without touching the database', async () => {
    const queryRaw = vi.fn();
    const service = new SearchService({ $queryRaw: queryRaw } as unknown as PrismaService);
    expect(await service.search('tenant-a', '   ')).toEqual([]);
    expect(queryRaw).not.toHaveBeenCalled();
  });
});
