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
  rows: { batches?: { id: string }[] };
};

const TODAY = '2026-10-16';
const bread = seedId.ingredient('bread');
const yogurt = seedId.ingredient('yogurt');
const milk = seedId.ingredient('milk');

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
      .field('scanLanguage', 'en')
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
    const response = await api('post', cookie, '/voice')
      .field('scanLanguage', 'en')
      .field('locale', 'en')
      .field('defaultTarget', defaultTarget)
      .field('today', TODAY)
      .field('durationMs', '3000')
      .attach('audio', Buffer.from('a'), {
        filename: 'n.webm',
        contentType: 'audio/webm',
      })
      .expect(201);
    return (response.body as { actions: Action[] }).actions;
  };
  const addToList = (cookie: string, body: Record<string, unknown>) =>
    api('post', cookie, '/shopping-list/items?locale=en')
      .send(body)
      .expect(200);

  const read = async (
    cookie: string,
    actions: object[],
    unsupported: string[] = [],
  ) => {
    const result = await readNote(cookie, 'none', actions);
    void unsupported;
    return result;
  };

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

    it('resolves Running low with a Pantry target, and a Shopping List add when there is no Batch', async () => {
      const { cookie } = await signUp();
      const actions = await read(cookie, [
        spoken(yogurt, { op: 'runningLow', target: 'pantry' }),
      ]);
      expect(actions).toHaveLength(1);
      expect(actions[0].target).not.toBeNull();
      expect(actions[0].status).not.toBe('notUnderstood');
    });

    it('keeps the target of an explicitly named list, a Location, an expiry date, and need or buy', async () => {
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

    it("returns a bare add or remove as Didn't understand, with no target", async () => {
      const { cookie } = await signUp();
      reading = { actions: [], unsupported: ['add milk', 'remove the eggs'] };
      const response = await sendNote(cookie, 'none').expect(201);
      const actions = (response.body as { actions: Action[] }).actions;
      expect(actions.map((a) => [a.status, a.target, a.op, a.text])).toEqual([
        ['notUnderstood', null, null, 'add milk'],
        ['notUnderstood', null, null, 'remove the eggs'],
      ]);
    });
  });
});
