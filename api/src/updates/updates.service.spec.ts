import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { PrismaService } from '../prisma/prisma.service.js';
import { UpdatesService, visibleToTenant } from './updates.service.js';

function build() {
  const immigrationUpdate = {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    count: vi.fn().mockResolvedValue(0),
    groupBy: vi.fn().mockResolvedValue([]),
  };
  const service = new UpdatesService({ immigrationUpdate } as unknown as PrismaService);
  return { service, immigrationUpdate };
}

describe('UpdatesService tenant scoping (regression: cross-tenant read)', () => {
  const scope = visibleToTenant('tenant-a');

  it('visibleToTenant allows shared (null) rows and the tenant\'s own rows only', () => {
    expect(scope).toEqual({ OR: [{ tenantId: null }, { tenantId: 'tenant-a' }] });
  });

  it('findAll applies the tenant scope alongside caller filters', async () => {
    const { service, immigrationUpdate } = build();
    await service.findAll('tenant-a', { priority: 'HIGH' });
    const args = immigrationUpdate.findMany.mock.calls[0][0];
    expect(args.where).toMatchObject({ ...scope, priority: 'HIGH' });
  });

  it('findOne returns 404 (not the row) when the id belongs to another tenant', async () => {
    const { service, immigrationUpdate } = build();
    await expect(service.findOne('tenant-a', 'upd-of-tenant-b')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(immigrationUpdate.findFirst.mock.calls[0][0].where).toMatchObject({
      id: 'upd-of-tenant-b',
      ...scope,
    });
  });

  it('stats scopes the total and both groupBy aggregates', async () => {
    const { service, immigrationUpdate } = build();
    await service.stats('tenant-a');
    expect(immigrationUpdate.count.mock.calls[0][0].where).toEqual(scope);
    for (const call of immigrationUpdate.groupBy.mock.calls) {
      expect(call[0].where).toEqual(scope);
    }
  });
});
