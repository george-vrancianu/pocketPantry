import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { AUTH } from './auth/auth.constants';
import type { AuthInstance } from './auth/auth.types';
import { registerAuthHandler } from './auth/register-auth-handler';

/** Wiring shared by the real server and the integration tests. */
export function configureApp(app: NestFastifyApplication): void {
  app.setGlobalPrefix('api');
  registerAuthHandler(
    app.getHttpAdapter().getInstance(),
    app.get<AuthInstance>(AUTH),
  );
}
