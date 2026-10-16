import type { Type } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
// Env comes from ./env.ts via jest setupFiles.
import { StructuredOutputAiService } from '../../src/ai/structured-output-ai.service';
import { TranscriptionService } from '../../src/voice/transcription.service';
import { AppModule } from '../../src/app.module';
import {
  OPEN_FOOD_FACTS_CLIENT,
  type OpenFoodFactsClient,
} from '../../src/barcode/open-food-facts.client';
import { configureApp, MAX_REQUEST_BODY_BYTES } from '../../src/app.setup';
import { serveWebApp } from '../../src/web-app';

export const TEST_ORIGIN = 'http://localhost:5173';

/** Boots the real app module against the test database, (migrations are applied once by global-setup.mjs). */
export async function createTestApp(
  controllers: Type<unknown>[] = [],
  /** Stands in for the AI provider at the structured-output service boundary; no test calls the network. */
  ai?: Pick<StructuredOutputAiService, 'generate'>,
  /** Built web app to serve alongside the API, as `WEB_DIST_DIR` does. */
  webDistDir?: string,
  /** Stands in for the Open Food Facts client; no test reaches the real Open Food Facts. */
  openFoodFacts?: OpenFoodFactsClient,
  /** Stands in for the audio transcription provider; no test calls the network. */
  transcription?: Pick<TranscriptionService, 'isConfigured' | 'transcribe'>,
): Promise<NestFastifyApplication> {
  const builder = Test.createTestingModule({
    imports: [AppModule],
    controllers,
  });
  if (ai) builder.overrideProvider(StructuredOutputAiService).useValue(ai);
  if (transcription) {
    builder.overrideProvider(TranscriptionService).useValue(transcription);
  }
  builder.overrideProvider(OPEN_FOOD_FACTS_CLIENT).useValue(
    openFoodFacts ?? {
      fetchProduct: () => {
        throw new Error('This test did not provide an Open Food Facts client');
      },
    },
  );
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ bodyLimit: MAX_REQUEST_BODY_BYTES }),
  );
  configureApp(app);
  if (webDistDir) await serveWebApp(app, webDistDir);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
