import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Suggestion = {
  ingredientId: string;
  name: string;
  quantity: number | null;
  since: string | null;
  ingredient: Record<string, unknown> & { name: string };
};
type Suggestions = {
  staples: Suggestion[];
  usedUp: Suggestion[];
  expired: Suggestion[];
};

const TODAY = '2026-10-14';
const MINUTE = 60_000;

describe('Expired Suggestions (integration)', () => {
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
    const email = `expired-${Date.now()}-${++counter}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.4.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({
        name: 'Expired',
        email,
        password: 'correct-horse-battery-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  const api = (
    method: 'get' | 'post' | 'patch' | 'delete',
    cookie: string,
    path: string,
  ) =>
    request(app.getHttpServer())
      [method](`/api${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  const addBatch = async (
    cookie: string,
    ingredientId: string,
    expiryDate: string | null,
  ) =>
    (
      await api('post', cookie, '/pantry/batches?locale=en')
        .send({
          ingredientId,
          quantity: 1,
          unit: 'pcs',
          location: 'fridge',
          expiryDate,
        })
        .expect(201)
    ).body as { id: string };
  const suggestions = async (cookie: string) =>
    (
      await api(
        'get',
        cookie,
        `/shopping-list/suggestions?locale=en&today=${TODAY}`,
      ).expect(200)
    ).body as Suggestions;
  const expiredIds = async (cookie: string) =>
    (await suggestions(cookie)).expired.map((s) => s.ingredientId);
  const dismiss = (cookie: string, ingredientId: string) =>
    api(
      'post',
      cookie,
      `/shopping-list/suggestions/${ingredientId}/dismiss`,
    ).expect(204);

  const milk = seedId.ingredient('milk');
  const parmesan = seedId.ingredient('parmesan');

  it('always returns the expired and running low groups, empty for a new Family', async () => {
    const cookie = await signUp();

    expect(await suggestions(cookie)).toEqual({
      staples: [],
      usedUp: [],
      runningLow: [],
      expired: [],
      dismissed: [],
    });
  });

  it('suggests an Ingredient whose only Batch expired before today, with no quantity', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-13');

    const { expired } = await suggestions(cookie);

    expect(expired).toEqual([
      expect.objectContaining({
        ingredientId: milk,
        name: 'Milk',
        quantity: null,
        since: '2026-10-13',
      }),
    ]);
  });

  it('requires every Batch to be Expired, and reports the latest expiry date as since', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-01');
    await addBatch(cookie, milk, '2026-10-12');
    await addBatch(cookie, parmesan, '2026-10-01');
    await addBatch(cookie, parmesan, '2026-10-20');

    const { expired } = await suggestions(cookie);

    expect(expired.map((s) => [s.ingredientId, s.since])).toEqual([
      [milk, '2026-10-12'],
    ]);
  });

  it('keeps an Ingredient out when a Batch expires today (Expiring Soon counts as present)', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-01');
    await addBatch(cookie, milk, TODAY);

    expect(await expiredIds(cookie)).toEqual([]);
  });

  it('keeps an Ingredient out when any Batch has no expiry date', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-01');
    await addBatch(cookie, milk, null);
    await addBatch(cookie, parmesan, null);

    expect(await expiredIds(cookie)).toEqual([]);
  });

  it('shows an expired Staple once, as a missing Staple with a null since', async () => {
    const cookie = await signUp();
    await api('post', cookie, '/staples?locale=en')
      .send({ ingredientId: milk })
      .expect(201);
    await addBatch(cookie, milk, '2026-10-01');

    const found = await suggestions(cookie);

    expect(found.expired).toEqual([]);
    expect(found.staples.map((s) => [s.ingredientId, s.since])).toEqual([
      [milk, null],
    ]);
  });

  it('gives a Used Up Ingredient the time it was used up as since, and no Batches are needed', async () => {
    const cookie = await signUp();
    const batch = await addBatch(cookie, milk, null);
    const real = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(real + 11 * MINUTE);
    await api('delete', cookie, `/pantry/batches/${batch.id}`).expect(204);
    jest.restoreAllMocks();

    const { usedUp, expired } = await suggestions(cookie);

    expect(expired).toEqual([]);
    expect(usedUp).toHaveLength(1);
    expect(usedUp[0].ingredientId).toBe(milk);
    const since = usedUp[0].since;
    expect(since).toEqual(expect.any(String));
    expect(new Date(since as string).toISOString()).toBe(since);
    const age = new Date(since as string).getTime() - real;
    expect(age).toBeGreaterThan(9 * MINUTE);
    expect(age).toBeLessThan(13 * MINUTE);
  });

  it('is hidden while on the active Shopping List, checked or not', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-01');
    const list = (
      await api('post', cookie, '/shopping-list/items?locale=en')
        .send({ ingredientId: milk })
        .expect(200)
    ).body as { groups: Array<{ items: Array<{ id: string }> }> };
    expect(await expiredIds(cookie)).toEqual([]);

    await api(
      'patch',
      cookie,
      `/shopping-list/items/${list.groups[0].items[0].id}?locale=en`,
    )
      .send({ checked: true })
      .expect(200);
    expect(await expiredIds(cookie)).toEqual([]);

    await api(
      'delete',
      cookie,
      `/shopping-list/items/${list.groups[0].items[0].id}?locale=en`,
    ).expect(200);
    expect(await expiredIds(cookie)).toEqual([milk]);
  });

  it("keeps one Family's expired Ingredients out of another's", async () => {
    const mine = await signUp();
    const theirs = await signUp();
    await addBatch(mine, milk, '2026-10-01');

    expect(await expiredIds(theirs)).toEqual([]);
  });

  it('is dismissed for the whole Family, and restocking clears the dismissal', async () => {
    const cookie = await signUp();
    const member = await signUp();
    const { inviteCode } = (await api('get', cookie, '/family').expect(200))
      .body as { inviteCode: string };
    await api('post', member, '/family/join')
      .send({ code: inviteCode })
      .expect(201);
    const other = await signUp();
    await addBatch(cookie, milk, '2026-10-01');
    expect(await expiredIds(member)).toEqual([milk]);

    await dismiss(cookie, milk);
    expect(await expiredIds(cookie)).toEqual([]);
    expect(await expiredIds(member)).toEqual([]);

    // A new Batch is a restock: the dismissal ends, so when it expires too the Suggestion returns.
    await addBatch(cookie, milk, '2026-10-05');
    expect(await expiredIds(cookie)).toEqual([milk]);
    expect(await expiredIds(other)).toEqual([]);
  });

  it('ignores Unmatched Batches', async () => {
    const cookie = await signUp();
    await api('post', cookie, '/pantry/batches?locale=en')
      .send({
        rawName: 'Grandma special sauce',
        quantity: 1,
        unit: 'pcs',
        location: 'fridge',
        expiryDate: '2026-10-01',
      })
      .expect(201);

    expect(await expiredIds(cookie)).toEqual([]);
  });

  it('carries the full search result of every Suggestion, so a tap can select it', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-01');
    await api('post', cookie, '/staples?locale=en')
      .send({ ingredientId: parmesan, quantity: 2, unit: 'pcs' })
      .expect(201);
    const eggs = seedId.ingredient('eggs');
    const batch = await addBatch(cookie, eggs, null);
    const real = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(real + 11 * MINUTE);
    await api('delete', cookie, `/pantry/batches/${batch.id}`).expect(204);
    jest.restoreAllMocks();

    const found = await suggestions(cookie);

    for (const entry of [found.expired[0], found.staples[0], found.usedUp[0]]) {
      const { ingredient } = entry as unknown as {
        ingredient: {
          id: string;
          name: string;
          defaultUnit: string;
          leafCategory: { id: string; name: string };
          parentCategory: {
            aisle: { id: string; name: string };
          };
          defaults: { expiryDays: number | null };
        };
      };
      expect(ingredient.id).toBe(entry.ingredientId);
      expect(ingredient.name).toBe(entry.name);
      expect(typeof ingredient.defaultUnit).toBe('string');
      expect(ingredient.leafCategory.name).toEqual(expect.any(String));
      expect(ingredient.parentCategory.aisle.name).toEqual(expect.any(String));
      expect(ingredient.defaults).toHaveProperty('expiryDays');
    }
    expect(found.expired[0].ingredient.name).toBe('Milk');
  });

  it('names the search result in the requested locale', async () => {
    const cookie = await signUp();
    await addBatch(cookie, milk, '2026-10-01');

    const body = (
      await api(
        'get',
        cookie,
        `/shopping-list/suggestions?locale=ro&today=${TODAY}`,
      ).expect(200)
    ).body as Suggestions;

    expect(body.expired[0].ingredient.name).toBe('Lapte');
  });

  it('keeps a dismissed Staple hidden until it is restocked', async () => {
    const cookie = await signUp();
    await api('post', cookie, '/staples?locale=en')
      .send({ ingredientId: milk })
      .expect(201);
    await dismiss(cookie, milk);
    expect((await suggestions(cookie)).staples).toEqual([]);

    await addBatch(cookie, milk, '2026-10-01');
    expect(
      (await suggestions(cookie)).staples.map((s) => s.ingredientId),
    ).toEqual([milk]);
  });
});
