import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { ApiException } from '../src/common/api-exception';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { tags, unmatchedEntries } from '../src/database/schema';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { PLATE_TOKEN_TTL_MS } from '../src/scan/plate-token';
import { expectCatalogByIndex } from './support/catalog-indices';
import { offeredTagNames, tagIndexIn } from './support/tag-indices';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { signUpWithUiLanguage } from './support/stored-language';

const IMAGE = 'data:image/jpeg;base64,YQ==';
const flour = seedId.ingredient('flour');
const milk = seedId.ingredient('milk');

const item = (overrides: Record<string, unknown> = {}) => ({
  productName: 'Milk',
  productType: 'Dairy',
  matchedIngredientId: milk,
  matchedCategory: 'Milk',
  matchConfidence: 0.9,
  fallbackIngredientName: 'Milk',
  quantityType: 'measured',
  quantity: 200,
  unit: 'ml',
  confidence: 0.9,
  ...overrides,
});

type Line = {
  name: string;
  lowConfidence: boolean;
  quantity: number | null;
  unit: string | null;
  match: { id: string; name: string } | null;
};
type List = {
  groups: Array<{
    aisle: unknown;
    items: Array<{
      id: string;
      name: string;
      quantity: number | null;
      unit: string | null;
      unmatched: boolean;
      checked: boolean;
    }>;
  }>;
};

