import type { Type } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
// Env comes from ./env.ts via jest setupFiles.
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';

export const TEST_ORIGIN = 'http://localhost:5173';

/** Boots the real app module against the test database, (migrations are applied once by global-setup.mjs). */
export async function createTestApp(
  controllers: Type<unknown>[] = [],
): Promise<NestFastifyApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers,
  }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  configureApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
