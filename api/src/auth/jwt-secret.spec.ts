import { describe, expect, it } from 'vitest';
import { assertSecureJwtSecret } from './jwt-secret.js';

describe('assertSecureJwtSecret', () => {
  const strong = 'a'.repeat(48);

  it('rejects the known placeholder in production', () => {
    expect(() => assertSecureJwtSecret('dev-secret-change-me', 'production')).toThrow(/placeholder/);
  });

  it('rejects a short secret in production', () => {
    expect(() => assertSecureJwtSecret('short-but-unique', 'production')).toThrow(/at least 32/);
  });

  it('accepts a long unique secret in production', () => {
    expect(assertSecureJwtSecret(strong, 'production')).toBe(strong);
  });

  it('allows the placeholder outside production so local dev keeps working', () => {
    expect(assertSecureJwtSecret('dev-secret-change-me', 'development')).toBe('dev-secret-change-me');
    expect(assertSecureJwtSecret('dev-secret-change-me', undefined)).toBe('dev-secret-change-me');
  });
});
