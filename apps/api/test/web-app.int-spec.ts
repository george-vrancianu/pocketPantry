import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { serveWebApp } from '../src/web-app';
import { createTestApp } from './support/create-test-app';

const INDEX_HTML = '<!doctype html><title>Pocket Pantry</title>';
const BUNDLE = 'console.log("app");';

describe('Web app served from the API origin (integration)', () => {
  let app: NestFastifyApplication;
  let base: string;
  let dist: string;

  beforeAll(async () => {
    base = mkdtempSync(join(tmpdir(), 'pocket-pantry-web-'));
    // A parent named `assets` must not make every file look like a hashed bundle.
    dist = join(base, 'assets', 'dist');
    mkdirSync(join(dist, 'assets'), { recursive: true });
    writeFileSync(join(dist, 'index.html'), INDEX_HTML);
    writeFileSync(join(dist, 'assets', 'index-abc123.js'), BUNDLE);
    writeFileSync(join(dist, 'manifest.webmanifest'), '{}');
    app = await createTestApp([], undefined, dist);
  });

  afterAll(async () => {
    await app.close();
    rmSync(base, { recursive: true, force: true });
  });

  it('serves index.html at the root, uncached', async () => {
    const response = await request(app.getHttpServer()).get('/').expect(200);
    expect(response.text).toBe(INDEX_HTML);
    expect(response.headers['cache-control']).toBe('no-cache');
  });

  it('serves index.html for a client-side route so a reload works', async () => {
    const response = await request(app.getHttpServer())
      .get('/pantry/fridge?q=milk')
      .expect(200);
    expect(response.text).toBe(INDEX_HTML);
    expect(response.headers['content-type']).toMatch(/text\/html/);
  });

  it('answers HEAD on a client-side route', async () => {
    await request(app.getHttpServer()).head('/pantry').expect(200);
  });

  it('returns 404, not index.html, for a missing file', async () => {
    for (const path of ['/assets/index-gone.js', '/favicon.ico']) {
      const response = await request(app.getHttpServer()).get(path).expect(404);
      expect(response.body).toEqual({ code: 'not_found', params: {} });
    }
  });

  it('returns the JSON 404 for a non-GET outside the API', async () => {
    const response = await request(app.getHttpServer())
      .post('/pantry')
      .expect(404);
    expect(response.body).toEqual({ code: 'not_found', params: {} });
  });

  it('refuses a directory without index.html', async () => {
    await expect(serveWebApp(app, join(dist, 'assets'))).rejects.toThrow(
      /WEB_DIST_DIR has no index.html/,
    );
  });

  it('serves hashed bundles with a long-lived cache', async () => {
    const response = await request(app.getHttpServer())
      .get('/assets/index-abc123.js')
      .expect(200);
    expect(response.text).toBe(BUNDLE);
    expect(response.headers['cache-control']).toBe(
      'public, max-age=31536000, immutable',
    );
  });

  it('serves other built files as they are', async () => {
    const response = await request(app.getHttpServer())
      .get('/manifest.webmanifest')
      .expect(200);
    expect(response.headers['cache-control']).toBe('no-cache');
  });

  it('keeps the JSON 404 for an unknown API route', async () => {
    for (const path of ['/api/nope', '/api', '/api?x=1']) {
      const response = await request(app.getHttpServer()).get(path).expect(404);
      expect(response.body).toEqual({ code: 'not_found', params: {} });
    }
  });

  it('still routes API requests to the API', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });
});
