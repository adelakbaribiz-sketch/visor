import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { SearchService } from './search.service.js';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  // Backs the "Ask Visor" chat UI. `q` is the user's chat message;
  // response is the ranked list of matching updates, in JSON — the
  // frontend renders that list as the assistant's reply.
  @Get()
  async chat(@Query('q') q: string) {
    const hits = await this.search.search(q ?? '');
    return {
      query: q ?? '',
      resultCount: hits.length,
      results: hits,
    };
  }
}
