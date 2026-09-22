import { describe, expect, it, vi } from 'vitest';
import { SecurityHeadersMiddleware } from './security-headers.middleware.js';

function mockResponse() {
  const headers = new Map<string, string>();
  return {
    setHeader: vi.fn((name: string, value: string) => headers.set(name, value)),
    headers,
  };
}

describe('SecurityHeadersMiddleware', () => {
  it('sets the baseline security headers on every response', () => {
    const middleware = new SecurityHeadersMiddleware();
    const res = mockResponse();
    const next = vi.fn();

    middleware.use({ secure: false } as never, res as never, next);

    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('Referrer-Policy')).toBe('no-referrer');
    expect(res.headers.get('Permissions-Policy')).toContain('geolocation=()');
    expect(next).toHaveBeenCalledOnce();
  });

  it('only sets HSTS for requests that actually arrived over TLS', () => {
    const middleware = new SecurityHeadersMiddleware();

    const plain = mockResponse();
    middleware.use({ secure: false } as never, plain as never, vi.fn());
    expect(plain.headers.has('Strict-Transport-Security')).toBe(false);

    const tls = mockResponse();
    middleware.use({ secure: true } as never, tls as never, vi.fn());
    expect(tls.headers.get('Strict-Transport-Security')).toContain('max-age=');
  });
});
