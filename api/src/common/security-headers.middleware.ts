import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * Hand-written security response headers — no `helmet` dependency (this
 * sandbox has no npm registry access to install one; see
 * docs/LIMITATIONS.md). Covers the headers relevant to a pure JSON API
 * with no server-rendered HTML and no cookies:
 *
 * - X-Content-Type-Options: stops browsers from MIME-sniffing a JSON
 *   response into something executable.
 * - X-Frame-Options: this API is never meant to be framed.
 * - Referrer-Policy: don't leak full request URLs (which can carry
 *   tenant/query data) to third-party referrer targets.
 * - Permissions-Policy: explicitly disable browser features this API
 *   never needs.
 * - Strict-Transport-Security: only set once a request actually arrived
 *   over TLS, so local HTTP development is unaffected.
 */
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=(), interest-cohort=()');
    if (req.secure) {
      res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    next();
  }
}
