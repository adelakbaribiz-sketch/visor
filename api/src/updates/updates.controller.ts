import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { CreateUpdateDto } from './dto/create-update.dto.js';
import { QueryUpdatesDto } from './dto/query-updates.dto.js';
import { UpdatesService } from './updates.service.js';

@ApiTags('updates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('updates')
export class UpdatesController {
  constructor(private readonly updates: UpdatesService) {}

  @Get()
  findAll(@Query() query: QueryUpdatesDto) {
    return this.updates.findAll(query);
  }

  @Get('stats')
  stats() {
    return this.updates.stats();
  }

  @Get('countries')
  countries() {
    return this.updates.countries();
  }

  @Get('visa-types')
  visaTypes(@Query('countryId') countryId?: string) {
    return this.updates.visaTypes(countryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.updates.findOne(id);
  }

  // The one write endpoint enforcing roles at the API layer: only ADMIN and
  // ATTORNEY accounts may create an update by hand. PARALEGAL/CLIENT tokens
  // are authenticated (pass JwtAuthGuard) but get a 403 from RolesGuard.
  // The role check itself is unit-tested (roles.guard.spec.ts). This route
  // has NOT been exercised over HTTP against a live Postgres in the build
  // sandbox (no Docker/network) — see docs/LIMITATIONS.md. docs/DEMO.md
  // lists the commands to run it yourself.
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'ATTORNEY')
  @Post()
  create(@Body() dto: CreateUpdateDto) {
    return this.updates.create(dto);
  }
}
