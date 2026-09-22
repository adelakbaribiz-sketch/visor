import { Injectable } from '@nestjs/common';
import { resolvePagination } from '../common/pagination.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { QueryAlertsDto } from './dto/query-alerts.dto.js';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  findForTenant(tenantId: string, query: QueryAlertsDto = {}) {
    const { skip, take } = resolvePagination(query);
    return this.prisma.alert.findMany({
      where: { tenantId },
      include: { update: true, user: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }
}
