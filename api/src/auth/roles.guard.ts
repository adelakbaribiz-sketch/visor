import { Injectable, ForbiddenException, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator.js';
import type { JwtPayload } from './jwt.strategy.js';

/**
 * Real, enforced role check — not a stub. Applied to the updates-write
 * endpoint (see updates.controller.ts) as the one protected resource
 * required by the project scope: only ADMIN and ATTORNEY may create an
 * ImmigrationUpdate by hand; PARALEGAL and CLIENT get a 403.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const role = request.user?.role as UserRole | undefined;
    if (!role || !required.includes(role)) {
      throw new ForbiddenException(
        `This action requires one of the following roles: ${required.join(', ')}`,
      );
    }
    return true;
  }
}
