import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'connected' };
    } catch (error) {
      // This endpoint has no auth guard (by design — orchestrators/load
      // balancers need to hit it unauthenticated), so the raw DB error
      // message (which can include hostnames/connection detail) is logged
      // server-side only, never returned to an anonymous caller. Matches
      // the documented `{ status, database }` shape in docs/API_SPEC.md,
      // which never promised an `error` field.
      this.logger.error(
        'Health check database query failed',
        error instanceof Error ? error.stack : String(error),
      );
      return { status: 'degraded', database: 'unreachable' };
    }
  }
}
