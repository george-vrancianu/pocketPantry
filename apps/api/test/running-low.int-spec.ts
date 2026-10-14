import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Pantry = { batches: unknown[]; runningLow: string[] };

describe('Running low flag (integration)', () => {
  let app: NestFastifyApplication;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp(name = 'Running low') {
    const email = `running-low-${Date.now()}-${++counter}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.4.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({ name, email, password: 'correct-horse-battery-staple' })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { cookie };
  }

  const api = (
    method: 'get' | 'put' | 'post' | 'delete',
    cookie: string,
    path: string,
  ) =>
    request(app.getHttpServer())
      [method](`/api${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  const setRunningLow = (cookie: string, ingredientId: string) =>
    api('put', cookie, `/pantry/running-low/${ingredientId}`);
  const clearRunningLow = (cookie: string, ingredientId: string) =>
    api('delete', cookie, `/pantry/running-low/${ingredientId}`);
  const readPantry = async (cookie: string) =>
    (await api('get', cookie, '/pantry?locale=en').expect(200)).body as Pantry;
  const addBatch = (cookie: string, ingredientId: string) =>
    api('post', cookie, '/pantry/batches?locale=en')
      .send({ ingredientId })
      .expect(201);

  const milk = seedId.ingredient('milk');
  const parmesan = seedId.ingredient('parmesan');

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .put(`/api/pantry/running-low/${milk}`)
      .expect(401);
    await request(app.getHttpServer())
      .delete(`/api/pantry/running-low/${milk}`)
      .expect(401);
  });

  it('sets and clears the flag, and the Pantry read returns it', async () => {
    const { cookie } = await signUp();
    await addBatch(cookie, milk);
    expect((await readPantry(cookie)).runningLow).toEqual([]);

    await setRunningLow(cookie, milk).expect(204);
    expect((await readPantry(cookie)).runningLow).toEqual([milk]);
    // A later read, as after a reload, still has it.
    expect((await readPantry(cookie)).runningLow).toEqual([milk]);

    await clearRunningLow(cookie, milk).expect(204);
    expect((await readPantry(cookie)).runningLow).toEqual([]);
  });

  it('succeeds when setting an already-set flag or clearing an already-clear one', async () => {
    const { cookie } = await signUp();
    await addBatch(cookie, milk);

    await setRunningLow(cookie, milk).expect(204);
    await setRunningLow(cookie, milk).expect(204);
    expect((await readPantry(cookie)).runningLow).toEqual([milk]);

    await clearRunningLow(cookie, milk).expect(204);
    await clearRunningLow(cookie, milk).expect(204);
    expect((await readPantry(cookie)).runningLow).toEqual([]);
  });

  it('refuses an unknown Ingredient with a coded 404 and a malformed id with 400', async () => {
    const { cookie } = await signUp();
    const unknown = await setRunningLow(
      cookie,
      '00000000-0000-4000-8000-000000000000',
    ).expect(404);
    expect(unknown.body).toMatchObject({ code: 'pantry.ingredient_not_found' });
    await setRunningLow(cookie, 'not-a-uuid').expect(400);
  });

  describe('Running low suggestions', () => {
    const suggestions = async (cookie: string) =>
      (
        await api('get', cookie, '/shopping-list/suggestions?locale=en').expect(
          200,
        )
      ).body as {
        staples: Array<{ ingredientId: string }>;
        usedUp: Array<{ ingredientId: string }>;
        runningLow: Array<{
          ingredientId: string;
          name: string;
          quantity: number | null;
          unit: string | null;
        }>;
      };
    const addToList = async (cookie: string, ingredientId: string) =>
      (
        await api('post', cookie, '/shopping-list/items?locale=en')
          .send({ ingredientId })
          .expect(200)
      ).body as { groups: Array<{ items: Array<{ id: string }> }> };

    it('suggests a flagged Ingredient that has a Batch, by name', async () => {
      const { cookie } = await signUp();
      await addBatch(cookie, milk);
      await setRunningLow(cookie, milk).expect(204);

      const found = await suggestions(cookie);

      expect(found.runningLow).toEqual([
        expect.objectContaining({
          ingredientId: milk,
          name: 'Milk',
          quantity: null,
          unit: null,
        }),
      ]);
      expect(found.staples).toEqual([]);
      expect(found.usedUp).toEqual([]);
    });

    it('does not suggest a flagged Ingredient with no Batch', async () => {
      const { cookie } = await signUp();
      await setRunningLow(cookie, milk).expect(204);
      expect((await suggestions(cookie)).runningLow).toEqual([]);
    });

    it('hides a flagged Ingredient while it is on the active list, and brings it back once removed', async () => {
      const { cookie } = await signUp();
      await addBatch(cookie, milk);
      await setRunningLow(cookie, milk).expect(204);

      const list = await addToList(cookie, milk);
      expect((await suggestions(cookie)).runningLow).toEqual([]);

      await api(
        'delete',
        cookie,
        `/shopping-list/items/${list.groups[0].items[0].id}?locale=en`,
      ).expect(200);
      expect(
        (await suggestions(cookie)).runningLow.map((s) => s.ingredientId),
      ).toEqual([milk]);
    });

    it('drops the Ingredient once its flag is turned off', async () => {
      const { cookie } = await signUp();
      await addBatch(cookie, milk);
      await setRunningLow(cookie, milk).expect(204);
      expect((await suggestions(cookie)).runningLow).toHaveLength(1);

      await clearRunningLow(cookie, milk).expect(204);
      expect((await suggestions(cookie)).runningLow).toEqual([]);
    });

    it("keeps one Family's flag out of another's Running low group", async () => {
      const a = await signUp('Family A');
      const b = await signUp('Family B');
      await addBatch(a.cookie, parmesan);
      await addBatch(b.cookie, parmesan);
      await setRunningLow(a.cookie, parmesan).expect(204);

      expect(
        (await suggestions(a.cookie)).runningLow.map((s) => s.ingredientId),
      ).toEqual([parmesan]);
      expect((await suggestions(b.cookie)).runningLow).toEqual([]);
    });
  });

  it("keeps one Family's flag out of another's, for the same Ingredient", async () => {
    const a = await signUp('Family A');
    const b = await signUp('Family B');
    await addBatch(a.cookie, parmesan);
    await addBatch(b.cookie, parmesan);

    await setRunningLow(a.cookie, parmesan).expect(204);

    expect((await readPantry(a.cookie)).runningLow).toEqual([parmesan]);
    expect((await readPantry(b.cookie)).runningLow).toEqual([]);
  });
});
