import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { ApiException, type ErrorParams } from './api-exception';

export type ApiErrorBody = { code: string; params: ErrorParams };

function codeForStatus(status: number): string {
  const name = HttpStatus[status];
  return typeof name === 'string' ? name.toLowerCase() : `http_${status}`;
}

/**
 * Turns every thrown error into `{ code, params }`. Exception messages are
 * deliberately dropped: they are for logs, not for clients.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ApiErrorBody = { code: 'internal_server_error', params: {} };

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      body = { code: exception.code, params: exception.params };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      body = { code: codeForStatus(status), params: {} };
      if (status >= 500) this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(
        exception instanceof Error ? exception.message : String(exception),
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    void reply.code(status).send(body);
  }
}
