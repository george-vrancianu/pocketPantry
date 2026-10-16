import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { ScanCapService } from '../src/scan/scan-cap.service';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

describe('Daily caps counted by kind (integration)', () => {
  let app: NestFastifyApplication;
  let cap: ScanCapService;
  const now = new Date('2020-05-01T10:00:00Z');

  beforeAll(async () => {
    app = await createTestApp();
    cap = app.get(ScanCapService);
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp(tag: string) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', '10.14.0.1')
      .send({
        name: tag,
        email: `${tag}-${Date.now()}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return (response.body as { user: { id: string } }).user.id;
  }

  it('counts voice and scan independently on the same day', async () => {
    const memberId = await signUp('kinds');

    // Fill the voice cap (2 in the test env); scans are untouched.
    await cap.consume(memberId, now, 'voice');
    await cap.consume(memberId, now, 'voice');
    await expect(cap.consume(memberId, now, 'voice')).rejects.toMatchObject({
      code: 'voice.cap_reached',
      params: { cap: 2 },
    });
    for (let i = 0; i < 3; i++) await cap.consume(memberId, now, 'scan');
    await expect(cap.consume(memberId, now, 'scan')).rejects.toMatchObject({
      code: 'scan.cap_reached',
      params: { cap: 3 },
    });

    // A refund hands back only its own kind.
    await cap.refund(memberId, '2020-05-01', 'voice');
    await cap.consume(memberId, now, 'voice');
    await expect(cap.consume(memberId, now, 'scan')).rejects.toMatchObject({
      code: 'scan.cap_reached',
    });
  });
});
