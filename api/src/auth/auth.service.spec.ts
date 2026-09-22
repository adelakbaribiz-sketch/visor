import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthService } from './auth.service.js';

function makePrismaMock() {
  return {
    user: {
      findUnique: vi.fn(),
    },
    tenant: {
      create: vi.fn(),
    },
  } as unknown as PrismaService;
}

describe('AuthService', () => {
  let prisma: ReturnType<typeof makePrismaMock>;
  let jwt: JwtService;
  let service: AuthService;

  beforeEach(() => {
    prisma = makePrismaMock();
    jwt = new JwtService({ secret: 'test-secret' });
    service = new AuthService(prisma, jwt);
  });

  describe('register', () => {
    it('rejects an email that is already in use', async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({
          organizationName: 'Northbridge Immigration Partners',
          name: 'Priya Nathan',
          email: 'priya@northbridge.example',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('creates a tenant with an ADMIN user and returns a token', async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      (prisma.tenant.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'tenant-1',
        users: [{ id: 'user-1', tenantId: 'tenant-1', role: 'ADMIN' }],
      });

      const result = await service.register({
        organizationName: 'Northbridge Immigration Partners',
        name: 'Priya Nathan',
        email: 'priya@northbridge.example',
        password: 'password123',
      });

      expect(result.accessToken).toEqual(expect.any(String));
      const payload = jwt.decode(result.accessToken) as { sub: string; tenantId: string; role: string };
      expect(payload.sub).toBe('user-1');
      expect(payload.tenantId).toBe('tenant-1');
      expect(payload.role).toBe('ADMIN');
    });
  });

  describe('login', () => {
    it('rejects an unknown email', async () => {
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@northbridge.example', password: 'password123' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an incorrect password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 12);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        role: 'ATTORNEY',
        passwordHash,
      });

      await expect(
        service.login({ email: 'marcus@northbridge.example', password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('issues a token for a correct password', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 12);
      (prisma.user.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'user-1',
        tenantId: 'tenant-1',
        role: 'ATTORNEY',
        passwordHash,
      });

      const result = await service.login({
        email: 'marcus@northbridge.example',
        password: 'correct-password',
      });
      expect(result.accessToken).toEqual(expect.any(String));
    });
  });
});
