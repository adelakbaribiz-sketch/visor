import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it, vi } from 'vitest';
import { RolesGuard } from './roles.guard.js';

function makeContext(role: string | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user: role ? { sub: 'u1', tenantId: 't1', role } : undefined }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows the request through when no @Roles metadata is set', () => {
    const reflector = { getAllAndOverride: vi.fn().mockReturnValue(undefined) } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext('CLIENT'))).toBe(true);
  });

  it('allows a request whose role is in the required list', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN', 'ATTORNEY']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext('ATTORNEY'))).toBe(true);
  });

  it('rejects a request whose role is not in the required list', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN', 'ATTORNEY']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext('PARALEGAL'))).toThrow(ForbiddenException);
  });

  it('rejects a request with no authenticated user', () => {
    const reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN']),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(() => guard.canActivate(makeContext(undefined))).toThrow(ForbiddenException);
  });
});
