import { existsSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import fastifyStatic from '@fastify/static';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';

const API_PATH = /^\/api(\/|\?|$)/;
// A path naming a file (or a built bundle) that does not exist: 404, not index.html.
const FILE_PATH = /^\/assets\/|\.[a-z0-9]+(\?|$)/i;
// Vite puts content-hashed bundles here, so they never change under one name.
const HASHED_ASSETS = `assets${sep}`;

/**
 * Serves the built web app from the API's own origin, so the session cookie
 * stays first-party (Safari drops it across sites). Any GET outside `/api`
 * that is not a file gets `index.html`, so client-side routes survive a reload.
 */
export async function serveWebApp(
  app: NestFastifyApplication,
  dir: string,
): Promise<void> {
  const root = resolve(dir);
  if (!existsSync(join(root, 'index.html'))) {
    throw new Error(`WEB_DIST_DIR has no index.html: ${root}`);
  }
  await app.register(fastifyStatic, {
    root,
    // One route per built file instead of a catch-all, which is ours below.
    wildcard: false,
    setHeaders: (response, path) => {
      response.header(
        'cache-control',
        relative(root, path).startsWith(HASHED_ASSETS)
          ? 'public, max-age=31536000, immutable'
          : 'no-cache',
      );
    },
  });
  app
    .getHttpAdapter()
    .getInstance()
    .get('/*', (request, reply) => {
      if (API_PATH.test(request.url) || FILE_PATH.test(request.url)) {
        return reply.callNotFound();
      }
      return reply.header('cache-control', 'no-cache').sendFile('index.html');
    });
}
