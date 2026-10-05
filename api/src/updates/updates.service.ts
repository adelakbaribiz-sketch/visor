import { Injectable, NotFoundException } from '@nestjs/common';
import { resolvePagination } from '../common/pagination.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateUpdateDto } from './dto/create-update.dto.js';
import type { QueryUpdatesDto } from './dto/query-updates.dto.js';

/**
 * ImmigrationUpdate.tenantId is nullable: NULL means shared reference data
 * (e.g. ingested from the Federal Register), a value means that tenant
 * owns the row. Nothing in the current code writes a tenant-owned update,
 * but the schema allows it, so every read path scopes to
 * "shared OR mine" now — otherwise the first tenant-owned row would be
 * readable (and fetchable by id) by every other tenant.
 */
export function visibleToTenant(tenantId: string) {
  return { OR: [{ tenantId: null }, { tenantId }] };
}

@Injectable()
export class UpdatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(tenantId: string, query: QueryUpdatesDto) {
    // Optional page/pageSize (see common/pagination.dto.ts); omitting both
    // preserves the previous hardcoded `take: 200` behavior exactly.
    const { skip, take } = resolvePagination(query);
    return this.prisma.immigrationUpdate.findMany({
      where: {
        ...visibleToTenant(tenantId),
        countryId: query.countryId,
        visaTypeId: query.visaTypeId,
        priority: query.priority,
      },
      include: { country: true, visaType: true },
      orderBy: { publishedAt: 'desc' },
      skip,
      take,
    });
  }

  async findOne(tenantId: string, id: string) {
    const update = await this.prisma.immigrationUpdate.findFirst({
      where: { id, ...visibleToTenant(tenantId) },
      include: { country: true, visaType: true },
    });
    if (!update) throw new NotFoundException('Update not found');
    return update;
  }

  create(dto: CreateUpdateDto) {
    return this.prisma.immigrationUpdate.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        sourceUrl: dto.sourceUrl,
        sourceName: dto.sourceName,
        countryId: dto.countryId,
        visaTypeId: dto.visaTypeId,
        priority: dto.priority,
        publishedAt: new Date(dto.publishedAt),
        tags: dto.tags ?? [],
      },
      include: { country: true, visaType: true },
    });
  }

  countries() {
    return this.prisma.country.findMany({ orderBy: { name: 'asc' } });
  }

  visaTypes(countryId?: string) {
    return this.prisma.visaType.findMany({
      where: countryId ? { countryId } : undefined,
      orderBy: { code: 'asc' },
    });
  }

  async stats(tenantId: string) {
    const where = visibleToTenant(tenantId);
    const [total, byPriority, byCountry] = await Promise.all([
      this.prisma.immigrationUpdate.count({ where }),
      this.prisma.immigrationUpdate.groupBy({ by: ['priority'], where, _count: true }),
      this.prisma.immigrationUpdate.groupBy({ by: ['countryId'], where, _count: true }),
    ]);
    return { total, byPriority, byCountry };
  }
}
