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
import { scanUsage, user } from '../src/database/schema';
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
        unsupported: string[];
        spokenLanguage?: string | null;
      }
    | Error;
  let reads = 0;
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
      generate: () => {
        reads++;
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
      expect(await list(ana.cookie, 'ro')).toMatchObject([{ name: 'Lapte' }]);
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
