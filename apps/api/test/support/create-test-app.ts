import type { Type } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
// Env comes from ./env.ts via jest setupFiles.
import { StructuredOutputAiService } from '../../src/ai/structured-output-ai.service';
import { AppModule } from '../../src/app.module';
import { configureApp, MAX_REQUEST_BODY_BYTES } from '../../src/app.setup';

export const TEST_ORIGIN = 'http://localhost:5173';

/** Boots the real app module against the test database, (migrations are applied once by global-setup.mjs). */
export async function createTestApp(
  controllers: Type<unknown>[] = [],
  /** Stands in for the AI provider at the structured-output service boundary; no test calls the network. */
  ai?: Pick<StructuredOutputAiService, 'generate'>,
): Promise<NestFastifyApplication> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
    controllers,
  });
  if (ai) builder.overrideProvider(StructuredOutputAiService).useValue(ai);
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ bodyLimit: MAX_REQUEST_BODY_BYTES }),
  );
  configureApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
