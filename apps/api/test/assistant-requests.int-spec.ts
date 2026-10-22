import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq } from 'drizzle-orm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { AssistantTokenService } from '../src/assistant-tokens/assistant-token.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { ingredients, scanUsage, user } from '../src/database/schema';
import { ApiException } from '../src/common/api-exception';

jest.setTimeout(30_000);

type Item = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
};

type Reply = {
  outcomes: { kind: string; name: string; quantity?: number }[];
  speech: string;
};
const reply = (response: request.Response) => response.body as Reply;

const milk = seedId.ingredient('milk');
const eggs = seedId.ingredient('eggs');
const rice = seedId.ingredient('rice');

// Spec: #411 / #446, ADR 0019. Thin HTTP wiring tests; the speech sentence and Voice services have their own tests.
describe('Assistant Requests (integration)', () => {
  let client: typeof import('./support/admin-session').client;
  let signUp: typeof import('./support/admin-session').signUp;
  let app: NestFastifyApplication;
  let database: Database;
  let tokens: AssistantTokenService;
  let reading:
    | {
        actions: object[];
        questions?: object[];
        unsupported: string[];
        spokenLanguage?: string | null;
      }
    | Error;
  let reads = 0;
  let prompts: string[] = [];
  const stamp = Date.now();
  let counter = 0;

  const saved = {
    key: process.env.AI_API_KEY,
    provider: process.env.AI_PROVIDER,
    baseUrl: process.env.AI_BASE_URL,
  };

  beforeAll(async () => {
    // The endpoint answers 503 without a text model key. AppModule validates
    // env when first imported and process.env beats a developer's .env, so set
    // these first and import the app only now. The fake AI below never calls out.
    process.env.AI_API_KEY = 'test-key';
    process.env.AI_PROVIDER = 'openai';
    delete process.env.AI_BASE_URL;
    const supportPath = './support/create-test-app'; // a variable: TS demands a .js extension on literal dynamic imports, Jest resolves the .ts
    const { createTestApp } = (await import(
      supportPath
    )) as typeof import('./support/create-test-app');
    const sessionPath = './support/admin-session';
    ({ client, signUp } = (await import(
      sessionPath
    )) as typeof import('./support/admin-session'));
    const ai = {
      generate: (request: { prompt: string }) => {
        reads++;
        prompts.push(request.prompt);
        return reading instanceof Error
          ? Promise.reject(reading)
          : Promise.resolve({
              data: { spokenLanguage: null, ...reading },
              requestId: 'req-1',
            });
      },
    };
    app = await createTestApp([], ai);
    database = app.get<Database>(DATABASE);
    tokens = app.get(AssistantTokenService);
  });
  afterAll(async () => {
    if (saved.key === undefined) delete process.env.AI_API_KEY;
    else process.env.AI_API_KEY = saved.key;
    if (saved.provider === undefined) delete process.env.AI_PROVIDER;
    else process.env.AI_PROVIDER = saved.provider;
    if (saved.baseUrl === undefined) delete process.env.AI_BASE_URL;
    else process.env.AI_BASE_URL = saved.baseUrl;
    await app.close();
  });
  beforeEach(() => {
    reading = { actions: [], unsupported: [] };
    reads = 0;
    prompts = [];
  });

  async function member() {
    const n = ++counter;
    const email = `assistant-${stamp}-${n}@example.com`;
    const cookie = await signUp(app, email, `Assistant ${n}`);
    const [row] = await database
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email));
    const { secret } = await tokens.create(row.id, 'Test phone');
    return { id: row.id, cookie, secret };
  }

  const ask = (
    secret: string | undefined,
    body: object = { text: 'add milk' },
  ) => {
    const req = request(app.getHttpServer()).post('/api/assistant/requests');
    return (secret ? req.set('authorization', `Bearer ${secret}`) : req).send(
      body,
    );
  };

  const list = async (cookie: string, locale = 'en') =>
    (
      (await client(app, cookie, '/api/shopping-list').get(`?locale=${locale}`))
        .body as {
        groups: { items: Item[] }[];
      }
    ).groups.flatMap((g) => g.items);

  const used = async (memberId: string) =>
    (
      await database
        .select({ count: scanUsage.count })
        .from(scanUsage)
        .where(
          and(
            eq(scanUsage.memberId, memberId),
            eq(scanUsage.kind, 'assistant'),
          ),
        )
    ).reduce((sum, row) => sum + row.count, 0);

  const model = (overrides: Record<string, unknown>) => ({
    target: 'shopping',
    op: 'add',
    spokenText: 'x',
    matchedIngredientId: null,
    matchConfidence: 0,
    fallbackIngredientName: 'X',
    spokenName: 'X',
    quantity: null,
    unit: null,
    scope: null,
    expiresOn: null,
    noExpiry: false,
    location: null,
    ...overrides,
  });
  const of = (
    id: string,
    name: string,
    overrides: Record<string, unknown> = {},
  ) =>
    model({
      spokenText: name,
      matchedIngredientId: id,
      matchConfidence: 0.95,
      fallbackIngredientName: name,
      ...overrides,
    });

  describe('access', () => {
    it('adds to the Member current Family list and answers with speech', async () => {
      const ana = await member();
      reading = { actions: [of(milk, 'Milk')], unsupported: [] };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'added', name: 'Milk' },
      ]);
      expect(reply(response).speech).toContain('Milk');
      expect(await list(ana.cookie)).toMatchObject([{ name: 'Milk' }]);
    });

    it('rejects a missing, unknown or revoked token, or a session cookie, with 401', async () => {
      const ana = await member();
      await ask(undefined).expect(401);
      await ask('pp_unknown').expect(401);
      await request(app.getHttpServer())
        .post('/api/assistant/requests')
        .set('cookie', ana.cookie)
        .send({ text: 'add milk' })
        .expect(401);
      const [created] = await tokens.list(ana.id);
      await tokens.revoke(ana.id, created.id);
      await ask(ana.secret).expect(401);
      expect(reads).toBe(0);
    });

    it('is the only endpoint a token works on', async () => {
      const ana = await member();
      const [created] = await tokens.list(ana.id);
      const bearer = { authorization: `Bearer ${ana.secret}` };
      const http = () => request(app.getHttpServer());
      const calls = [
        () => http().get('/api/shopping-list?locale=en'),
        () => http().get('/api/assistant-tokens'),
        () => http().post('/api/assistant-tokens').send({ name: 'x' }),
        () => http().delete(`/api/assistant-tokens/${created.id}`),
        () =>
          http().post('/api/voice/apply').send({ actions: [], locale: 'en' }),
      ];
      for (const call of calls) await call().set(bearer).expect(401);
      expect(await tokens.list(ana.id)).toHaveLength(1);
    });
  });

  describe('Voice Actions', () => {
    it('applies Running low, and with no Batch it becomes a Shopping Item', async () => {
      const ana = await member();
      await client(app, ana.cookie, '/api/pantry').post('/batches?locale=en', {
        ingredientId: rice,
      });
      reading = {
        actions: [
          of(rice, 'Rice', { op: 'runningLow', target: 'pantry' }),
          of(milk, 'Milk', { op: 'runningLow', target: 'pantry' }),
        ],
        unsupported: [],
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'flaggedRunningLow', name: 'Rice' },
        { kind: 'addedBecauseRunningLowNoBatch', name: 'Milk' },
      ]);
      expect(await list(ana.cookie)).toMatchObject([{ name: 'Milk' }]);
    });

    it('applies the adds and Running low of a mixed request, refuses a removal and leaves the Pantry untouched', async () => {
      const ana = await member();
      await client(app, ana.cookie, '/api/pantry').post('/batches?locale=en', {
        ingredientId: rice,
      });
      reading = {
        actions: [
          of(eggs, 'Eggs'),
          of(rice, 'Rice', { target: 'pantry', op: 'runningLow' }),
          model({
            ...of(rice, 'Rice'),
            target: 'pantry',
            op: 'remove',
            scope: 'all',
          }),
          of(milk, 'Milk', { op: 'remove', scope: 'one' }),
        ],
        unsupported: ['what is the weather'],
      };
      const response = await ask(ana.secret).expect(200);
      expect(
        reply(response).outcomes.map((o: { kind: string }) => o.kind),
      ).toEqual(['added', 'flaggedRunningLow', 'refused', 'refused']);
      expect(await used(ana.id)).toBe(1); // one charge for the whole request
      expect(reply(response).speech).toContain('Open Pocket Pantry');
      expect(await list(ana.cookie)).toMatchObject([{ name: 'Eggs' }]);
      const pantry = (
        await client(app, ana.cookie, '/api/pantry').get('?locale=en')
      ).body as { batches: { ingredientId: string }[] };
      expect(pantry.batches).toMatchObject([{ ingredientId: rice }]);
    });

    it('leaves an existing item alone without a quantity and sets it with one', async () => {
      const ana = await member();
      await client(app, ana.cookie, '/api/shopping-list').post(
        '/items?locale=en',
        { ingredientId: eggs, quantity: 6, unit: 'pcs' },
      );
      reading = { actions: [of(eggs, 'Eggs')], unsupported: [] };
      let response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'alreadyOnList' },
      ]);
      expect(await list(ana.cookie)).toMatchObject([{ quantity: 6 }]);

      reading = {
        actions: [of(eggs, 'Eggs', { quantity: 12, unit: 'pcs' })],
        unsupported: [],
      };
      response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'quantitySet', name: 'Eggs', quantity: 12 },
      ]);
      expect(await list(ana.cookie)).toMatchObject([{ quantity: 12 }]);
    });

    it('unchecks a checked item when it is added again, with a quantity or without', async () => {
      const ana = await member();
      const items = client(app, ana.cookie, '/api/shopping-list');
      const checkedMilk = async (quantity: number) => {
        await items.post('/items?locale=en', {
          ingredientId: milk,
          quantity,
          unit: 'pcs',
        });
        await items.patch(
          `/items/${(await list(ana.cookie))[0].id}?locale=en`,
          { checked: true },
        );
      };
      await checkedMilk(1);
      reading = {
        actions: [of(milk, 'Milk', { quantity: 2, unit: 'pcs' })],
        unsupported: [],
      };
      let response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'quantitySet', name: 'Milk', quantity: 2 },
      ]);
      expect(await list(ana.cookie)).toMatchObject([
        { quantity: 2, checked: false },
      ]);

      await items.patch(`/items/${(await list(ana.cookie))[0].id}?locale=en`, {
        checked: true,
      });
      reading = { actions: [of(milk, 'Milk')], unsupported: [] };
      response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([{ kind: 'added' }]);
      expect(await list(ana.cookie)).toMatchObject([
        { quantity: 2, checked: false },
      ]);
    });

    it('refuses a model-emitted setQuantity and leaves the quantity alone', async () => {
      const ana = await member();
      await client(app, ana.cookie, '/api/shopping-list').post(
        '/items?locale=en',
        { ingredientId: eggs, quantity: 6, unit: 'pcs' },
      );
      reading = {
        actions: [
          of(eggs, 'Eggs', { op: 'setQuantity', quantity: 12, unit: 'pcs' }),
        ],
        unsupported: [],
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([{ kind: 'refused' }]);
      expect(await list(ana.cookie)).toMatchObject([{ quantity: 6 }]);
    });

    it('converts units when setting: 500 ml onto a 1 l line sets 0.5 l', async () => {
      const ana = await member();
      await client(app, ana.cookie, '/api/shopping-list').post(
        '/items?locale=en',
        { ingredientId: milk, quantity: 1, unit: 'l' },
      );
      reading = {
        actions: [of(milk, 'Milk', { quantity: 500, unit: 'ml' })],
        unsupported: [],
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'quantitySet', name: 'Milk' },
      ]);
      expect(await list(ana.cookie)).toMatchObject([
        { quantity: 0.5, unit: 'l', checked: false },
      ]);
    });

    it('adds a Family Ingredient the model matched by id', async () => {
      const ana = await member();
      const name = `Gran ${stamp}`;
      const created = (
        await client(app, ana.cookie, '/api/catalog')
          .post('/family-ingredients?locale=en', {
            name,
            leafCategoryId: seedId.leaf('hard-cheese'),
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as { id: string };
      reading = { actions: [of(created.id, name)], unsupported: [] };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([{ kind: 'added', name }]);
      expect(await list(ana.cookie)).toMatchObject([{ name }]);
    });

    it.each([
      ['ro', 'Am adăugat pe Lista de cumpărături'],
      ['da', 'Føjet til indkøbslisten'],
    ])('speaks in the Member stored locale (%s)', async (locale, phrase) => {
      const ana = await member();
      await database.update(user).set({ locale }).where(eq(user.id, ana.id));
      reading = { actions: [of(milk, 'Milk')], unsupported: [] };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toContain(phrase);
    });

    it('writes to the new Family list after the Member changes Family', async () => {
      const ana = await member();
      const ben = await member();
      const { inviteCode } = (
        await client(app, ben.cookie, '/api/family').get('')
      ).body as { inviteCode: string };
      reading = { actions: [of(milk, 'Milk')], unsupported: [] };
      await ask(ana.secret).expect(200);
      expect(await list(ana.cookie)).toHaveLength(1);
      await client(app, ana.cookie, '/api/family')
        .post('/join', { code: inviteCode })
        .expect(201);
      reading = { actions: [of(eggs, 'Eggs')], unsupported: [] };
      await ask(ana.secret).expect(200);
      expect(await list(ben.cookie)).toMatchObject([{ name: 'Eggs' }]);
      expect(await list(ana.cookie)).toMatchObject([{ name: 'Eggs' }]);
    });

    it('adds an unknown name as Unmatched', async () => {
      const ana = await member();
      reading = {
        actions: [
          model({ spokenText: 'zorblax', fallbackIngredientName: 'Zorblax' }),
        ],
        unsupported: [],
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'addedUnmatched', name: 'Zorblax' },
      ]);
      expect(await list(ana.cookie)).toMatchObject([{ name: 'Zorblax' }]);
    });
  });

  // Spec: #455. The reply follows the language spoken; the list stays in the UI locale.
  describe('reply language', () => {
    const romanian = async () => {
      const m = await member();
      await database
        .update(user)
        .set({ locale: 'ro' })
        .where(eq(user.id, m.id));
      return m;
    };

    it('answers in the language spoken and writes the list in the UI locale', async () => {
      const ana = await romanian();
      reading = {
        actions: [of(milk, 'Lapte', { spokenText: 'milk' })],
        unsupported: [],
        spokenLanguage: 'en',
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toBe('Added to your Shopping List: Milk.');
      expect(reply(response).outcomes).toMatchObject([{ name: 'Milk' }]);
      expect(await list(ana.cookie, 'ro')).toMatchObject([{ name: 'Lapte' }]);
    });

    it('speaks a Family Ingredient by its own name and lists it in the UI locale', async () => {
      const ana = await romanian();
      const name = `Gran ${stamp}`;
      const created = (
        await client(app, ana.cookie, '/api/catalog')
          .post('/family-ingredients?locale=ro', {
            name,
            leafCategoryId: seedId.leaf('hard-cheese'),
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as { id: string };
      reading = {
        actions: [of(created.id, name, { spokenText: 'gran' })],
        unsupported: [],
        spokenLanguage: 'en',
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'added', name: `Gran ${stamp}` },
      ]);
      expect(reply(response).speech).toBe(
        `Added to your Shopping List: Gran ${stamp}.`,
      );
      expect(await list(ana.cookie, 'ro')).toMatchObject([
        { name: `Gran ${stamp}` },
      ]);
    });

    it('does not tell the model the UI language is the one spoken', async () => {
      const ana = await romanian();
      reading = {
        actions: [of(milk, 'Lapte')],
        unsupported: [],
        spokenLanguage: 'en',
      };
      await ask(ana.secret).expect(200);
      expect(prompts[0]).toContain(
        'may be in any supported language (English, Romanian or Danish)',
      );
      expect(prompts[0]).not.toContain('The note was spoken in Romanian');
    });

    it('answers in the UI locale when only unsupported phrases were read, whatever language was spoken', async () => {
      const ana = await romanian();
      reading = {
        actions: [],
        unsupported: ['what is the weather'],
        spokenLanguage: 'en',
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toBe(
        'Nu am înțeles nimic. Încearcă din nou.',
      );
    });

    it('keeps the list name of an Unmatched item when the language spoken is the UI locale', async () => {
      const ana = await romanian();
      reading = {
        actions: [
          model({
            spokenText: 'biscuiți de ovăz',
            spokenName: 'oat crackers',
            fallbackIngredientName: 'Biscuiți de ovăz',
          }),
        ],
        unsupported: [],
        spokenLanguage: 'ro',
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toBe(
        'Am adăugat, dar nu am recunoscut: Biscuiți de ovăz.',
      );
      expect(reply(response).outcomes).toMatchObject([
        { name: 'Biscuiți de ovăz' },
      ]);
    });

    it('refuses an action in the language spoken', async () => {
      const ana = await romanian();
      reading = {
        actions: [of(milk, 'Lapte', { op: 'remove', scope: 'one' })],
        unsupported: [],
        spokenLanguage: 'en',
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'refused', name: 'Milk' },
      ]);
      expect(reply(response).speech).toBe('Open Pocket Pantry for Milk.');
    });

    it('says an item is already on the list in the language spoken', async () => {
      const ana = await romanian();
      reading = {
        actions: [of(milk, 'Lapte', { spokenText: 'milk' })],
        unsupported: [],
        spokenLanguage: 'en',
      };
      await ask(ana.secret).expect(200);
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'alreadyOnList', name: 'Milk' },
      ]);
      expect(reply(response).speech).toBe(
        'Already on your Shopping List: Milk.',
      );
    });

    it('names an Unmatched item by its spoken name, without the spoken amount', async () => {
      const ana = await romanian();
      reading = {
        actions: [
          model({
            spokenText: 'two packs of oat crackers',
            spokenName: 'oat crackers',
            fallbackIngredientName: 'Biscuiți de ovăz',
            quantity: 2,
            unit: 'pcs',
          }),
        ],
        unsupported: [],
        spokenLanguage: 'en',
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toBe(
        'Added but not recognised: 2 oat crackers.',
      );
      expect(await list(ana.cookie, 'ro')).toMatchObject([
        { name: 'Biscuiți de ovăz', quantity: 2 },
      ]);
    });

    it('answers in the UI locale when the language spoken cannot be told', async () => {
      const ana = await romanian();
      reading = {
        actions: [of(milk, 'Lapte', { spokenText: 'milk' })],
        unsupported: [],
        spokenLanguage: null,
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toBe(
        'Am adăugat pe Lista de cumpărături: Lapte.',
      );
    });

    it('answers in the UI locale when the cap is reached, without reading', async () => {
      const ana = await romanian();
      reading = {
        actions: [of(milk, 'Lapte')],
        unsupported: [],
        spokenLanguage: 'en',
      };
      await ask(ana.secret).expect(200);
      await ask(ana.secret).expect(200);
      const response = await ask(ana.secret).expect(429);
      expect(reply(response).speech).toBe(
        'Ai atins limita zilnică pentru asistent. Încearcă mâine.',
      );
      expect(reads).toBe(2);
    });
  });

  // Spec: #459, ADR 0020. A Pantry Question is answered from the Pantry, never applied.
  describe('Pantry Questions', () => {
    const butter = seedId.ingredient('butter');
    const question = (
      id: string | null,
      name: string,
      overrides: Record<string, unknown> = {},
    ) => ({
      spokenText: name,
      matchedIngredientId: id,
      matchConfidence: id ? 0.95 : 0,
      fallbackIngredientName: name,
      spokenName: name,
      ...overrides,
    });
    const stock = (cookie: string, ingredientId: string, expiryDate?: string) =>
      client(app, cookie, '/api/pantry').post('/batches?locale=en', {
        ingredientId,
        ...(expiryDate ? { expiryDate } : {}),
      });
    const pantryOf = async (cookie: string) =>
      (await client(app, cookie, '/api/pantry').get('?locale=en'))
        .body as object;

    it('says yes for an Ingredient in the Pantry and no for one that is not, and writes nothing', async () => {
      const ana = await member();
      await stock(ana.cookie, milk);
      await client(app, ana.cookie, '/api/shopping-list').post(
        '/items?locale=en',
        { ingredientId: eggs, quantity: 6, unit: 'pcs' },
      );
      const before = await pantryOf(ana.cookie);
      const listBefore = await list(ana.cookie);
      reading = {
        actions: [],
        questions: [question(milk, 'Milk'), question(butter, 'Butter')],
        unsupported: [],
      };
      const response = await ask(ana.secret, {
        text: 'do we have milk and butter',
      }).expect(200);
      expect(reply(response).speech).toBe(
        'You have Milk in the fridge. No Butter.',
      );
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'yes', name: 'Milk' },
        { kind: 'no', name: 'Butter' },
      ]);
      expect(await list(ana.cookie)).toEqual(listBefore);
      expect(await list(ana.cookie)).toMatchObject([
        { name: 'Eggs', quantity: 6, checked: false },
      ]);
      expect(await pantryOf(ana.cookie)).toEqual(before);
    });

    it('charges the Assistant Cap once for a question-only request', async () => {
      const ana = await member();
      reading = {
        actions: [],
        questions: [question(milk, 'Milk'), question(butter, 'Butter')],
        unsupported: [],
      };
      await ask(ana.secret).expect(200);
      expect(await used(ana.id)).toBe(1);
      expect(reads).toBe(1);
    });

    it('counts a Batch expiring today as yes and only Expired Batches as no', async () => {
      const ana = await member();
      await stock(ana.cookie, milk, '2026-10-22');
      await stock(ana.cookie, butter, '2026-10-21');
      await stock(ana.cookie, eggs, '2026-10-01');
      await stock(ana.cookie, eggs, '2026-11-01');
      reading = {
        actions: [],
        questions: [
          question(milk, 'Milk'),
          question(butter, 'Butter'),
          question(eggs, 'Eggs'),
        ],
        unsupported: [],
      };
      const response = await ask(ana.secret, {
        text: 'do we have milk, butter and eggs',
        today: '2026-10-22',
      }).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'yes', name: 'Milk' },
        { kind: 'onlyExpired', name: 'Butter' },
        { kind: 'yes', name: 'Eggs' },
      ]);
      expect(reply(response).speech).toBe(
        'You have Milk in the fridge, some expiring soon. You have Eggs in the fridge. Only expired Butter.',
      );
    });

    it('answers from the whole Family Pantry', async () => {
      const ana = await member();
      await stock(ana.cookie, milk);
      const ben = await member();
      const { inviteCode } = (
        await client(app, ana.cookie, '/api/family').get('')
      ).body as { inviteCode: string };
      await client(app, ben.cookie, '/api/family')
        .post('/join', { code: inviteCode })
        .expect(201);
      reading = {
        actions: [],
        questions: [question(milk, 'Milk')],
        unsupported: [],
      };
      const response = await ask(ben.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([{ kind: 'yes' }]);
    });

    it('asks once for an Ingredient named twice', async () => {
      const ana = await member();
      reading = {
        actions: [],
        questions: [question(milk, 'Milk'), question(milk, 'milk')],
        unsupported: [],
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toHaveLength(1);
    });

    // Spec: #462. A name with no confident Match is looked up among Unmatched rows, else "not sure".
    describe('a name that matched no Ingredient', () => {
      const unmatchedBatch = (cookie: string, rawName: string) =>
        client(app, cookie, '/api/pantry').post('/batches?locale=en', {
          rawName,
          parentCategoryId: seedId.parent('dairy'),
          quantity: 3,
          unit: 'pcs',
          location: 'cupboard',
        });
      const unmatchedItem = (cookie: string, name: string) =>
        client(app, cookie, '/api/shopping-list').post('/items?locale=en', {
          name,
          quantity: 1,
          unit: 'pcs',
        });
      const askAbout = async (secret: string, name: string, extra = {}) => {
        reading = {
          actions: [],
          questions: [question(null, name, extra)],
          unsupported: [],
        };
        return reply(await ask(secret).expect(200));
      };

      it('is not sure when no Unmatched row has the name, charged as an answer', async () => {
        const ana = await member();
        const answer = await askAbout(ana.secret, 'zorblax');
        expect(answer.outcomes).toEqual([{ kind: 'notSure', name: 'zorblax' }]);
        expect(answer.speech).toBe('Not sure about zorblax.');
        expect(await used(ana.id)).toBe(1);
      });

      it('groups several unsure names', async () => {
        const ana = await member();
        reading = {
          actions: [],
          questions: [question(null, 'zorblax'), question(null, 'quux')],
          unsupported: [],
        };
        expect(reply(await ask(ana.secret).expect(200)).speech).toBe(
          'Not sure about zorblax and quux.',
        );
      });

      it('answers yes from an Unmatched Batch, whatever the case and spacing', async () => {
        const ana = await member();
        await unmatchedBatch(ana.cookie, 'Zorblax');
        const answer = await askAbout(ana.secret, 'ZORBLAX');
        expect(answer.outcomes).toMatchObject([
          {
            kind: 'yes',
            name: 'ZORBLAX',
            totals: [{ unit: 'pcs', quantity: 3 }],
            locations: ['cupboard'],
          },
        ]);
      });

      it('answers no, already on the Shopping List, for an Unmatched Shopping Item alone', async () => {
        const ana = await member();
        await unmatchedItem(ana.cookie, 'Zorblax');
        const answer = await askAbout(ana.secret, 'zorblax');
        expect(answer.outcomes).toMatchObject([
          { kind: 'no', onShoppingList: true },
        ]);
      });

      it("does not count another Family's Unmatched rows", async () => {
        const ana = await member();
        const ben = await member();
        await unmatchedBatch(ben.cookie, 'Zorblax');
        await unmatchedItem(ben.cookie, 'Zorblax');
        const answer = await askAbout(ana.secret, 'zorblax');
        expect(answer.outcomes).toMatchObject([{ kind: 'notSure' }]);
      });

      it('does not expand a Category word to its Ingredients', async () => {
        const ana = await member();
        await stock(ana.cookie, seedId.ingredient('parmesan'));
        const answer = await askAbout(ana.secret, 'cheese');
        expect(answer.outcomes).toEqual([{ kind: 'notSure', name: 'cheese' }]);
      });

      it('writes nothing', async () => {
        const ana = await member();
        const before = await pantryOf(ana.cookie);
        await askAbout(ana.secret, 'zorblax');
        expect(await pantryOf(ana.cookie)).toEqual(before);
        expect(await list(ana.cookie)).toEqual([]);
      });
    });

    it('still sends a wider question to unsupported, which is not answered', async () => {
      const ana = await member();
      reading = {
        actions: [],
        questions: [],
        unsupported: ['what is expiring soon'],
      };
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toEqual([]);
      expect(await used(ana.id)).toBe(0);
    });

    it('speaks the answers in the language spoken', async () => {
      const ana = await member();
      await stock(ana.cookie, milk);
      reading = {
        actions: [],
        questions: [question(milk, 'Lapte'), question(butter, 'Unt')],
        unsupported: [],
        spokenLanguage: 'ro',
      };
      let response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toMatch(/^Ai .+\. Nu ai .+\.$/);
      reading = {
        actions: [],
        questions: [question(milk, 'Mælk'), question(butter, 'Smør')],
        unsupported: [],
        spokenLanguage: 'da',
      };
      response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toMatch(/^Du har .+\. Du har ikke .+\.$/);
    });

    // Spec: #463. One request can ask and act: answers first, then the usual outcome clauses.
    it('speaks the answers, then the outcomes, and applies only the allow-listed Voice Actions', async () => {
      const ana = await member();
      await stock(ana.cookie, milk);
      await stock(ana.cookie, rice);
      reading = {
        actions: [
          of(eggs, 'Eggs'),
          model({
            ...of(rice, 'Rice'),
            target: 'pantry',
            op: 'remove',
            scope: 'all',
          }),
        ],
        questions: [question(milk, 'Milk'), question(butter, 'Butter')],
        unsupported: [],
      };
      const response = await ask(ana.secret, {
        text: 'do we have milk and butter, add eggs, and remove the rice',
      }).expect(200);
      expect(
        reply(response).outcomes.map((o: { kind: string }) => o.kind),
      ).toEqual(['yes', 'no', 'added', 'refused']);
      const speech: string = reply(response).speech;
      expect(speech.startsWith('You have Milk in the fridge. No Butter.')).toBe(
        true,
      );
      expect(speech.indexOf('Eggs')).toBeGreaterThan(
        speech.indexOf('No Butter.'),
      );
      expect(await list(ana.cookie)).toMatchObject([{ name: 'Eggs' }]);
      const pantry = (
        await client(app, ana.cookie, '/api/pantry').get('?locale=en')
      ).body as { batches: { ingredientId: string }[] };
      expect(pantry.batches.map((b) => b.ingredientId).sort()).toEqual(
        [milk, rice].sort(),
      );
      expect(await used(ana.id)).toBe(1);
    });

    it('speaks at most 8 answered Ingredients, then says how many more (#465)', async () => {
      const ana = await member();
      const names = [
        'butter',
        'flour',
        'bread',
        'carrot',
        'onion',
        'potato',
        'yogurt',
      ];
      const asked = [
        ['Milk', milk],
        ['Eggs', eggs],
        ['Rice', rice],
        ...names.map(
          (n) =>
            [n[0].toUpperCase() + n.slice(1), seedId.ingredient(n)] as const,
        ),
      ] as const;
      for (const [, id] of asked) await stock(ana.cookie, id);
      reading = {
        actions: [],
        questions: asked.map(([name, id]) => question(id, name)),
        unsupported: [],
      };
      const response = await ask(ana.secret, {
        text: 'do we have all of these',
      }).expect(200);
      const body = reply(response);
      expect(body.outcomes).toHaveLength(10);
      expect(body.speech.match(/You have /g)).toHaveLength(8);
      expect(body.speech.endsWith('And 2 more, check PantryGator.')).toBe(true);
      expect(await used(ana.id)).toBe(1);
    });
  });

  // Spec: #461, ADR 0020. The full answers.
  describe('Pantry Questions: full answers', () => {
    const butter = seedId.ingredient('butter');
    const rice = seedId.ingredient('rice');
    const flour = seedId.ingredient('flour');
    const question = (id: string, name: string) => ({
      spokenText: name,
      matchedIngredientId: id,
      matchConfidence: 0.95,
      fallbackIngredientName: name,
      spokenName: name,
    });
    const stock = (
      cookie: string,
      ingredientId: string,
      body: Record<string, unknown> = {},
    ) =>
      client(app, cookie, '/api/pantry')
        .post('/batches?locale=en', { ingredientId, ...body })
        .expect(201);
    const onList = (cookie: string, ingredientId: string) =>
      client(app, cookie, '/api/shopping-list')
        .post('/items?locale=en', { ingredientId, quantity: 1, unit: 'pcs' })
        .expect(200);
    const asking = (...entries: Array<[string, string]>) => {
      reading = {
        actions: [],
        questions: entries.map(([id, name]) => question(id, name)),
        unsupported: [],
      };
    };

    it('sums per unit without converting, and names the Locations', async () => {
      const ana = await member();
      await stock(ana.cookie, milk, {
        quantity: 1,
        unit: 'l',
        location: 'fridge',
        expiryDate: '2026-12-31',
      });
      await stock(ana.cookie, milk, {
        quantity: 500,
        unit: 'ml',
        location: 'freezer',
      });
      await stock(ana.cookie, milk, {
        quantity: 0.5,
        unit: 'l',
        location: 'fridge',
      });
      asking([milk, 'Milk']);
      const response = await ask(ana.secret, {
        text: 'do we have milk',
        today: '2026-10-22',
      }).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        {
          kind: 'yes',
          name: 'Milk',
          totals: [
            { unit: 'ml', quantity: 500 },
            { unit: 'l', quantity: 1.5 },
          ],
          locations: ['fridge', 'freezer'],
          expiringSoon: false,
          runningLow: false,
        },
      ]);
      expect(reply(response).speech).toBe(
        'You have Milk: 500 millilitres and 1.5 litres in the fridge and in the freezer.',
      );
    });

    it('flags Expiring Soon under the Stale Threshold and honours a Family override', async () => {
      const ana = await member();
      await stock(ana.cookie, milk, {
        quantity: 1,
        unit: 'l',
        location: 'fridge',
        expiryDate: '2026-10-30',
      });
      asking([milk, 'Milk']);
      const ask1 = () =>
        ask(ana.secret, { text: 'milk?', today: '2026-10-22' }).expect(200);
      // 8 days away is past the default of 3.
      expect(reply(await ask1()).outcomes).toMatchObject([
        { kind: 'yes', expiringSoon: false },
      ]);
      await client(app, ana.cookie, '/api/settings')
        .patch('/family', { staleThresholdDays: 10 })
        .expect(200);
      const response = await ask1();
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'yes', expiringSoon: true },
      ]);
      expect(reply(response).speech).toBe(
        'You have 1 litre of Milk in the fridge, some expiring soon.',
      );
    });

    it('says running low on a yes', async () => {
      const ana = await member();
      await stock(ana.cookie, rice, { quantity: 200, unit: 'g' });
      await client(app, ana.cookie, '/api/pantry')
        .put(`/running-low/${rice}`)
        .expect(204);
      asking([rice, 'Rice']);
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'yes', runningLow: true },
      ]);
      expect(reply(response).speech).toContain('running low');
    });

    it('answers only expired and no, each saying when it is on the Shopping List', async () => {
      const ana = await member();
      await stock(ana.cookie, milk, { expiryDate: '2026-10-01' });
      await stock(ana.cookie, butter, { expiryDate: '2026-10-01' });
      await onList(ana.cookie, milk);
      await onList(ana.cookie, flour);
      asking(
        [milk, 'Milk'],
        [butter, 'Butter'],
        [flour, 'Flour'],
        [eggs, 'Eggs'],
      );
      const response = await ask(ana.secret, {
        text: 'do we have milk, butter, flour and eggs',
        today: '2026-10-22',
      }).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'onlyExpired', name: 'Milk', onShoppingList: true },
        { kind: 'onlyExpired', name: 'Butter', onShoppingList: false },
        { kind: 'no', name: 'Flour', onShoppingList: true },
        { kind: 'no', name: 'Eggs', onShoppingList: false },
      ]);
      expect(reply(response).speech).toBe(
        'Only expired Milk and Butter, already on your Shopping List: Milk. ' +
          'No Flour or Eggs, already on your Shopping List: Flour.',
      );
    });

    it('counts a checked Shopping List line as already on the list', async () => {
      const ana = await member();
      await onList(ana.cookie, flour);
      const [line] = await list(ana.cookie);
      await client(app, ana.cookie, '/api/shopping-list')
        .patch(`/items/${line.id}?locale=en`, { checked: true })
        .expect(200);
      asking([flour, 'Flour']);
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        { kind: 'no', name: 'Flour', onShoppingList: true },
      ]);
    });

    it('answers a Family Ingredient like a shared one', async () => {
      const ana = await member();
      const name = `Gran ${stamp}`;
      const created = (
        await client(app, ana.cookie, '/api/catalog')
          .post('/family-ingredients?locale=en', {
            name,
            leafCategoryId: seedId.leaf('hard-cheese'),
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as { id: string };
      await stock(ana.cookie, created.id, {
        quantity: 250,
        unit: 'g',
        location: 'fridge',
      });
      asking([created.id, name]);
      const response = await ask(ana.secret).expect(200);
      expect(reply(response).outcomes).toMatchObject([
        {
          kind: 'yes',
          name,
          totals: [{ unit: 'g', quantity: 250 }],
          locations: ['fridge'],
        },
      ]);
    });

    it('answers yes for a Pantry Basic with no Batch', async () => {
      const ana = await member();
      const basicId = crypto.randomUUID();
      const [sample] = await database
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, milk));
      await database.insert(ingredients).values({
        ...sample,
        id: basicId,
        name: `Basic ${stamp}`,
        normalizedName: `basic ${stamp}`,
        pantryBasic: true,
      });
      try {
        asking([basicId, `Basic ${stamp}`]);
        const response = await ask(ana.secret).expect(200);
        expect(reply(response).outcomes).toMatchObject([
          { kind: 'yes', totals: [], locations: [], expiringSoon: false },
        ]);
        expect(reply(response).speech).toBe(`You have Basic ${stamp}.`);
      } finally {
        await database.delete(ingredients).where(eq(ingredients.id, basicId));
      }
    });
  });

  describe('cap and failures', () => {
    it('charges the cap per request and answers 429 with speech when it is reached', async () => {
      const ana = await member();
      reading = { actions: [of(milk, 'Milk')], unsupported: [] };
      await ask(ana.secret).expect(200);
      await ask(ana.secret).expect(200);
      expect(await used(ana.id)).toBe(2);
      const response = await ask(ana.secret).expect(429);
      expect(reply(response).speech).toContain('daily limit');
      expect(reply(response).outcomes).toEqual([]);
      expect(reads).toBe(2);
    });

    it('refunds on a provider failure and answers 502 with speech', async () => {
      const ana = await member();
      reading = new ApiException(502, 'scan.provider_unavailable');
      const response = await ask(ana.secret).expect(502);
      expect(reply(response).speech).toContain('could not read');
      expect(await used(ana.id)).toBe(0);
    });

    it('refunds when nothing was understood and answers 200 with speech', async () => {
      const ana = await member();
      reading = { actions: [], unsupported: [] };
      let response = await ask(ana.secret).expect(200);
      expect(reply(response)).toMatchObject({ outcomes: [] });
      expect(reply(response).speech).toContain('did not understand');
      reading = { actions: [], unsupported: ['hello there'] };
      response = await ask(ana.secret).expect(200);
      expect(reply(response).speech).toContain('did not understand');
      expect(await used(ana.id)).toBe(0);
    });

    it('answers 503 with speech when the text model is not configured, without charging', async () => {
      const ana = await member();
      const config = app.get(ConfigService);
      const get = config.get.bind(config);
      const spy = jest
        .spyOn(config, 'get')
        .mockImplementation(((key: string, ...rest: unknown[]) =>
          key === 'AI_API_KEY'
            ? undefined
            : (get as (...a: unknown[]) => unknown)(key, ...rest)) as never);
      try {
        const response = await ask(ana.secret).expect(503);
        expect(reply(response).speech).toContain('not set up');
      } finally {
        spy.mockRestore();
      }
      expect(await used(ana.id)).toBe(0);
      expect(reads).toBe(0);
    });

    it('answers a blank text with speech, without calling the model or charging', async () => {
      const ana = await member();
      const response = await ask(ana.secret, { text: '  ' }).expect(200);
      expect(reply(response)).toMatchObject({ outcomes: [] });
      expect(reply(response).speech).toContain('did not understand');
      expect(await used(ana.id)).toBe(0);
      expect(reads).toBe(0);
    });

    it('rejects a missing or over-long text with 400', async () => {
      const ana = await member();
      await ask(ana.secret, {}).expect(400);
      await ask(ana.secret, { text: 'x'.repeat(2001) }).expect(400);
      expect(await used(ana.id)).toBe(0);
    });
  });

  it('is documented in Swagger', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().build(),
    );
    const post = document.paths['/api/assistant/requests'].post;
    expect(Object.keys(post?.responses ?? {}).sort()).toEqual([
      '200',
      '400',
      '401',
      '429',
      '502',
      '503',
    ]);
  });
});
