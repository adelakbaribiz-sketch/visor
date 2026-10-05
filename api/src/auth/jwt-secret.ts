/** Placeholder values shipped in .env.example / docker-compose history. */
const KNOWN_PLACEHOLDERS = new Set(['dev-secret-change-me', 'changeme', 'secret']);

export const MIN_PRODUCTION_SECRET_LENGTH = 32;

/**
 * Fail-fast check run when the JWT module is configured. In production a
 * known placeholder or short secret would let anyone who has read the
 * public repo forge tokens for any tenant/role, so startup is refused
 * instead of silently signing with it. Outside production (local dev,
 * tests) any non-empty secret is accepted so `npm run start:dev` still
 * works with the example .env.
 */
export function assertSecureJwtSecret(secret: string, nodeEnv: string | undefined): string {
  if (nodeEnv === 'production') {
    if (KNOWN_PLACEHOLDERS.has(secret)) {
      throw new Error(
        'JWT_SECRET is a known placeholder value. Set a unique secret (e.g. `openssl rand -hex 32`) before running in production.',
      );
    }
    if (secret.length < MIN_PRODUCTION_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET must be at least ${MIN_PRODUCTION_SECRET_LENGTH} characters in production.`,
      );
    }
  }
  return secret;
}
