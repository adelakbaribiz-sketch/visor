import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/** Hard ceiling on page size regardless of what a caller requests. */
export const MAX_PAGE_SIZE = 100;
/** Historical default — matches the previous hardcoded `take: 200` behavior
 * exactly when no pagination params are supplied, so this is additive, not
 * a breaking change to the existing response shape (still a plain array). */
export const DEFAULT_PAGE_SIZE = 200;

export class PaginationQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_SIZE)
  pageSize?: number;
}

/**
 * Resolves `{ skip, take }` from optional page/pageSize query params.
 *
 * Backward compatible: with neither param supplied, behaves exactly like
 * the previous hardcoded `take: 200, skip: undefined`. Once a caller opts
 * in to `page`/`pageSize`, results are capped at MAX_PAGE_SIZE per page -
 * real protection against a single query pulling the entire table as the
 * dataset grows (see docs/UPGRADE-REPORT.md).
 */
export function resolvePagination(query: PaginationQueryDto): { skip?: number; take: number } {
  if (query.page === undefined && query.pageSize === undefined) {
    return { take: DEFAULT_PAGE_SIZE };
  }
  const pageSize = Math.min(query.pageSize ?? MAX_PAGE_SIZE, MAX_PAGE_SIZE);
  const page = query.page ?? 1;
  return { skip: (page - 1) * pageSize, take: pageSize };
}
