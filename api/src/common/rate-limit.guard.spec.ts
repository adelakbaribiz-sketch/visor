import type { ExecutionContext } from '@nestjs/common';
import { HttpException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RateLimitGuard } from './rate-limit.guard.js';

function contextForIp(ip: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ ip }),
    }),
  } as unknown as ExecutionContext;
}

describe('RateLimitGuard', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the configured limit', () => {
    const guard = new RateLimitGuard(3, 60_000);
    const ctx = contextForIp('1.2.3.4');

    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects the request once the limit is exceeded, with 429', () => {
    const guard = new RateLimitGuard(2, 60_000);
    const ctx = contextForIp('5.6.7.8');

    guard.canActivate(ctx);
    guard.canActivate(ctx);

    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
    try {
      guard.canActivate(ctx);
      expect.unreachable('expected canActivate to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect((error as HttpException).getStatus()).toBe(429);
    }
  });

  it('tracks separate buckets per IP', () => {
    const guard = new RateLimitGuard(1, 60_000);

    expect(guard.canActivate(contextForIp('10.0.0.1'))).toBe(true);
    expect(guard.canActivate(contextForIp('10.0.0.2'))).toBe(true);
    expect(() => guard.canActivate(contextForIp('10.0.0.1'))).toThrow(HttpException);
  });

  it('resets the window after it elapses', () => {
    vi.useFakeTimers();
    const guard = new RateLimitGuard(1, 1_000);
    const ctx = contextForIp('9.9.9.9');

    expect(guard.canActivate(ctx)).toBe(true);
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);

    vi.advanceTimersByTime(1_001);

    expect(guard.canActivate(ctx)).toBe(true);
    vi.useRealTimers();
  });

  it('falls back to a shared bucket when the request has no IP', () => {
    const guard = new RateLimitGuard(1, 60_000);
    const ctx = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(ctx)).toBe(true);
    expect(() => guard.canActivate(ctx)).toThrow(HttpException);
  });
});
