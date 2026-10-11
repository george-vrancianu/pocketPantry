import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { TEST_ORIGIN } from './create-test-app';

let signUps = 0;

/** Signs a Member up (fresh client IP, to dodge the sign-up rate limit) and returns the session cookie. */
export async function signUp(
  app: NestFastifyApplication,
  email: string,
  name: string,
): Promise<string> {
  const n = ++signUps;
  const response = await request(app.getHttpServer())
    .post('/api/auth/sign-up/email')
    .set('origin', TEST_ORIGIN)
    .set('x-forwarded-for', `10.77.${Math.floor(n / 250)}.${n % 250}`)
    .send({ name, email, password: 'correct-horse-staple' });
  expect(response.status).toBe(200);
  return [response.headers['set-cookie'] ?? []]
    .flat()
    .map((value) => value.split(';')[0])
    .join('; ');
}

/** A supertest client for `prefix` (for example `/api/admin/recipes`) that sends `cookie`. */
export function client(
  app: NestFastifyApplication,
  cookie: string,
  prefix: string,
) {
  const call =
    (method: 'get' | 'post' | 'put' | 'patch' | 'delete') =>
    (path: string, body?: object) => {
      const req = request(app.getHttpServer())
        [method](`${prefix}${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie);
      return body ? req.send(body) : req;
    };
  return {
    get: call('get'),
    post: call('post'),
    put: call('put'),
    patch: call('patch'),
    del: call('delete'),
  };
}
