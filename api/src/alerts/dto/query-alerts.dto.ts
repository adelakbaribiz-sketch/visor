import { PaginationQueryDto } from '../../common/pagination.dto.js';

/** Alerts has no extra filters today - this exists as its own type (rather
 * than reusing PaginationQueryDto directly on the controller) so a
 * future alert-specific filter has an obvious place to go, matching the
 * pattern already used by updates/dto/query-updates.dto.ts. */
export class QueryAlertsDto extends PaginationQueryDto {}
