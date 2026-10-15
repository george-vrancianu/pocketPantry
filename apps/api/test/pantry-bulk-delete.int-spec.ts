import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Suggestion = { ingredientId: string };

const MINUTE = 60_000;

describe('Pantry bulk Batch delete (integration)', () => {
  let app: NestFastifyApplication;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.8.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Bulk ${n}`,
        email: `bulk-delete-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  const api = (
    method: 'get' | 'post' | 'delete',
    cookie: string,
    path: string,
  ) =>
    request(app.getHttpServer())
      [method](`/api${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  const addBatch = async (cookie: string, ingredientId: string) =>
    (
      await api('post', cookie, '/pantry/batches?locale=en')
        .send({ ingredientId, quantity: 1, unit: 'pcs', location: 'fridge' })
        .expect(201)
    ).body as { id: string };
  const listIds = async (cookie: string) =>
    (
      (await api('get', cookie, '/pantry?locale=en').expect(200)).body as {
        batches: Array<{ id: string }>;
      }
    ).batches.map((b) => b.id);
  const bulkDelete = (cookie: string, ids: unknown) =>
    api('post', cookie, '/pantry/batches/bulk-delete').send({ ids });
  const usedUpIds = async (cookie: string) =>
    (
      (
        await api('get', cookie, '/shopping-list/suggestions?locale=en').expect(
          200,
        )
      ).body as { usedUp: Suggestion[] }
    ).usedUp.map((s) => s.ingredientId);

  const milk = seedId.ingredient('milk');
  const parmesan = seedId.ingredient('parmesan');

  it('deletes all the given Batches in one request', async () => {
    const cookie = await signUp();
    const a = await addBatch(cookie, milk);
    const b = await addBatch(cookie, parmesan);
    const kept = await addBatch(cookie, milk);

    await bulkDelete(cookie, [a.id, b.id]).expect(204);

    expect(await listIds(cookie)).toEqual([kept.id]);
  });

  it('leaves Batches of another Family alone', async () => {
    const mine = await signUp();
    const theirs = await signUp();
    const own = await addBatch(mine, milk);
    const foreign = await addBatch(theirs, milk);

    await bulkDelete(mine, [own.id, foreign.id]).expect(204);

    expect(await listIds(mine)).toEqual([]);
    expect(await listIds(theirs)).toEqual([foreign.id]);
  });

  it('marks an Ingredient Used Up when its last Batch goes, but only if the Batch is not a mistaken entry', async () => {
    const cookie = await signUp();
    const mistaken = await addBatch(cookie, milk);
    const used = await addBatch(cookie, parmesan);

    await bulkDelete(cookie, [mistaken.id]).expect(204);
    expect(await usedUpIds(cookie)).toEqual([]);

    const real = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(real + 11 * MINUTE);
    await bulkDelete(cookie, [used.id]).expect(204);
    jest.restoreAllMocks();

    expect(await usedUpIds(cookie)).toEqual([parmesan]);
  });

  it('does not mark Used Up while another Batch of the Ingredient remains', async () => {
    const cookie = await signUp();
    const first = await addBatch(cookie, milk);
    await addBatch(cookie, milk);

    jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 11 * MINUTE);
    await bulkDelete(cookie, [first.id]).expect(204);
    jest.restoreAllMocks();

    expect(await usedUpIds(cookie)).toEqual([]);
  });

  it('validates the ids', async () => {
    const cookie = await signUp();
    await bulkDelete(cookie, []).expect(400);
    await bulkDelete(cookie, ['not-a-uuid']).expect(400);
    await bulkDelete(cookie, undefined).expect(400);
    await api('post', cookie, '/pantry/batches/bulk-delete')
      .send({})
      .expect(400);
  });

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/pantry/batches/bulk-delete')
      .set('origin', TEST_ORIGIN)
      .send({ ids: [] })
      .expect(401);
  });
});
