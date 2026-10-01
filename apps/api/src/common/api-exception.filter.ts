import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { toErrorResponse } from './api-error';

/** Turns every error thrown inside Nest into `{ code, params }`. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const { status, body } = toErrorResponse(exception);
    void reply.code(status).send(body);
  }
}
