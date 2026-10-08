import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp } from './support/create-test-app';

const INDEX_HTML = '<!doctype html><title>Pocket Pantry</title>';
const BUNDLE = 'console.log("app");';

describe('Web app served from the API origin (integration)', () => {
  let app: NestFastifyApplication;
  let dist: string;

  beforeAll(async () => {
    dist = mkdtempSync(join(tmpdir(), 'pocket-pantry-web-'));
    mkdirSync(join(dist, 'assets'));
    writeFileSync(join(dist, 'index.html'), INDEX_HTML);
    writeFileSync(join(dist, 'assets', 'index-abc123.js'), BUNDLE);
    writeFileSync(join(dist, 'manifest.webmanifest'), '{}');
    app = await createTestApp([], undefined, dist);
  });

  afterAll(async () => {
    await app.close();
    rmSync(dist, { recursive: true, force: true });
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
