import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateUpdateDto } from './dto/create-update.dto.js';
import type { QueryUpdatesDto } from './dto/query-updates.dto.js';

@Injectable()
export class UpdatesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: QueryUpdatesDto) {
    return this.prisma.immigrationUpdate.findMany({
      where: {
        countryId: query.countryId,
        visaTypeId: query.visaTypeId,
        priority: query.priority,
      },
      include: { country: true, visaType: true },
      orderBy: { publishedAt: 'desc' },
      take: 200,
    });
  }

  async findOne(id: string) {
    const update = await this.prisma.immigrationUpdate.findUnique({
      where: { id },
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

  async stats() {
    const [total, byPriority, byCountry] = await Promise.all([
      this.prisma.immigrationUpdate.count(),
      this.prisma.immigrationUpdate.groupBy({ by: ['priority'], _count: true }),
      this.prisma.immigrationUpdate.groupBy({ by: ['countryId'], _count: true }),
    ]);
    return { total, byPriority, byCountry };
  }
}
