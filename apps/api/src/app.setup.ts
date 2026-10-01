import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AUTH } from './auth/auth.constants';
import type { AuthInstance } from './auth/auth.types';
import { toErrorResponse } from './common/api-error';
import { registerAuthHandler } from './auth/register-auth-handler';

/** Scan images arrive as data URLs in the JSON body, so the default 1 MB is far too small. */
export const MAX_REQUEST_BODY_BYTES = 12 * 1024 * 1024;

/** Wiring shared by the real server and the integration tests. */
export function configureApp(app: NestFastifyApplication): void {
  app.setGlobalPrefix('api');
  // Errors raised by Fastify itself (malformed JSON, routes registered outside
  // Nest such as /api/auth/*) never reach Nest's exception filter.
  app
    .getHttpAdapter()
    .getInstance()
    .setErrorHandler((error, _request, reply) => {
      const { status, body } = toErrorResponse(error);
      void reply.code(status).send(body);
    });
  registerAuthHandler(
    app.getHttpAdapter().getInstance(),
    app.get<AuthInstance>(AUTH),
  );
}
