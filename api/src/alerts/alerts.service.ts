import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  findForTenant(tenantId: string) {
    return this.prisma.alert.findMany({
      where: { tenantId },
      include: { update: true, user: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }
}
