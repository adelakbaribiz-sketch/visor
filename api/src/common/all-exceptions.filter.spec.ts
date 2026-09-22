import type { ArgumentsHost } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter.js';

function hostWithResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'GET', url: '/api/updates' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  it('preserves status and message for a known HttpException', () => {
    const filter = new AllExceptionsFilter();
    const { host, status, json } = hostWithResponse();

    filter.catch(new BadRequestException('title must not be empty'), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400, message: 'title must not be empty' }),
    );
  });

  it('never leaks the raw error/stack for an unhandled exception, returns generic 500', () => {
    const filter = new AllExceptionsFilter();
    const { host, status, json } = hostWithResponse();

    filter.catch(new Error('connection string exposed: postgres://user:pw@host'), host);

    expect(status).toHaveBeenCalledWith(500);
    const [body] = json.mock.calls[0] as [Record<string, unknown>];
    expect(body.message).toBe('Internal server error');
    expect(JSON.stringify(body)).not.toContain('postgres://');
    expect(JSON.stringify(body)).not.toContain('connection string');
  });
});
