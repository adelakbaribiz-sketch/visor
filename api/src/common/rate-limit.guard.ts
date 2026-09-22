import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Minimal in-memory, per-process sliding-window rate limiter.
 *
 * Real, enforced protection against brute-force credential guessing on
 * `/auth/login` and `/auth/register` — this was a documented, known gap
 * (see docs/SECURITY.md, "No rate limiting..."). Closing it does not
 * require a new dependency (no `@nestjs/throttler`, no Redis — this
 * sandbox has no network access to install either), which is the honest
 * tradeoff: this guard is NOT distributed-safe. Each API process instance
 * keeps its own counters, so behind multiple replicas the effective limit
 * is (perLimit × replicaCount), not a hard global ceiling. That's an
 * acceptable bound for a single-instance MVP deployment and is documented
 * here and in docs/SECURITY.md rather than silently assumed away; a
 * production multi-instance deployment should replace this with a shared
 * store (Redis) before relying on it.
 *
 * Each protected route gets its own guard instance (constructed directly
 * in the `@UseGuards(new RateLimitGuard(...))` call), so buckets never mix
 * across unrelated endpoints.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.ip ?? 'unknown';
    const now = Date.now();

    // Opportunistic cleanup so the map can't grow unbounded over the life
    // of a long-running process — cheap because it only runs when a
    // bucket is actually being read.
    const existing = this.buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }

    if (existing.count >= this.limit) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many attempts. Try again in ${retryAfterSeconds}s.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    return true;
  }

  /** Exposed for tests only — not part of the runtime request path. */
  _bucketCount(): number {
    return this.buckets.size;
  }
}
