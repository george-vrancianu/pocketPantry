import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { z } from 'zod';
import { AuthGuard } from '../src/auth/auth.guard';
import { ZodValidationPipe } from '../src/common/zod-validation.pipe';
import { createTestApp } from './support/create-test-app';

const bodySchema = z.object({
  name: z.string().min(3),
  quantity: z.number().int().max(10),
});

@Controller('test-errors')
class TestErrorsController {
  @Post('validate')
  validate(@Body(new ZodValidationPipe(bodySchema)) body: unknown) {
    return body;
  }

  @Get('protected')
  @UseGuards(AuthGuard)
  protectedRoute() {
    return { ok: true };
  }
}

describe('Error shape (integration)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp([TestErrorsController]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns { code, params } and no human-readable message on validation failure', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/test-errors/validate')
      .send({ name: 'ab', quantity: 99 })
      .expect(400);

    expect(response.body).toEqual({
      code: 'validation_failed',
      params: {
        issues: [
          {
            path: 'name',
            code: 'too_small',
            params: { minimum: 3, origin: 'string', inclusive: true },
          },
          {
            path: 'quantity',
            code: 'too_big',
            params: { maximum: 10, origin: 'number', inclusive: true },
          },
        ],
      },
    });
    expect(JSON.stringify(response.body)).not.toMatch(/message/i);
  });

  it('maps an unauthenticated request to a stable code', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/test-errors/protected')
      .expect(401);
    expect(response.body).toEqual({ code: 'auth.unauthenticated', params: {} });
  });

  it('maps an unknown route to a status-derived code', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/nope')
      .expect(404);
    expect(response.body).toEqual({ code: 'not_found', params: {} });
  });

  it('returns { code, params } for malformed JSON on /api/auth/*', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('content-type', 'application/json')
      .send('{not json')
      .expect(400);
    expect(response.body).toEqual({ code: 'bad_request', params: {} });
  });

  it('returns { code, params } for an unknown /api/auth/* sub-route', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/auth/does-not-exist')
      .expect(404);
    expect(response.body).toEqual({ code: 'auth.not_found', params: {} });
  });
});
