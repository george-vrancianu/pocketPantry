import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { user } from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Action = {
  id: string;
  status: string;
  target: string | null;
  op: string | null;
  text: string;
  ingredient: { id: string } | null;
  name: string | null;
  quantity: number | null;
  unit: string | null;
  scope: string | null;
  expiresOn: string | null;
  noExpiry: boolean;
  location: string | null;
  rows: {
    batches?: { id: string; expiresOn?: string | null }[];
    shoppingFallback?: boolean;
  };
  byList?: { shopping: Action; pantry: Action };
};

const TODAY = '2026-10-16';
const bread = seedId.ingredient('bread');
const yogurt = seedId.ingredient('yogurt');
const milk = seedId.ingredient('milk');
const rice = seedId.ingredient('rice');

describe('Voice Notes with no Default List (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let reading: { actions: object[]; unsupported: string[] };
  let prompts: string[];
  let counter = 0;

  beforeAll(async () => {
    const ai = {
      generate: (request: { prompt: string }) => {
        prompts.push(request.prompt);
        return Promise.resolve({
          data: { spokenLanguage: null, ...reading },
          requestId: 'req-1',
        });
      },
    };
    const transcription = {
      isConfigured: () => true,
      transcribe: () => Promise.resolve({ text: 'a note' }),
    };
    app = await createTestApp([], ai, undefined, undefined, transcription);
    database = app.get<Database>(DATABASE);
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    reading = { actions: [], unsupported: [] };
    prompts = [];
  });

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.39.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `ND ${n}`,
        email: `voice-nodefault-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    const userId = (response.body as { user: { id: string } }).user.id;
    const [self] = await database
      .select()
      .from(user)
      .where(eq(user.id, userId));
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { cookie, familyId: self.familyId };
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
  const spoken = (id: string, overrides: Record<string, unknown> = {}) =>
    model({ matchedIngredientId: id, matchConfidence: 0.95, ...overrides });

  const sendNote = (cookie: string, defaultTarget?: string) => {
    const req = api('post', cookie, '/voice')
      .field('spokenLanguage', 'en')
      .field('locale', 'en')
      .field('today', TODAY)
      .field('durationMs', '3000');
    if (defaultTarget !== undefined) req.field('defaultTarget', defaultTarget);
    return req.attach('audio', Buffer.from('a'), {
      filename: 'n.webm',
      contentType: 'audio/webm',
    });
  };

  const readNote = async (
    cookie: string,
    defaultTarget: string,
    actions: object[],
  ) => {
    reading = { actions, unsupported: [] };
    const response = await sendNote(cookie, defaultTarget).expect(201);
    return (response.body as { actions: Action[] }).actions;
  };
  const addToList = (cookie: string, body: Record<string, unknown>) =>
    api('post', cookie, '/shopping-list/items?locale=en')
      .send(body)
      .expect(200);

  const read = (cookie: string, actions: object[]) =>
    readNote(cookie, 'none', actions);

  describe('the request', () => {
    it('rejects a Voice Note without a defaultTarget', async () => {
      const { cookie } = await signUp();
      await sendNote(cookie).expect(400);
    });

    it('rejects an unknown defaultTarget', async () => {
      const { cookie } = await signUp();
      await sendNote(cookie, 'recipes').expect(400);
    });

    it.each(['shopping', 'pantry', 'none'])('accepts %s', async (target) => {
      const { cookie } = await signUp();
      reading = { actions: [], unsupported: ['hello'] };
      await sendNote(cookie, target).expect(201);
    });

    it('tells the model there is no default list, and keeps the page wording for the others', async () => {
      const { cookie } = await signUp();
      reading = { actions: [], unsupported: ['hello'] };
      await sendNote(cookie, 'none').expect(201);
      await sendNote(cookie, 'pantry').expect(201);
      expect(prompts[0]).toContain('has no default list');
      expect(prompts[0]).not.toContain('targets the none list');
      expect(prompts[1]).toContain('targets the pantry list');
      expect(prompts[1]).not.toContain('has no default list');
    });
  });

  describe('with defaultTarget none', () => {
    it('resolves check, uncheck and setQuantity on the Shopping List, with a target', async () => {
      const { cookie } = await signUp();
      await addToList(cookie, { ingredientId: bread });
      await addToList(cookie, { ingredientId: milk });
      const actions = await read(cookie, [
        spoken(bread, { op: 'check', target: 'shopping' }),
        spoken(bread, { op: 'uncheck', target: 'shopping' }),
        spoken(milk, {
          op: 'setQuantity',
          target: 'shopping',
          quantity: 3,
          unit: 'pcs',
        }),
      ]);
      expect(actions.map((a) => [a.target, a.op, a.status])).toEqual([
        ['shopping', 'check', 'ready'],
        ['shopping', 'uncheck', 'ready'],
        ['shopping', 'setQuantity', 'ready'],
      ]);
    });

    it('resolves Running low as a Shopping List add when there is no Batch', async () => {
      const { cookie } = await signUp();
      const [action] = await read(cookie, [
        spoken(rice, { op: 'runningLow', target: 'pantry' }),
      ]);
      expect(action).toMatchObject({
        target: 'pantry',
        status: 'ready',
        rows: { shoppingFallback: true },
      });
    });

    it('resolves Running low on a stocked Ingredient with a Pantry target', async () => {
      const { cookie } = await signUp();
      await api('post', cookie, '/pantry/batches?locale=en')
        .send({ ingredientId: rice })
        .expect(201);
      const [action] = await read(cookie, [
        spoken(rice, { op: 'runningLow', target: 'pantry' }),
      ]);
      expect(action).toMatchObject({ target: 'pantry', status: 'ready' });
      expect(action.rows.shoppingFallback).toBeFalsy();
    });

    it('passes through the target the model gave for an explicit list, a Location, an expiry date, or need/buy', async () => {
      const { cookie } = await signUp();
      const actions = await read(cookie, [
        spoken(yogurt, { op: 'add', target: 'pantry' }),
        spoken(yogurt, {
          op: 'add',
          target: 'pantry',
          location: 'fridge',
        }),
        spoken(milk, { op: 'add', target: 'pantry', expiresOn: '2026-10-20' }),
        spoken(bread, { op: 'add', target: 'shopping' }),
      ]);
      expect(actions.map((a) => [a.target, a.op, a.status])).toEqual([
        ['pantry', 'add', 'ready'],
        ['pantry', 'add', 'ready'],
        ['pantry', 'add', 'ready'],
        ['shopping', 'add', 'ready'],
      ]);
    });

    it("keeps phrases the model could not read as Didn't understand, with no target", async () => {
      const { cookie } = await signUp();
      reading = { actions: [], unsupported: ['hello there'] };
      const response = await sendNote(cookie, 'none').expect(201);
      const actions = (response.body as { actions: Action[] }).actions;
      expect(actions.map((a) => [a.status, a.target, a.op, a.text])).toEqual([
        ['notUnderstood', null, null, 'hello there'],
      ]);
    });
  });

  describe('a bare add or remove with defaultTarget none', () => {
    const bare = (id: string, overrides: Record<string, unknown> = {}) =>
      spoken(id, { target: null, ...overrides });
    const stock = (cookie: string, body: Record<string, unknown>) =>
      api('post', cookie, '/pantry/batches?locale=en').send(body).expect(201);
    const applyPicked = async (
      cookie: string,
      action: Action,
      target: string,
    ) =>
      (
        await api('post', cookie, '/voice/apply')
          .send({
            actions: [
              {
                id: action.id,
                target,
                op: action.op,
                text: action.text,
                ingredientId: action.ingredient?.id ?? null,
                name: action.name,
                quantity: action.quantity,
                unit: action.unit,
                scope: action.scope,
                expiresOn: action.expiresOn,
                noExpiry: action.noExpiry,
                location: action.location,
                batchIds: (
                  (target === 'pantry'
                    ? action.byList?.pantry.rows.batches
                    : undefined) ?? []
                ).map((b) => b.id),
              },
            ],
            locale: 'en',
            today: TODAY,
          })
          .expect(201)
      ).body as { applied: { list: string }[]; skipped: object[] };

    it('comes back as needsList with no target, resolved against both lists', async () => {
      const { cookie } = await signUp();
      const [action] = await read(cookie, [bare(yogurt, { op: 'add' })]);
      expect(action).toMatchObject({
        status: 'needsList',
        target: null,
        op: 'add',
        text: 'x',
        ingredient: { id: yogurt },
        byList: {
          shopping: { status: 'ready', target: 'shopping', op: 'add' },
          pantry: { status: 'ready', target: 'pantry', op: 'add' },
        },
      });
    });

    it('resolves a removal to the Shopping Item and the Batch it would take, with expiry', async () => {
      const { cookie } = await signUp();
      await addToList(cookie, { ingredientId: milk });
      await stock(cookie, { ingredientId: milk, expiryDate: '2026-10-20' });
      const [action] = await read(cookie, [bare(milk, { op: 'remove' })]);
      expect(action.status).toBe('needsList');
      expect(action.byList?.shopping).toMatchObject({
        status: 'ready',
        target: 'shopping',
        rows: { shoppingItem: { name: 'Milk' } },
      });
      expect(action.byList?.pantry).toMatchObject({
        status: 'ready',
        target: 'pantry',
        rows: { batches: [{ expiresOn: '2026-10-20' }] },
      });
    });

    it('carries needsBatch for the Pantry when a Batch must be chosen', async () => {
      const { cookie } = await signUp();
      for (const expiryDate of ['2026-10-20', '2026-11-20']) {
        await stock(cookie, {
          ingredientId: milk,
          quantity: 300,
          unit: 'ml',
          expiryDate,
        });
      }
      const [action] = await read(cookie, [
        bare(milk, { op: 'remove', scope: 'one', quantity: 5000, unit: 'ml' }),
      ]);
      expect(action.status).toBe('needsList');
      expect(action.byList?.pantry.status).toBe('needsBatch');
      expect(action.byList?.pantry.rows.batches).toHaveLength(2);
      expect(action.byList?.shopping.status).toBe('notFound');
    });

    it('applies to the list the Member picked', async () => {
      const { cookie } = await signUp();
      await addToList(cookie, { ingredientId: milk });
      await stock(cookie, { ingredientId: milk });
      const [action] = await read(cookie, [bare(milk, { op: 'remove' })]);
      const result = await applyPicked(cookie, action, 'pantry');
      expect(result.applied.map((a) => a.list)).toEqual(['pantry']);
      const list = await api('get', cookie, '/shopping-list?locale=en').expect(
        200,
      );
      expect(JSON.stringify(list.body)).toContain('Milk');
      const batches = await api('get', cookie, '/pantry?locale=en').expect(200);
      expect((batches.body as { batches: object[] }).batches).toHaveLength(0);
    });

    it.each(['shopping', 'pantry'])(
      'never produces needsList on a %s page',
      async (page) => {
        const { cookie } = await signUp();
        const [action] = await readNote(cookie, page, [
          bare(yogurt, { op: 'add' }),
        ]);
        expect(action).toMatchObject({ status: 'ready', target: page });
        expect(action.byList).toBeUndefined();
      },
    );

    it.each(['check', 'uncheck', 'setQuantity'] as const)(
      'puts a targetless %s on the Shopping List',
      async (op) => {
        const { cookie } = await signUp();
        const [action] = await read(cookie, [
          bare(bread, { op, ...(op === 'setQuantity' ? { quantity: 2 } : {}) }),
        ]);
        expect(action).toMatchObject({ target: 'shopping', op });
        expect(action.status).not.toBe('needsList');
        expect(action.status).not.toBe('notUnderstood');
      },
    );

    it('puts a targetless runningLow on the Pantry', async () => {
      const { cookie } = await signUp();
      const [action] = await read(cookie, [bare(bread, { op: 'runningLow' })]);
      expect(action).toMatchObject({ target: 'pantry', op: 'runningLow' });
      expect(action.status).not.toBe('needsList');
    });
  });
});
