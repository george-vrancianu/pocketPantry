import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiException, type ErrorParams } from './api-exception';

export type ApiErrorBody = { code: string; params: ErrorParams };

const logger = new Logger('ApiError');

export function codeForStatus(status: number): string {
  const name = HttpStatus[status];
  return typeof name === 'string' ? name.toLowerCase() : `http_${status}`;
}

function statusOf(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const { statusCode } = error;
    if (typeof statusCode === 'number' && statusCode >= 400) return statusCode;
  }
  return undefined;
}

/**
 * Single mapping from any thrown error (Nest or Fastify) to `{ code, params }`.
 * Messages are deliberately dropped: they are for logs, not for clients.
 */
export function toErrorResponse(exception: unknown): {
  status: number;
  body: ApiErrorBody;
} {
  if (exception instanceof ApiException) {
    return {
      status: exception.getStatus(),
      body: { code: exception.code, params: exception.params },
    };
  }

  const status =
    exception instanceof HttpException
      ? exception.getStatus()
      : statusOf(exception);
  if (status !== undefined && status < 500) {
    return { status, body: { code: codeForStatus(status), params: {} } };
  }

  logger.error(
    exception instanceof Error ? exception.message : String(exception),
    exception instanceof Error ? exception.stack : undefined,
  );
  if (status !== undefined) {
    return { status, body: { code: codeForStatus(status), params: {} } };
  }
  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: { code: 'internal_server_error', params: {} },
  };
}
