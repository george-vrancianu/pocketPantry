import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import type { ConfigService } from '@nestjs/config';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import type { AppConfig } from '../src/config/env';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { scanUsage } from '../src/database/schema';
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

  it('refunds a voice use when the provider call fails, leaving scans alone', async () => {
    const memberId = await signUp('refund');
    for (let i = 0; i < 5; i++) {
      await expect(
        cap.withinCap(
          memberId,
          () => Promise.reject(new Error('provider down')),
          'voice',
        ),
      ).rejects.toThrow('provider down');
    }
    // Never charged, so the full voice cap (2) is still available.
    await cap.consume(memberId, new Date(), 'voice');
    await cap.consume(memberId, new Date(), 'voice');
  });

  it('treats a voice cap of 0 as no cap and counts nothing', async () => {
    const memberId = await signUp('nocap');
    const uncapped = new ScanCapService(app.get<Database>(DATABASE), {
      get: () => 0,
    } as unknown as ConfigService<AppConfig, true>);
    for (let i = 0; i < 5; i++) await uncapped.consume(memberId, now, 'voice');
    const rows = await app
      .get<Database>(DATABASE)
      .select()
      .from(scanUsage)
      .where(eq(scanUsage.memberId, memberId));
    expect(rows).toEqual([]);
  });
});
