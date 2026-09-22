import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { JwtPayload } from '../auth/jwt.strategy.js';
import { AlertsService } from './alerts.service.js';

// Notification RECORDS only. No email/Telegram/webhook delivery happens
// anywhere in this codebase — see LIMITATIONS.md.
@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alerts: AlertsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.alerts.findForTenant(user.tenantId);
  }
}
