import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the given roles. Must be combined with
 * `@UseGuards(JwtAuthGuard, RolesGuard)` — RolesGuard reads this metadata
 * and JwtAuthGuard is what populates `request.user` in the first place.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