describe('Plate Scan (integration)', () => {
  let app: NestFastifyApplication;
  let next: (
    request: StructuredOutputRequest,
  ) => Promise<{ data: unknown; requestId: string | null }>;
  const prompts: StructuredOutputRequest[] = [];
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input) => {
        prompts.push(input);
        return next(input);
      },
    });
  });
  afterAll(async () => {
    await app.close();
  });

  const respondWith = (
    data: object | ((request: StructuredOutputRequest) => object),
  ) => {
    next = (request) =>
      Promise.resolve({
        data:
          typeof data === 'function'
            ? (data as (request: StructuredOutputRequest) => object)(request)
            : data,
        requestId: 'fake-request',
      });
  };

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.15.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Plate ${n}`,
        email: `plate-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  /** A Member whose stored UI Language is `locale` (the API ignores the request's own `?locale=`). */
  const signUpIn = (locale: string) =>
    signUpWithUiLanguage(app, signUp, locale);

  // `locale` is sent as the web used to; a signed-in request ignores it.
  const post = (cookie: string, path: string, body: object, locale = 'en') =>
    request(app.getHttpServer())
      .post(`/api/${path}`)
      .query({ locale })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send(body);
  const dishes = (cookie: string, body: object = { plateImage: IMAGE }) =>
    post(cookie, 'scan/plate', body);
  /** A genuine token for this Member, from a real Plate Scan that guessed Pancakes and Crepes. */
  const tokenFor = async (cookie: string) => {
    const saved = next;
    const seen = prompts.length;
    respondWith({
      matches: [
        { title: 'Pancakes', confidence: 0.7 },
        { title: 'Crepes', confidence: 0.2 },
      ],
    });
    const { token } = (await dishes(cookie).expect(201)).body as {
      token: string;
    };
    next = saved;
    prompts.length = seen; // The photo step's prompt is not the one under test.
    return token;
  };
  /** Loads Ingredients for a dish; gets a genuine token first unless one (or null for none) is given. */
  const ingredients = (
    cookie: string,
    dishTitle = 'Pancakes',
    locale = 'en',
    token?: string | null,
  ) => ({
    expect: async (status: number) => {
      const plateToken = token === undefined ? await tokenFor(cookie) : token;
      const response = await post(
        cookie,
        'scan/plate/ingredients',
        { dishTitle, ...(plateToken === null ? {} : { plateToken }) },
        locale,
      );
      expect(response.status).toBe(status);
      return response;
    },
  });
  const bulk = (cookie: string, items: object[]) =>
    post(cookie, 'shopping-list/items/bulk', { items });

  it('requires authentication on every endpoint', async () => {
    for (const path of [
      'scan/plate',
      'scan/plate/ingredients',
      'shopping-list/items/bulk',
    ]) {
      await request(app.getHttpServer())
        .post(`/api/${path}`)
        .send({})
        .expect(401);
    }
  });

  describe('POST /scan/plate', () => {
    it('returns up to five dish guesses with confidence, most likely first', async () => {
      respondWith({
        matches: [
          { title: 'Crepes', confidence: 0.2 },
          { title: 'Pancakes', confidence: 0.7 },
        ],
      });
      prompts.length = 0;
      const response = await dishes(await signUp()).expect(201);
      expect(response.body).toEqual({
        dishes: [
          { title: 'Pancakes', confidence: 0.7 },
          { title: 'Crepes', confidence: 0.2 },
        ],
        token: expect.stringMatching(/^[\w-]+\.[\w-]+$/) as string,
      });
      expect(prompts[0].images).toEqual([IMAGE]);
    });

    it('asks for dish titles in the Member’s UI language, Danish included', async () => {
      respondWith({ matches: [{ title: 'Æbleskiver', confidence: 0.8 }] });
      prompts.length = 0;
      await post(
        await signUpIn('da'),
        'scan/plate',
        { plateImage: IMAGE },
        'da',
      )
        .query({ locale: 'da' })
        .expect(201);
      expect(prompts[0].prompt).toMatch(/recipe titles in Danish/);
    });

    it('rejects a result the model got wrong with a stable code', async () => {
      respondWith({ matches: [{ title: 'Pancakes', confidence: 9 }] });
      const failed = await dishes(await signUp()).expect(502);
      expect(failed.body).toEqual({ code: 'scan.result_invalid', params: {} });
    });

    it('validates the image like every Scan, without using up a Scan', async () => {
      const cookie = await signUp();
      respondWith({ matches: [{ title: 'Pancakes', confidence: 0.7 }] });
      for (let i = 0; i < 5; i++) {
        const bad = await dishes(cookie, { plateImage: 'nope' }).expect(400);
        expect(bad.body).toEqual({
          code: 'scan.image_invalid',
          params: { field: 'plateImage' },
        });
      }
      const huge = `data:image/jpeg;base64,${'A'.repeat(7_100_000)}`;
      await dishes(cookie, { plateImage: huge }).expect(413);
      await dishes(cookie).expect(201);
    });

    it('counts against the Scan Cap, and a provider failure is refunded', async () => {
      const cookie = await signUp();
      next = () =>
        Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
      for (let i = 0; i < 4; i++) await dishes(cookie).expect(502);

      respondWith({ matches: [{ title: 'Pancakes', confidence: 0.7 }] });
      for (let i = 0; i < 3; i++) await dishes(cookie).expect(201);
      prompts.length = 0;
      const blocked = await dishes(cookie).expect(429);
      expect(blocked.body).toEqual({
        code: 'scan.cap_reached',
        params: { cap: 3 },
      });
      expect(prompts).toHaveLength(0);
    });
  });

  describe('POST /scan/plate/ingredients', () => {
    it('proposes lines for one serving, matched to the Catalog with its defaults', async () => {
      respondWith({
        items: [
          item(),
          item({
            matchedIngredientId: flour,
            matchedCategory: 'Flour',
            fallbackIngredientName: 'Flour',
            quantity: 60,
            unit: 'g',
          }),
        ],
      });
      prompts.length = 0;
      const { lines } = (await ingredients(await signUp()).expect(201))
        .body as { lines: Line[] };
      expect(lines).toMatchObject([
        { match: { id: milk }, quantity: 200, unit: 'ml' },
        { match: { id: flour }, quantity: 60, unit: 'g' },
      ]);
      expect(prompts[0].images ?? []).toEqual([]);
      expect(prompts[0].prompt).toContain('"Pancakes"');
    });

    it('never trusts the model: an index outside the Catalog, a UUID or other value that is not an index, or a weak Match, is Unmatched', async () => {
      respondWith({
        items: [
          item({
            matchedIngredientIndex: '4b3f1f0a-0000-4000-8000-000000000000',
            fallbackIngredientName: 'Pixie dust',
          }),
          item({ matchConfidence: 0.2 }),
          item({ matchedIngredientId: null, matchConfidence: 0 }),
          item({ matchedIngredientIndex: 100_000 }),
          item({ matchedIngredientIndex: -1 }),
          item({ matchedIngredientIndex: 2.5 }),
          item({ matchedIngredientIndex: 'milk' }),
        ],
      });
      prompts.length = 0;
      const { lines } = (await ingredients(await signUp()).expect(201))
        .body as { lines: Line[] };
      expect(lines.map((l) => l.match)).toEqual([
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ]);
      expectCatalogByIndex(prompts[0].prompt);
      expect(lines[0].name).toBe('Pixie dust');
    });

    describe('Tags (#714)', () => {
      const dinner = seedId.tag('meal:dinner');
      const vegan = seedId.tag('diet:vegan');
      const database = () => app.get<Database>(DATABASE);
      const tagCount = async () =>
        (await database().select({ id: tags.id }).from(tags)).length;
      const familyTag = async (cookie: string, name: string) =>
        (
          (await post(cookie, 'recipes/tags', { name }).expect(200)).body as {
            id: string;
          }
        ).id;
      const stamp = Date.now();

      it("offers the Catalog Tags and the Family's own, never another Family's, and proposes ids from them", async () => {
        const cookie = await signUp();
        const mine = `Mine plate ${stamp}`;
        const mineId = await familyTag(cookie, mine);
        const theirs = `Theirs plate ${stamp}`;
        await familyTag(await signUp(), theirs);
        respondWith((request) => ({
          items: [item()],
          tagIndexes: [
            tagIndexIn(request.prompt, 'Dinner'),
            tagIndexIn(request.prompt, mine),
            tagIndexIn(request.prompt, 'Vegan'),
            100_000,
            -1,
            2.5,
            'Vegan',
            tagIndexIn(request.prompt, 'Dinner'),
          ],
        }));
        prompts.length = 0;
        const body = (await ingredients(cookie).expect(201)).body as {
          lines: Line[];
          tagIds: string[];
        };
        expect(body.tagIds).toEqual([dinner, mineId, vegan]);
        const names = offeredTagNames(prompts[0].prompt);
        expect(names).toEqual(expect.arrayContaining(['Dinner', mine]));
        expect(names).not.toContain(theirs);
        expect(names.indexOf(mine)).toBe(names.length - 1);
      });

      it('creates no Tag, whatever the model names, and proposes none when it names none', async () => {
        const cookie = await signUp();
        const before = await tagCount();
        respondWith({
          items: [item()],
          tagIndexes: [0, 1],
          tags: ['Brand new'],
        });
        const body = (await ingredients(cookie).expect(201)).body as {
          tagIds: string[];
        };
        expect(body.tagIds).toHaveLength(2);
        expect(await tagCount()).toBe(before);
        respondWith({ items: [item()] });
        expect(
          ((await ingredients(cookie).expect(201)).body as { tagIds: string[] })
            .tagIds,
        ).toEqual([]);
      });

      it('caps the proposals at 10', async () => {
        respondWith((request) => ({
          items: [item()],
          tagIndexes: offeredTagNames(request.prompt).map((_, i) => i),
        }));
        const body = (await ingredients(await signUp()).expect(201)).body as {
          tagIds: string[];
        };
        expect(body.tagIds).toHaveLength(10);
      });
    });

    it('names Ingredients in the Member locale', async () => {
      respondWith({ items: [item()] });
      const { lines } = (
        await ingredients(await signUpIn('ro'), 'Pancakes', 'ro').expect(201)
      ).body as { lines: Line[] };
      expect(lines[0].match?.name).not.toBe('Milk');
    });

    it('rejects a result the model got wrong with a stable code', async () => {
      respondWith({ items: [item({ confidence: 2 })] });
      const failed = await ingredients(await signUp()).expect(502);
      expect(failed.body).toEqual({ code: 'scan.result_invalid', params: {} });
    });

    it('requires a bounded dish title and does not call the provider otherwise', async () => {
      const cookie = await signUp();
      prompts.length = 0;
      const token = await tokenFor(cookie);
      prompts.length = 0;
      await post(cookie, 'scan/plate/ingredients', {}).expect(400);
      await ingredients(cookie, '   ', 'en', token).expect(400);
      await ingredients(cookie, 'x'.repeat(121), 'en', token).expect(400);
      expect(prompts).toHaveLength(0);
    });

    describe('Plate token', () => {
      const rejected = { code: 'scan.plate_token_invalid', params: {} };
      const refuse = async (
        cookie: string,
        dishTitle: string,
        token: string | null,
      ) => {
        prompts.length = 0;
        const response = await ingredients(
          cookie,
          dishTitle,
          'en',
          token,
        ).expect(400);
        expect(response.body).toEqual(rejected);
        expect(prompts).toHaveLength(0);
      };

      it('works for any dish the Scan guessed', async () => {
        const cookie = await signUp();
        respondWith({ items: [item()] });
        await ingredients(cookie, 'Pancakes').expect(201);
        await ingredients(cookie, 'Crepes').expect(201);
      });

      it('refuses a missing token, a made-up one and a title the Scan did not guess', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item()] });
        await refuse(cookie, 'Pancakes', null);
        await refuse(cookie, 'Pancakes', 'not-a-token');
        await refuse(cookie, 'Lasagne', token);
      });

      it('refuses a tampered token', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        const [body, signature] = token.split('.');
        const payload = JSON.parse(
          Buffer.from(body, 'base64url').toString(),
        ) as { t: string[] };
        payload.t.push('Lasagne');
        const forged = Buffer.from(JSON.stringify(payload)).toString(
          'base64url',
        );
        respondWith({ items: [item()] });
        await refuse(cookie, 'Lasagne', `${forged}.${signature}`);
      });

      it("refuses another Member's token", async () => {
        const token = await tokenFor(await signUp());
        respondWith({ items: [item()] });
        await refuse(await signUp(), 'Pancakes', token);
      });

      it('refuses an expired token', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item()] });
        const now = Date.now();
        const clock = jest
          .spyOn(Date, 'now')
          .mockReturnValue(now + PLATE_TOKEN_TTL_MS + 60_000);
        try {
          await refuse(cookie, 'Pancakes', token);
        } finally {
          clock.mockRestore();
        }
        await ingredients(cookie, 'Pancakes', 'en', token).expect(201);
      });

      it('loads one dish per token: a replay is refused without a provider call', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item()] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(201);
        await refuse(cookie, 'Pancakes', token);
        await refuse(cookie, ' Pancakes ', token);
      });

      it('refuses another signed title on the same token once one was loaded', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item()] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(201);
        await refuse(cookie, 'Crepes', token);
      });

      it('lets exactly one of two concurrent requests on one token through', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        next = () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: { items: [item()] }, requestId: 'slow' }),
              50,
            ),
          );
        prompts.length = 0;
        const responses = await Promise.all([
          post(cookie, 'scan/plate/ingredients', {
            dishTitle: 'Pancakes',
            plateToken: token,
          }),
          post(cookie, 'scan/plate/ingredients', {
            dishTitle: 'Pancakes',
            plateToken: token,
          }),
        ]);
        expect(responses.map((r) => r.status).sort()).toEqual([201, 400]);
        expect(prompts).toHaveLength(1);
      });

      it('gives the use back when the provider fails, so the Member can retry', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item({ confidence: 2 })] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(502);
        respondWith({ items: [item()] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(201);
        await refuse(cookie, 'Pancakes', token);
      });

      it('lets the Member pick another signed title after a provider failure', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item({ confidence: 2 })] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(502);
        respondWith({ items: [item()] });
        await ingredients(cookie, 'Crepes', 'en', token).expect(201);
        await refuse(cookie, 'Pancakes', token);
      });

      it('refuses after 3 attempts in total, even when each failed', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item({ confidence: 2 })] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(502);
        await ingredients(cookie, 'Pancakes', 'en', token).expect(502);
        await ingredients(cookie, 'Pancakes', 'en', token).expect(502);
        respondWith({ items: [item()] });
        prompts.length = 0;
        await refuse(cookie, 'Pancakes', token);
        expect(prompts).toHaveLength(0);
      });

      it('is the same Scan: loading Ingredients does not touch the Scan Cap', async () => {
        const cookie = await signUp();
        const token = await tokenFor(cookie);
        respondWith({ items: [item()] });
        await ingredients(cookie, 'Pancakes', 'en', token).expect(201);
        // Cap is 3 and one Scan was used: two more photos still work, the third is blocked.
        respondWith({ matches: [{ title: 'Pancakes', confidence: 0.7 }] });
        await dishes(cookie).expect(201);
        await dishes(cookie).expect(201);
        await dishes(cookie).expect(429);
      });
    });
  });

  describe('POST /shopping-list/items/bulk', () => {
    const listOf = async (cookie: string) =>
      (
        await request(app.getHttpServer())
          .get('/api/shopping-list')
          .set('origin', TEST_ORIGIN)
          .set('cookie', cookie)
          .expect(200)
      ).body as List;
    const flat = (list: List) => list.groups.flatMap((g) => g.items);

    it('adds every line, merging with existing items and with each other', async () => {
      const cookie = await signUp();
      await post(cookie, 'shopping-list/items', {
        ingredientId: milk,
        quantity: 100,
        unit: 'ml',
      }).expect(200);
      const response = await bulk(cookie, [
        { ingredientId: milk, quantity: 200, unit: 'ml' },
        { ingredientId: flour, quantity: 60, unit: 'g' },
        { ingredientId: flour, quantity: 40, unit: 'g' },
        { name: 'Pixie dust', quantity: 1, unit: 'pcs' },
        { name: 'pixie  DUST', quantity: 2, unit: 'pcs' },
      ]).expect(200);
      const items = flat(response.body as List).map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        unmatched: i.unmatched,
      }));
      expect(items).toEqual(
        expect.arrayContaining([
          { name: 'Milk', quantity: 300, unit: 'ml', unmatched: false },
          { name: 'Flour', quantity: 100, unit: 'g', unmatched: false },
          { name: 'Pixie dust', quantity: 3, unit: 'pcs', unmatched: true },
        ]),
      );
      expect(items).toHaveLength(3);
      const { createdIds, insertedIds, ...list } = response.body as List & {
        createdIds: string[];
        insertedIds: string[];
      };
      expect(createdIds).toHaveLength(5);
      expect(insertedIds).toHaveLength(2); // flour and Pixie dust; milk merged
      expect(await listOf(cookie)).toEqual(list);
    });

    it('returns createdIds in request order: new lines get their own id, merged lines the id they merged into', async () => {
      const cookie = await signUp();
      const first = await post(cookie, 'shopping-list/items', {
        ingredientId: milk,
        quantity: 100,
        unit: 'ml',
      }).expect(200);
      const milkId = flat(first.body as List)[0].id;
      const response = await bulk(cookie, [
        { ingredientId: flour, quantity: 60, unit: 'g' },
        { ingredientId: milk, quantity: 200, unit: 'ml' },
        { ingredientId: flour, quantity: 40, unit: 'g' },
      ]).expect(200);
      const body = response.body as List & { createdIds: string[] };
      const flourId = flat(body).find((i) => i.name === 'Flour')?.id;
      expect(body.createdIds).toEqual([flourId, milkId, flourId]);
    });

    it('returns insertedIds apart from createdIds, so deleting them leaves a merged-into line alone', async () => {
      const cookie = await signUp();
      const first = await post(cookie, 'shopping-list/items', {
        ingredientId: milk,
        quantity: 100,
        unit: 'ml',
      }).expect(200);
      const milkId = flat(first.body as List)[0].id;
      const response = await bulk(cookie, [
        { ingredientId: milk, quantity: 200, unit: 'ml' },
        { ingredientId: flour, quantity: 60, unit: 'g' },
        { ingredientId: flour, quantity: 40, unit: 'g' },
      ]).expect(200);
      const body = response.body as List & {
        createdIds: string[];
        insertedIds: string[];
      };
      const flourId = flat(body).find((i) => i.name === 'Flour')?.id;
      expect(body.createdIds).toEqual([milkId, flourId, flourId]);
      expect(body.insertedIds).toEqual([flourId]);

      for (const id of body.insertedIds)
        await request(app.getHttpServer())
          .delete(`/api/shopping-list/items/${id}`)
          .set('Cookie', cookie)
          .expect(200);
      expect(flat(await listOf(cookie)).map((i) => i.id)).toEqual([milkId]);
    });

    describe('Unmatched queue', () => {
      const entriesFor = async (rawName: string) =>
        app
          .get<Database>(DATABASE)
          .select({
            source: unmatchedEntries.source,
            locale: unmatchedEntries.locale,
            shoppingItemId: unmatchedEntries.shoppingItemId,
          })
          .from(unmatchedEntries)
          .where(ilike(unmatchedEntries.rawName, rawName));

      it('queues a new free-text dish line once, with source plate and the stored Catalog Language; a merge adds none; a matched line adds none', async () => {
        const cookie = await signUpIn('ro');
        const raw = `Zzp pixie ${Date.now()}`;
        await post(
          cookie,
          'shopping-list/items/bulk',
          {
            items: [
              { name: raw, source: 'plate', quantity: 1, unit: 'pcs' },
              { ingredientId: milk, quantity: 100, unit: 'ml' },
            ],
          },
          'ro',
        ).expect(200);
        const first = await entriesFor(raw);
        expect(first).toHaveLength(1);
        expect(first[0]).toMatchObject({ source: 'plate', locale: 'ro' });
        expect(first[0].shoppingItemId).not.toBeNull();

        await post(
          cookie,
          'shopping-list/items/bulk',
          { items: [{ name: raw, source: 'plate', quantity: 2, unit: 'pcs' }] },
          'ro',
        ).expect(200);
        expect(await entriesFor(raw)).toHaveLength(1);

        await app
          .get<Database>(DATABASE)
          .delete(unmatchedEntries)
          .where(eq(unmatchedEntries.rawName, raw));
      });
    });

    it('is all or none: one bad line leaves the list untouched', async () => {
      const cookie = await signUp();
      await bulk(cookie, [
        { ingredientId: milk, quantity: 100, unit: 'ml' },
        { ingredientId: '4b3f1f0a-0000-4000-8000-000000000000' },
      ]).expect(404);
      expect(flat(await listOf(cookie))).toEqual([]);
    });

    it('validates the body', async () => {
      const cookie = await signUp();
      await bulk(cookie, []).expect(400);
      await bulk(cookie, [{ quantity: 1 }]).expect(400);
      await bulk(cookie, [{ ingredientId: milk, unit: 'cup' }]).expect(400);
      await bulk(
        cookie,
        Array.from({ length: 101 }, () => ({ ingredientId: milk })),
      ).expect(400);
    });
  });

  describe('with a Catalog Language Preference', () => {
    // UI Language en, Catalog Language ro, Scan Language da: all three differ.
    async function member() {
      const cookie = await signUp();
      await request(app.getHttpServer())
        .put('/api/settings/preferences')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send({ locale: 'en', catalogLanguage: 'ro', scanLanguage: 'da' })
        .expect(200);
      return cookie;
    }

    it('asks for dish titles in the Catalog Language', async () => {
      const cookie = await member();
      respondWith({ matches: [{ title: 'Clatite', confidence: 0.8 }] });
      prompts.length = 0;
      await dishes(cookie).expect(201);
      expect(prompts[0].prompt).toMatch(/recipe titles in Romanian/);
    });

    it('asks for the fallback name in the Catalog Language and names the match in it', async () => {
      const cookie = await member();
      respondWith({ items: [item()] });
      const token = await tokenFor(cookie);
      prompts.length = 0;
      const response = await post(cookie, 'scan/plate/ingredients', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(201);
      expect(prompts[0].prompt).toContain(
        'fallbackIngredientName as a short generic ingredient name in Romanian',
      );
      expect((response.body as { lines: Line[] }).lines[0].match?.name).toBe(
        'Lapte',
      );
    });
  });
});
