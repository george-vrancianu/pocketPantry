import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { ApiException } from '../src/common/api-exception';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  scanUsage,
  shoppingLists,
  unmatchedEntries,
  user,
} from '../src/database/schema';
import type {
  TranscriptionRequest,
  TranscriptionService,
} from '../src/voice/transcription.service';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Fake = Pick<TranscriptionService, 'isConfigured' | 'transcribe'>;

describe('Voice Note (integration)', () => {
  let app: NestFastifyApplication;
  let configured = true;
  let next: (input: TranscriptionRequest) => Promise<{ text: string }>;
  const calls: TranscriptionRequest[] = [];
  const aiCalls: StructuredOutputRequest[] = [];
  let reading: {
    actions: object[];
    questions?: object[];
    unsupported: string[];
  };
  let counter = 0;
  let aiFailure: ApiException | null = null;

  beforeAll(async () => {
    const fake: Fake = {
      isConfigured: () => configured,
      transcribe: (input) => {
        calls.push(input);
        return next(input);
      },
    };
    const ai = {
      generate: (input: StructuredOutputRequest) => {
        aiCalls.push(input);
        if (aiFailure) return Promise.reject(aiFailure);
        return Promise.resolve({
          data: { spokenLanguage: null, ...reading },
          requestId: 'req-1',
        });
      },
    };
    app = await createTestApp([], ai, undefined, undefined, fake);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    configured = true;
    calls.length = 0;
    aiCalls.length = 0;
    aiFailure = null;
    // Something unreadable, so a note is never empty (an empty read refunds the cap).
    reading = { actions: [], unsupported: ['mumble'] };
    next = () => Promise.resolve({ text: 'got the bread and sausages' });
  });

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.15.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Voice ${n}`,
        email: `voice-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return {
      cookie: [response.headers['set-cookie'] ?? []]
        .flat()
        .map((c) => c.split(';')[0])
        .join('; '),
      memberId: (response.body as { user: { id: string } }).user.id,
    };
  }

  type Options = {
    contentType?: string;
    audio?: Buffer;
    durationMs?: string;
    language?: string;
  };

  const note = (cookie: string, options: Options = {}) =>
    request(app.getHttpServer())
      .post('/api/voice')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .field('scanLanguage', options.language ?? 'ro')
      .field('locale', 'en')
      .field('defaultTarget', 'shopping')
      .field('today', '2026-10-16')
      .field('durationMs', options.durationMs ?? '4200')
      .attach('audio', options.audio ?? Buffer.from('fake-audio'), {
        filename: 'note.webm',
        contentType: options.contentType ?? 'audio/webm;codecs=opus',
      });

  const usage = async (memberId: string, kind: 'voice' | 'scan') => {
    const rows = await app
      .get<Database>(DATABASE)
      .select({ count: scanUsage.count, kind: scanUsage.kind })
      .from(scanUsage)
      .where(eq(scanUsage.memberId, memberId));
    return rows.find((r) => r.kind === kind)?.count ?? 0;
  };

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/voice')
      .set('origin', TEST_ORIGIN)
      .attach('audio', Buffer.from('x'), {
        filename: 'a.webm',
        contentType: 'audio/webm',
      })
      .expect(401);
  });

  it('transcribes the recording with the Scan Language as the main hint and the others as extra hints', async () => {
    const { cookie, memberId } = await signUp();
    reading = { actions: [], unsupported: ['do a dance'] };
    const response = await note(cookie).expect(201);
    expect(response.body).toMatchObject({
      transcript: 'got the bread and sausages',
      actions: [{ status: 'notUnderstood' }],
    });
    expect(calls).toHaveLength(1);
    expect(calls[0].audio.toString()).toBe('fake-audio');
    expect(calls[0].mimeType).toBe('audio/webm');
    expect(calls[0].language).toBe('ro');
    expect(calls[0].otherLanguages.sort()).toEqual(['da', 'en']);
    expect(await usage(memberId, 'voice')).toBe(1);
    expect(await usage(memberId, 'scan')).toBe(0);
  });

  it('accepts Chromium (webm/opus) and iOS Safari (mp4/aac) recordings', async () => {
    const { cookie } = await signUp();
    await note(cookie, { contentType: 'audio/webm;codecs=opus' }).expect(201);
    await note(cookie, { contentType: 'audio/mp4' }).expect(201);
    const firefox = await signUp();
    await note(firefox.cookie, { contentType: 'audio/ogg;codecs=opus' }).expect(
      201,
    );
    expect(calls.map((c) => c.mimeType)).toEqual([
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
    ]);
  });

  it('rejects a format it cannot read before charging the Voice Cap', async () => {
    const { cookie, memberId } = await signUp();
    const response = await note(cookie, { contentType: 'text/plain' }).expect(
      415,
    );
    expect((response.body as { code: string }).code).toBe(
      'voice.unsupported_audio',
    );
    expect(calls).toHaveLength(0);
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('rejects a recording over 60 seconds, or too big, without charging', async () => {
    const { cookie, memberId } = await signUp();
    const long = await note(cookie, { durationMs: '75000' }).expect(413);
    expect((long.body as { code: string }).code).toBe('voice.too_long');
    const big = await note(cookie, {
      audio: Buffer.alloc(3 * 1024 * 1024),
    }).expect(413);
    expect((big.body as { code: string }).code).toBe('voice.too_long');
    expect(calls).toHaveLength(0);
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('returns voice.not_configured when the server has no transcription', async () => {
    const { cookie, memberId } = await signUp();
    configured = false;
    const response = await note(cookie).expect(503);
    expect((response.body as { code: string }).code).toBe(
      'voice.not_configured',
    );
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('tells the web whether voice is configured', async () => {
    const { cookie } = await signUp();
    const get = () =>
      request(app.getHttpServer())
        .get('/api/voice/config')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie);
    expect((await get().expect(200)).body).toEqual({ configured: true });
    configured = false;
    expect((await get().expect(200)).body).toEqual({ configured: false });
  });

  it('refunds the Voice Cap when the provider fails', async () => {
    const { cookie, memberId } = await signUp();
    next = () =>
      Promise.reject(new ApiException(502, 'voice.provider_unavailable'));
    for (let i = 0; i < 3; i++) {
      const response = await note(cookie).expect(502);
      expect((response.body as { code: string }).code).toBe(
        'voice.provider_unavailable',
      );
    }
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('refunds the Voice Cap when nothing was heard', async () => {
    const { cookie, memberId } = await signUp();
    next = () => Promise.resolve({ text: '  ' });
    for (let i = 0; i < 3; i++) {
      const response = await note(cookie).expect(422);
      expect((response.body as { code: string }).code).toBe(
        'voice.nothing_heard',
      );
    }
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('refunds the Voice Cap and opens no Review when the note holds no Voice Actions', async () => {
    const { cookie, memberId } = await signUp();
    next = () => Promise.resolve({ text: 'Thank you.' });
    reading = { actions: [], unsupported: [] };
    for (let i = 0; i < 3; i++) {
      const response = await note(cookie).expect(422);
      expect((response.body as { code: string }).code).toBe(
        'voice.nothing_heard',
      );
    }
    expect(await usage(memberId, 'voice')).toBe(0);
  });

  it('stops at the Voice Cap (2 in tests) and never touches the Scan Cap', async () => {
    const { cookie, memberId } = await signUp();
    await note(cookie).expect(201);
    await note(cookie).expect(201);
    const response = await note(cookie).expect(429);
    const body = response.body as {
      code: string;
      params: { cap: number; resetsAt: string };
    };
    expect(body.code).toBe('voice.cap_reached');
    expect(body.params.cap).toBe(2);
    // The reset is a UTC midnight in the future (the exact date is checked in usage-cap-kinds).
    expect(body.params.resetsAt).toMatch(/T00:00:00\.000Z$/);
    expect(Date.parse(body.params.resetsAt)).toBeGreaterThan(Date.now());
    expect(calls).toHaveLength(2);
    expect(await usage(memberId, 'voice')).toBe(2);
    expect(await usage(memberId, 'scan')).toBe(0);
  });

  describe('reading a Voice Note into Voice Actions', () => {
    const model = (overrides: Record<string, unknown> = {}) => ({
      target: 'shopping',
      op: 'add',
      spokenText: 'milk',
      matchedIngredientId: null,
      matchConfidence: 0,
      fallbackIngredientName: 'Milk',
      spokenName: 'Milk',
      quantity: null,
      unit: null,
      scope: null,
      expiresOn: null,
      noExpiry: false,
      location: null,
      ...overrides,
    });
    const eggs = model({
      spokenText: 'eggs',
      matchedIngredientId: seedId.ingredient('eggs'),
      matchConfidence: 0.95,
      fallbackIngredientName: 'Eggs',
    });
    const milk = model({
      spokenText: 'two litres of milk',
      matchedIngredientId: seedId.ingredient('milk'),
      matchConfidence: 0.9,
      quantity: 2,
      unit: 'l',
    });
    const crackers = model({
      spokenText: 'quinoa crackers',
      fallbackIngredientName: 'Quinoa crackers',
    });

    const listOf = async (cookie: string) =>
      (
        await request(app.getHttpServer())
          .get('/api/shopping-list?locale=en')
          .set('origin', TEST_ORIGIN)
          .set('cookie', cookie)
          .expect(200)
      ).body as { groups: { items: { name: string }[] }[] };

    it('reads with the text model and returns resolved add Voice Actions without writing anything', async () => {
      const { cookie } = await signUp();
      reading = { actions: [eggs, milk, crackers], unsupported: [] };
      const response = await note(cookie).expect(201);
      expect(aiCalls).toHaveLength(1);
      expect(aiCalls[0].model).toBe('text');
      const body = response.body as { actions: Record<string, unknown>[] };
      expect(body.actions).toHaveLength(3);
      expect(body.actions[0]).toMatchObject({
        status: 'ready',
        target: 'shopping',
        op: 'add',
        text: 'eggs',
        ingredient: { id: seedId.ingredient('eggs') },
        quantity: null,
        unit: null,
      });
      expect(body.actions[1]).toMatchObject({
        status: 'ready',
        ingredient: { id: seedId.ingredient('milk') },
        quantity: 2,
        unit: 'l',
      });
      expect(body.actions[2]).toMatchObject({
        status: 'ready',
        ingredient: null,
        name: 'Quinoa crackers',
      });
      expect(new Set(body.actions.map((a) => a.id)).size).toBe(3);
      expect((await listOf(cookie)).groups).toEqual([]);
    });

    it('shows the Shopping Item an add will merge into', async () => {
      const { cookie } = await signUp();
      await request(app.getHttpServer())
        .post('/api/shopping-list/items?locale=en')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send({
          ingredientId: seedId.ingredient('milk'),
          quantity: 1,
          unit: 'l',
        })
        .expect(200);
      reading = { actions: [milk], unsupported: [] };
      const response = await note(cookie).expect(201);
      expect(
        (response.body as { actions: unknown[] }).actions[0],
      ).toMatchObject({
        status: 'ready',
        rows: { shoppingItem: { quantity: 1, unit: 'l' } },
      });
    });

    it('matches an exact Catalog name or Synonym when the model proposed no id, and drops a low-confidence Match', async () => {
      const { cookie } = await signUp();
      reading = {
        actions: [
          // "Parmezan" is Parmesan's Romanian display name.
          model({ spokenText: 'parmezan', fallbackIngredientName: 'Parmezan' }),
          model({
            spokenText: 'something',
            matchedIngredientId: seedId.ingredient('milk'),
            matchConfidence: 0.2,
            fallbackIngredientName: 'Something',
          }),
        ],
        unsupported: [],
      };
      const response = await note(cookie).expect(201);
      const actions = (response.body as { actions: Record<string, unknown>[] })
        .actions;
      expect(actions[0]).toMatchObject({
        ingredient: { id: seedId.ingredient('parmesan') },
      });
      expect(actions[1]).toMatchObject({ ingredient: null, name: 'Something' });
    });

    const post = (cookie: string, path: string, body: object) =>
      request(app.getHttpServer())
        .post(`/api${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send(body);

    it('matches a Family Synonym the model returned as a bare name, for that Family only', async () => {
      const a = await signUp();
      const b = await signUp();
      const word = `Bapple${Date.now()}`;
      await post(a.cookie, '/catalog/family-synonyms?locale=en', {
        name: word,
        ingredientId: seedId.ingredient('eggs'),
      }).expect(201);
      reading = {
        actions: [model({ spokenText: word, fallbackIngredientName: word })],
        unsupported: [],
      };
      const read = async (cookie: string) =>
        (
          (await note(cookie).expect(201)).body as {
            actions: Record<string, unknown>[];
          }
        ).actions[0];
      expect(await read(a.cookie)).toMatchObject({
        ingredient: { id: seedId.ingredient('eggs') },
      });
      expect(await read(b.cookie)).toMatchObject({
        ingredient: null,
        name: word,
      });
    });

    it("does not match another Family's Family Ingredient the model proposed by id", async () => {
      const a = await signUp();
      const b = await signUp();
      const created = (
        await post(a.cookie, '/catalog/family-ingredients?locale=en', {
          name: `Aonly ${Date.now()}`,
          leafCategoryId: seedId.leaf('hard-cheese'),
          defaultUnit: 'g',
        }).expect(201)
      ).body as { id: string };
      reading = {
        actions: [
          model({
            spokenText: 'secret',
            matchedIngredientId: created.id,
            matchConfidence: 0.99,
            fallbackIngredientName: 'Secret',
          }),
        ],
        unsupported: [],
      };
      const actions = (
        (await note(b.cookie).expect(201)).body as {
          actions: Record<string, unknown>[];
        }
      ).actions;
      expect(actions[0]).toMatchObject({ ingredient: null, name: 'Secret' });
    });

    it('refunds the Voice Cap and reports voice.provider_unavailable when reading fails after transcription', async () => {
      const { cookie, memberId } = await signUp();
      aiFailure = new ApiException(502, 'scan.provider_unavailable');
      const response = await note(cookie).expect(502);
      expect((response.body as { code: string }).code).toBe(
        'voice.provider_unavailable',
      );
      expect(await usage(memberId, 'voice')).toBe(0);
    });

    it('does not create a Shopping List just by reading a note', async () => {
      const { cookie, memberId } = await signUp();
      await note(cookie).expect(201);
      const rows = await app
        .get<Database>(DATABASE)
        .select({ id: shoppingLists.id })
        .from(shoppingLists)
        .innerJoin(user, eq(user.familyId, shoppingLists.familyId))
        .where(eq(user.id, memberId));
      expect(rows).toEqual([]);
    });

    it("returns phrases it could not use, and ops not yet supported, as Didn't understand", async () => {
      const { cookie } = await signUp();
      reading = {
        actions: [
          model({ target: 'pantry', op: 'setQuantity', spokenText: 'gone' }),
        ],
        unsupported: ['do a dance'],
      };
      const response = await note(cookie).expect(201);
      const actions = (response.body as { actions: Record<string, unknown>[] })
        .actions;
      expect(actions).toHaveLength(2);
      expect(actions[0]).toMatchObject({
        status: 'notUnderstood',
        text: 'gone',
      });
      expect(actions[1]).toMatchObject({
        status: 'notUnderstood',
        text: 'do a dance',
      });
    });
  });

  // Spec: #459. Until the app shows answers (#460), a Pantry Question in a Voice Note reads as before.
  it("reads a question-only Voice Note as Didn't understand and charges the Voice Cap", async () => {
    const { cookie, memberId } = await signUp();
    reading = {
      actions: [],
      questions: [
        {
          spokenText: 'do we have milk',
          matchedIngredientId: seedId.ingredient('milk'),
          matchConfidence: 0.95,
          fallbackIngredientName: 'Milk',
          spokenName: 'Milk',
        },
      ],
      unsupported: [],
    };
    const response = await note(cookie).expect(201);
    expect((response.body as { actions: object[] }).actions).toMatchObject([
      { status: 'notUnderstood', text: 'do we have milk' },
    ]);
    expect(await usage(memberId, 'voice')).toBe(1);
  });

  describe('applying Voice Actions', () => {
    const add = (fields: Record<string, unknown>, id = 'a1') => ({
      id,
      target: 'shopping',
      op: 'add',
      ingredientId: null,
      name: null,
      quantity: null,
      unit: null,
      ...fields,
    });
    const apply = (cookie: string, actions: object[]) =>
      request(app.getHttpServer())
        .post('/api/voice/apply')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send({ actions, locale: 'en' });
    const list = async (cookie: string) => {
      const groups = (
        (
          await request(app.getHttpServer())
            .get('/api/shopping-list?locale=en')
            .set('origin', TEST_ORIGIN)
            .set('cookie', cookie)
            .expect(200)
        ).body as {
          groups: {
            items: {
              id: string;
              name: string;
              quantity: number | null;
              unit: string | null;
              unmatched: boolean;
            }[];
          }[];
        }
      ).groups;
      return groups.flatMap((g) => g.items);
    };
    const queued = async (name: string) =>
      (
        await app
          .get<Database>(DATABASE)
          .select({ source: unmatchedEntries.source })
          .from(unmatchedEntries)
          .where(eq(unmatchedEntries.rawName, name))
      ).length;

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/voice/apply')
        .set('origin', TEST_ORIGIN)
        .send({ actions: [] })
        .expect(401);
    });

    it('adds matched and Unmatched names to the Shopping List, queueing the Unmatched one, for free', async () => {
      const { cookie, memberId } = await signUp();
      const name = `Quinoa crackers ${Date.now()}`;
      const response = await apply(cookie, [
        add({ ingredientId: seedId.ingredient('eggs') }, 'a1'),
        add(
          {
            ingredientId: seedId.ingredient('milk'),
            quantity: 2,
            unit: 'l',
          },
          'a2',
        ),
        add({ name }, 'a3'),
      ]).expect(201);
      const items = await list(cookie);
      expect(response.body).toEqual({
        applied: [
          {
            actionId: 'a1',
            list: 'shopping',
            rowId: items.find((i) => i.name === 'Eggs')?.id,
            alreadyDone: false,
          },
          {
            actionId: 'a2',
            list: 'shopping',
            rowId: items.find((i) => i.quantity === 2)?.id,
            alreadyDone: false,
          },
          {
            actionId: 'a3',
            list: 'shopping',
            rowId: items.find((i) => i.name === name)?.id,
            alreadyDone: false,
          },
        ],
        skipped: [],
      });
      expect(items).toHaveLength(3);
      expect(items.find((i) => i.name === name)).toMatchObject({
        unmatched: true,
      });
      expect(items.find((i) => i.quantity === 2)).toMatchObject({ unit: 'l' });
      expect(await queued(name)).toBe(1);
      expect(await usage(memberId, 'voice')).toBe(0);
    });

    it('merges into an existing Shopping Item by the usual add rules', async () => {
      const { cookie } = await signUp();
      await apply(cookie, [
        add({
          ingredientId: seedId.ingredient('milk'),
          quantity: 1,
          unit: 'l',
        }),
      ]).expect(201);
      await apply(cookie, [
        add({
          ingredientId: seedId.ingredient('milk'),
          quantity: 2,
          unit: 'l',
        }),
        add(
          {
            ingredientId: seedId.ingredient('milk'),
            quantity: 500,
            unit: 'ml',
          },
          'a2',
        ),
      ]).expect(201);
      const items = await list(cookie);
      expect(items.map((i) => [i.quantity, i.unit])).toEqual([[3.5, 'l']]);
    });

    it('skips what cannot be applied with a reason, and still applies the rest', async () => {
      const { cookie } = await signUp();
      const response = await apply(cookie, [
        add({ ingredientId: seedId.ingredient('eggs') }, 'ok'),
        add({ ingredientId: '00000000-0000-4000-8000-000000000000' }, 'gone'),
        add({}, 'empty'),
        add({ name: 'Bread', quantity: 999_999, unit: 'kg' }, 'big'),
        add({ name: 'Bread', quantity: 999_999, unit: 'kg' }, 'big2'),
        { ...add({ name: 'Bread' }, 'pantry'), target: 'pantry', op: 'check' },
      ]).expect(201);
      expect(response.body).toEqual({
        applied: [
          {
            actionId: 'ok',
            list: 'shopping',
            rowId: expect.any(String) as string,
            alreadyDone: false,
          },
          {
            actionId: 'big',
            list: 'shopping',
            rowId: expect.any(String) as string,
            alreadyDone: false,
          },
        ],
        skipped: [
          { id: 'gone', reason: 'shopping.ingredient_not_found' },
          { id: 'empty', reason: 'voice.invalid_action' },
          { id: 'big2', reason: 'shopping.quantity_too_large' },
          { id: 'pantry', reason: 'voice.not_supported' },
        ],
      });
      expect(await list(cookie)).toHaveLength(2);
    });

    it("cannot add another Family's Family Ingredient", async () => {
      const a = await signUp();
      const b = await signUp();
      const created = (
        await request(app.getHttpServer())
          .post('/api/catalog/family-ingredients?locale=en')
          .set('origin', TEST_ORIGIN)
          .set('cookie', a.cookie)
          .send({
            name: `Aonly ${Date.now()}`,
            leafCategoryId: seedId.leaf('hard-cheese'),
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as { id: string };
      const response = await apply(b.cookie, [
        add({ ingredientId: created.id }, 'theirs'),
      ]).expect(201);
      expect(response.body).toEqual({
        applied: [],
        skipped: [{ id: 'theirs', reason: 'shopping.ingredient_not_found' }],
      });
      expect(await list(b.cookie)).toEqual([]);
      expect(await list(a.cookie)).toEqual([]);
    });

    it("only touches the Member's own Family's list", async () => {
      const a = await signUp();
      const b = await signUp();
      await apply(b.cookie, [
        add({ ingredientId: seedId.ingredient('eggs') }),
      ]).expect(201);
      expect(await list(a.cookie)).toEqual([]);
      expect(await list(b.cookie)).toHaveLength(1);
    });
  });
});
