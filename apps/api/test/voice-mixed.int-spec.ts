import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, sql } from 'drizzle-orm';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { user } from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Action = {
  id: string;
  status: string;
  target: string;
  op: string;
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
type Applied = {
  applied: string[];
  skipped: { id: string; reason: string }[];
};
type Item = { id: string; name: string; checked: boolean };

const TODAY = '2026-10-16';
const bread = seedId.ingredient('bread');
const yogurt = seedId.ingredient('yogurt');
const milk = seedId.ingredient('milk');

describe('Voice Notes across both lists (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let reading: { actions: object[]; unsupported: string[] };
  let prompts: string[];
  let counter = 0;

  beforeAll(async () => {
    const ai = {
      generate: (request: { prompt: string }) => {
        prompts.push(request.prompt);
        return Promise.resolve({ data: reading, requestId: 'req-1' });
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
      .set('x-forwarded-for', `10.38.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `VM ${n}`,
        email: `voice-mixed-${Date.now()}-${n}@example.com`,
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

  const readNote = async (
    cookie: string,
    defaultTarget: 'shopping' | 'pantry',
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
  const asSent = (action: Action) => ({
    id: action.id,
    target: action.target,
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
    batchIds: (action.rows.batches ?? []).map((b) => b.id),
  });
  const applyRequest = (cookie: string, actions: object[]) =>
    api('post', cookie, '/voice/apply').send({
      actions,
      locale: 'en',
      today: TODAY,
    });
  const apply = async (cookie: string, actions: object[]) =>
    (await applyRequest(cookie, actions).expect(201)).body as Applied;
  const shoppingItems = async (cookie: string) =>
    (
      (await api('get', cookie, '/shopping-list?locale=en').expect(200))
        .body as { groups: { items: Item[] }[] }
    ).groups.flatMap((g) => g.items);
  const batchNames = async (cookie: string) =>
    (
      (await api('get', cookie, '/pantry?locale=en').expect(200)).body as {
        batches: { name: string }[];
      }
    ).batches.map((b) => b.name);
  const addToList = (cookie: string, body: Record<string, unknown>) =>
    api('post', cookie, '/shopping-list/items?locale=en')
      .send(body)
      .expect(200);

  describe('naming the other list', () => {
    it('tells the model the page default and that a named list wins, per action', async () => {
      const { cookie } = await signUp();
      await readNote(cookie, 'shopping', [spoken(bread, { op: 'add' })]);
      expect(prompts[0]).toContain('target "shopping"');
      expect(prompts[0]).toMatch(/each action/i);
      expect(prompts[0]).toContain('"pantry"');
    });

    it('honours a Pantry target on the Shopping page and keeps the default for the rest', async () => {
      const { cookie } = await signUp();
      await addToList(cookie, { ingredientId: bread });
      const actions = await readNote(cookie, 'shopping', [
        spoken(bread, { op: 'check', target: 'shopping' }),
        spoken(yogurt, {
          op: 'add',
          target: 'pantry',
          quantity: 2,
          unit: 'pcs',
        }),
      ]);
      expect(actions.map((a) => [a.target, a.op, a.status])).toEqual([
        ['shopping', 'check', 'ready'],
        ['pantry', 'add', 'ready'],
      ]);
    });
  });

  describe('one Apply for both lists', () => {
    it('from the Shopping page: checks bread and stocks yogurt', async () => {
      const { cookie } = await signUp();
      await addToList(cookie, { ingredientId: bread });
      const actions = await readNote(cookie, 'shopping', [
        spoken(bread, { op: 'check', target: 'shopping' }),
        spoken(yogurt, {
          op: 'add',
          target: 'pantry',
          quantity: 2,
          unit: 'pcs',
        }),
      ]);
      const result = await apply(cookie, actions.map(asSent));
      expect(result.skipped).toEqual([]);
      expect(result.applied).toHaveLength(2);
      expect(await shoppingItems(cookie)).toMatchObject([
        { name: 'Bread', checked: true },
      ]);
      expect(await batchNames(cookie)).toEqual(['Yogurt']);
    });

    it('from the Pantry page: stocks yogurt and adds bread to the Shopping List', async () => {
      const { cookie } = await signUp();
      const actions = await readNote(cookie, 'pantry', [
        spoken(yogurt, {
          op: 'add',
          target: 'pantry',
          quantity: 2,
          unit: 'pcs',
        }),
        spoken(bread, { op: 'add', target: 'shopping' }),
      ]);
      const result = await apply(cookie, actions.map(asSent));
      expect(result.skipped).toEqual([]);
      expect(result.applied).toHaveLength(2);
      expect(await shoppingItems(cookie)).toMatchObject([{ name: 'Bread' }]);
      expect(await batchNames(cookie)).toEqual(['Yogurt']);
    });

    it('writes nothing to either list when an unexpected failure hits the second action', async () => {
      const { cookie, familyId } = await signUp();
      const actions = await readNote(cookie, 'shopping', [
        spoken(bread, { op: 'add', target: 'shopping' }),
        spoken(yogurt, {
          op: 'add',
          target: 'pantry',
          quantity: 2,
          unit: 'pcs',
        }),
      ]);
      // Fails the Pantry insert only when the bread add is already written in
      // this transaction, so the test proves the first write happened.
      const trigger = `voice_mixed_fail_${counter}`;
      try {
        await database.execute(
          sql.raw(`CREATE FUNCTION ${trigger}() RETURNS trigger AS $$
            BEGIN
              IF NEW.family_id = '${familyId}' AND EXISTS (
                SELECT 1 FROM shopping_items i
                JOIN shopping_lists l ON l.id = i.list_id
                WHERE l.family_id = '${familyId}' AND i.ingredient_id = '${bread}'
              ) THEN RAISE EXCEPTION 'boom'; END IF;
              RETURN NEW;
            END $$ LANGUAGE plpgsql`),
        );
        await database.execute(
          sql.raw(`CREATE TRIGGER ${trigger} BEFORE INSERT ON batches
            FOR EACH ROW EXECUTE FUNCTION ${trigger}()`),
        );
        await applyRequest(cookie, actions.map(asSent)).expect(500);
      } finally {
        await database.execute(
          sql.raw(`DROP TRIGGER IF EXISTS ${trigger} ON batches`),
        );
        await database.execute(sql.raw(`DROP FUNCTION IF EXISTS ${trigger}()`));
      }
      expect(await shoppingItems(cookie)).toEqual([]);
      expect(await batchNames(cookie)).toEqual([]);
    });
  });

  describe('Finish Shopping between proposal and Apply', () => {
    const finishShopping = async (cookie: string) => {
      const proposal = (
        await api('get', cookie, '/shopping-list/finish').expect(200)
      ).body as {
        listId: string;
        lines: {
          itemId: string;
          quantity: number | null;
          unit: string | null;
          location: string;
          expiryDate: string | null;
        }[];
      };
      await api('post', cookie, '/shopping-list/finish')
        .send({
          listId: proposal.listId,
          droppedItemIds: [],
          lines: proposal.lines.map((l) => ({
            itemId: l.itemId,
            quantity: l.quantity,
            unit: l.unit,
            location: l.location,
            expiryDate: l.expiryDate,
          })),
        })
        .expect(200);
    };

    it('re-resolves Shopping List actions against the new list; Pantry actions still apply', async () => {
      const { cookie } = await signUp();
      const first = (await addToList(cookie, { ingredientId: bread })).body as {
        groups: { items: Item[] }[];
      };
      await api(
        'patch',
        cookie,
        `/shopping-list/items/${first.groups[0].items[0].id}`,
      )
        .send({ checked: true })
        .expect(200);
      const actions = await readNote(cookie, 'shopping', [
        spoken(bread, { op: 'uncheck', target: 'shopping' }),
        spoken(milk, { op: 'add', target: 'shopping' }),
        spoken(yogurt, {
          op: 'add',
          target: 'pantry',
          quantity: 2,
          unit: 'pcs',
        }),
      ]);
      expect(actions.map((a) => a.status)).toEqual(['ready', 'ready', 'ready']);

      await finishShopping(cookie);

      const result = await apply(cookie, actions.map(asSent));
      expect(result.applied).toEqual([actions[1].id, actions[2].id]);
      expect(result.skipped).toEqual([
        { id: actions[0].id, reason: 'voice.item_not_found' },
      ]);
      expect((await shoppingItems(cookie)).map((i) => i.name)).toEqual([
        'Milk',
      ]);
      expect(await batchNames(cookie)).toEqual(
        expect.arrayContaining(['Yogurt', 'Bread']),
      );
    });
  });
});
