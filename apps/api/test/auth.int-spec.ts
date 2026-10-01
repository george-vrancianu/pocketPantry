import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type UserBody = {
  user: { id: string; email: string; name: string; role?: string };
};
type SessionBody = UserBody & { session: { userId: string } };

describe('Member sign-up and sign-in (integration)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  const email = `member-${Date.now()}@example.com`;
  const password = 'correct-horse-battery-staple';

  it('signs up a Member, signs in, and reads the session', async () => {
    const server = app.getHttpServer();

    const signUp = await request(server)
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .send({ name: 'Test Member', email, password })
      .expect(200);
    expect((signUp.body as UserBody).user).toMatchObject({
      email,
      name: 'Test Member',
    });

    const signIn = await request(server)
      .post('/api/auth/sign-in/email')
      .set('origin', TEST_ORIGIN)
      .send({ email, password })
      .expect(200);
    const cookies = [signIn.headers['set-cookie'] ?? []].flat();
    expect(cookies.length).toBeGreaterThan(0);

    const session = await request(server)
      .get('/api/auth/get-session')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookies.map((cookie) => cookie.split(';')[0]).join('; '))
      .expect(200);
    const body = session.body as SessionBody;
    expect(body.user).toMatchObject({ email, role: 'regular' });
    expect(body.session.userId).toBe(body.user.id);
  });

  it('rejects a wrong password with a stable code and no message', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-in/email')
      .set('origin', TEST_ORIGIN)
      .send({ email, password: 'not-the-password' })
      .expect(401);
    expect(response.body).toEqual({
      code: 'auth.invalid_email_or_password',
      params: {},
    });
  });
});
