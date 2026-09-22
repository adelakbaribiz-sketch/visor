import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';

/**
 * Global exception filter enforcing docs/DECISIONS.md's error-experience
 * rule: clients never see a stack trace or an internal error message,
 * ever — only a stable `{ statusCode, message }` shape. Unhandled
 * (non-HttpException) errors are logged server-side with full detail
 * (message + stack) via Nest's Logger, then replaced with a generic 500
 * message in the response.
 *
 * NestJS's own default filter already avoids leaking stack traces in the
 * response body, so this isn't fixing a live vulnerability — it's making
 * the "no internal detail in client-facing errors" property explicit,
 * enforced in one place, and covered by a test, rather than relying on
 * framework default behavior nobody asserted on.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!isHttp) {
      const detail = exception instanceof Error ? exception.stack : String(exception);
      this.logger.error(`${request.method} ${request.url} -> unhandled exception`, detail);
    }

    const clientPayload = isHttp ? exception.getResponse() : { message: 'Internal server error' };
    const body =
      typeof clientPayload === 'string'
        ? { statusCode: status, message: clientPayload }
        : { statusCode: status, ...clientPayload };

    response.status(status).json(body);
  }
}
