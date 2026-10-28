import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { asc, eq, inArray } from 'drizzle-orm';
import request from 'supertest';
import type { AiTokenUsage } from '../src/ai/structured-output-ai.service';
import { AssistantTokenService } from '../src/assistant-tokens/assistant-token.service';
import { ApiException } from '../src/common/api-exception';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { usageRecord, user } from '../src/database/schema';
import type { PageFetcher } from '../src/page-fetch/page-fetcher';
import { PRICES, type CallUsage } from '../src/usage/prices';
import { client, signUp } from './support/admin-session';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec #688 / #696: every call to an AI provider leaves a Usage Record. Records have no endpoint, so they are read
// from the database, as the Cap's usage table is.
const IMAGE = 'data:image/jpeg;base64,YQ==';
const flour = seedId.ingredient('flour');
const milk = seedId.ingredient('milk');
const emptyGuidance = { nutritionNote: null, pairings: [], eatingMoments: [] };
const guidanceRequest = {
  recipe: {
    title: 'Pancakes',
    servings: 4,
    lines: [{ ingredientId: flour, quantity: 250, unit: 'g' }],
    steps: [{ text: 'Whisk everything.' }],
  },
  guidance: emptyGuidance,
};
const proposal = {
  nutritionNote: 'Filling and rich in carbs.',
  pairings: null,
  eatingMoments: null,
};
const linkReading = {
  recipeFound: true,
  sourceLanguage: 'en',
  title: 'Pancakes',
  servings: null,
  prepMinutes: 10,
  cookMinutes: 15,
  cuisineId: null,
  methodId: null,
  steps: [{ text: 'Whisk everything.', timerMinutes: null }],
  ingredients: [
    {
      nameAsWritten: 'flour',
      ingredientId: flour,
      matchConfidence: 0.9,
      quantity: 250,
      unit: 'g',
      originalAmount: '2 cups',
      preparation: null,
      optional: false,
    },
  ],
};
const voiceReading = {
  spokenLanguage: null,
  unsupported: [],
  actions: [
    {
      target: 'shopping',
      op: 'add',
      spokenText: 'milk',
      matchedIngredientId: milk,
      matchConfidence: 0.95,
      fallbackIngredientName: 'Milk',
      spokenName: 'Milk',
      quantity: null,
      unit: null,
      scope: null,
      expiresOn: null,
      noExpiry: false,
      location: null,
    },
  ],
};
const parmesan = {
  productName: 'Grana Padano 200g',
  productType: 'Hard cheese',
  matchedIngredientId: seedId.ingredient('parmesan'),
  matchedCategory: 'Hard cheese',
  matchConfidence: 0.92,
  fallbackIngredientName: 'Grana Padano',
  expiryDate: '2026-12-24',
  expiryText: 'BBE 24/12/26',
  netQuantity: null,
  netUnit: null,
  confidence: 0.95,
};
const receiptLine = {
  lineNumber: 1,
  sourceText: 'LAPTE UHT 1L',
  lineType: 'product',
  includeInPantry: true,
  exclusionReason: null,
  productName: 'Lapte UHT',
  productType: 'Lactate',
  matchedIngredientId: milk,
  matchedCategory: null,
  matchConfidence: 0.93,
  fallbackIngredientName: 'Lapte',
  matchExplanation: 'Milk.',
  quantityType: 'package_size',
  purchasedCount: 2,
  quantityPerItem: 1,
  quantityUnit: 'l',
  confidence: 0.95,
};
const PAGE = `<html><head><script type="application/ld+json">${JSON.stringify({
  '@type': 'Recipe',
  name: 'Pancakes',
  recipeIngredient: ['2 cups flour'],
})}</script></head><body>x</body></html>`;

type Answer = {
  data: unknown;
  usage?: AiTokenUsage | undefined;
  model?: string;
};

describe('Usage Records (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let tokens: AssistantTokenService;
  let counter = 0;
  let calls = 0;
  const stamp = Date.now();
  /** What the fake provider answers, one entry per call; a Promise-rejecting entry is a failed call. */
  let answers: Array<Answer | Error>;
  let transcript: { text: string; usage?: CallUsage | undefined } | Error;
  const saved = {
    key: process.env.AI_API_KEY,
    provider: process.env.AI_PROVIDER,
    baseUrl: process.env.AI_BASE_URL,
  };

  beforeAll(async () => {
    // The Assistant answers 503 without a text model key; AppModule reads the env on import.
    process.env.AI_API_KEY = 'test-key';
    process.env.AI_PROVIDER = 'openai';
    delete process.env.AI_BASE_URL;
    const supportPath = './support/create-test-app';
    const { createTestApp } = (await import(
      supportPath
    )) as typeof import('./support/create-test-app');
    const pageFetcher: PageFetcher = {
      fetchPage: (url) => Promise.resolve({ finalUrl: url, html: PAGE }),
    };
    app = await createTestApp(
      [],
      {
        generate: () => {
          const answer = answers.shift();
          if (!answer) throw new Error('No fake answer queued');
          const id = `req-${++calls}`;
          if (answer instanceof Error) {
            return Promise.reject(
              Object.assign(answer, { requestId: `${id}-failed` }),
            );
          }
          return Promise.resolve({ requestId: id, ...answer });
        },
      },
      undefined,
      undefined,
      {
        isConfigured: () => true,
        transcribe: () => {
          if (transcript instanceof Error) return Promise.reject(transcript);
          return Promise.resolve({
            requestId: `t-${++calls}`,
            model: 'whisper-1',
            ...transcript,
          });
        },
      },
      pageFetcher,
    );
    database = app.get<Database>(DATABASE);
    tokens = app.get(AssistantTokenService);
    await seedCatalog(database);
  });
  afterAll(async () => {
    for (const [name, value] of [
      ['AI_API_KEY', saved.key],
      ['AI_PROVIDER', saved.provider],
      ['AI_BASE_URL', saved.baseUrl],
    ] as const) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await app.close();
  });
  beforeEach(() => {
    answers = [];
    transcript = { text: 'add milk', usage: { audioSeconds: 3 } };
  });

  async function member() {
    const n = ++counter;
    const email = `usage-records-${stamp}-${n}@example.com`;
    const cookie = await signUp(app, email, `Usage ${n}`);
    const [row] = await database
      .select({ id: user.id, familyId: user.familyId })
      .from(user)
      .where(eq(user.email, email));
    return { ...row, email, cookie };
  }
  const rowsOf = (memberId: string) =>
    database
      .select()
      .from(usageRecord)
      .where(eq(usageRecord.memberId, memberId))
      .orderBy(asc(usageRecord.createdAt), asc(usageRecord.step));
  const usage = {
    inputTokens: 1000,
    outputTokens: 200,
    cachedInputTokens: 400,
    reasoningTokens: 50,
  };

  const voice = (cookie: string, extra: Record<string, string> = {}) => {
    const req = request(app.getHttpServer())
      .post('/api/voice')
      .set('origin', 'http://localhost:5173')
      .set('cookie', cookie)
      .field('spokenLanguage', 'en')
      .field('locale', 'en')
      .field('defaultTarget', 'shopping')
      .field('today', '2026-10-16')
      .field('durationMs', extra.durationMs ?? '3000');
    return req.attach('audio', Buffer.from('a'), {
      filename: 'n.webm',
      contentType: 'audio/webm',
    });
  };
  const post = (cookie: string, path: string, body: object) =>
    request(app.getHttpServer())
      .post(`/api/${path}`)
      .query({ locale: 'en' })
      .set('origin', 'http://localhost:5173')
      .set('cookie', cookie)
      .send(body);
  const recipes = (cookie: string) => client(app, cookie, '/api/recipes');

  it('writes one row for a Scan, with the kind, Member, Family, model, tokens, request id and frozen cost', async () => {
    const ana = await member();
    answers = [{ data: parmesan, model: 'gpt-6-luna', usage }];
    await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(201);
    const rows = await rowsOf(ana.id);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      kind: 'scan',
      step: 'reading',
      memberId: ana.id,
      familyId: ana.familyId,
      model: 'gpt-6-luna',
      inputTokens: 1000,
      outputTokens: 200,
      cachedTokens: 400,
      reasoningTokens: 50,
      audioSeconds: null,
      success: true,
      providerRequestId: expect.stringMatching(/^req-/) as string,
    });
    // (600 * 0.1 + 400 * 0.01 + 200 * 0.5) / 1M
    expect(Number(rows[0].costUsd)).toBeCloseTo(0.000164, 9);
  });

  it('keeps a row cost as it was when the price table later changes', async () => {
    const ana = await member();
    const original = PRICES['gpt-6-luna'];
    answers = [
      { data: parmesan, model: 'gpt-6-luna', usage },
      { data: parmesan, model: 'gpt-6-luna', usage },
    ];
    try {
      await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(
        201,
      );
      PRICES['gpt-6-luna'] = { input: 10, cachedInput: 10, output: 10 };
      await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(
        201,
      );
    } finally {
      PRICES['gpt-6-luna'] = original;
    }
    const [first, second] = await rowsOf(ana.id);
    expect(Number(first.costUsd)).toBeCloseTo(0.000164, 9);
    expect(Number(second.costUsd)).toBeCloseTo(0.012, 9);
  });

  it('writes one row for a Receipt Section', async () => {
    const ana = await member();
    answers = [
      {
        data: {
          merchantName: 'Piata',
          purchaseDate: '2026-09-25',
          lines: [receiptLine],
        },
        usage,
      },
    ];
    await post(ana.cookie, 'scan/receipt', { receiptImage: IMAGE }).expect(201);
    expect(await rowsOf(ana.id)).toMatchObject([
      { kind: 'scan', success: true },
    ]);
  });

  it('writes two rows for a Voice Note: the transcription by audio seconds, then the reading', async () => {
    const ana = await member();
    answers = [{ data: voiceReading, model: 'gpt-5-mini', usage }];
    await voice(ana.cookie).expect(201);
    const rows = await rowsOf(ana.id);
    expect(rows).toHaveLength(2);
    const transcription = rows.find((r) => r.step === 'transcription')!;
    const reading = rows.find((r) => r.step === 'reading')!;
    expect(transcription).toMatchObject({
      kind: 'voice',
      memberId: ana.id,
      familyId: ana.familyId,
      model: 'whisper-1',
      audioSeconds: '3.000',
      inputTokens: null,
      success: true,
      providerRequestId: expect.stringMatching(/^t-/) as string,
    });
    expect(Number(transcription.costUsd)).toBeCloseTo(0.0003, 9);
    expect(reading).toMatchObject({
      kind: 'voice',
      model: 'gpt-5-mini',
      inputTokens: 1000,
      success: true,
    });
    expect(reading.costUsd).not.toBeNull();
  });

  it('stores no cost when the provider reports no transcription usage, and ignores the client durationMs', async () => {
    const ana = await member();
    transcript = { text: 'add milk', usage: undefined };
    answers = [{ data: voiceReading, usage }];
    await voice(ana.cookie, { durationMs: '60000' }).expect(201);
    const transcription = (await rowsOf(ana.id)).find(
      (r) => r.step === 'transcription',
    )!;
    expect(transcription).toMatchObject({
      audioSeconds: null,
      inputTokens: null,
      outputTokens: null,
      costUsd: null,
      success: true,
    });
  });

  it('stores no cost for a model with no price, or a reading without reported usage', async () => {
    const ana = await member();
    answers = [
      { data: parmesan, model: 'vendor-model', usage },
      { data: parmesan, usage: undefined },
    ];
    await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(201);
    await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(201);
    const rows = await rowsOf(ana.id);
    expect(rows.map((r) => r.costUsd)).toEqual([null, null]);
    expect(rows[0]).toMatchObject({ model: 'vendor-model', inputTokens: 1000 });
    expect(rows[1]).toMatchObject({ inputTokens: null });
  });

  it('writes a failed row when the transcription fails, and none for a reading that never ran', async () => {
    const ana = await member();
    transcript = new ApiException(502, 'voice.provider_unavailable');
    await voice(ana.cookie).expect(502);
    expect(await rowsOf(ana.id)).toMatchObject([
      {
        kind: 'voice',
        step: 'transcription',
        success: false,
        costUsd: null,
        model: 'gpt-transcribe',
      },
    ]);
  });

  it('writes a failed row for a failed provider call, with the request id the error carries', async () => {
    const ana = await member();
    answers = [new ApiException(502, 'scan.provider_unavailable')];
    await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(502);
    expect(await rowsOf(ana.id)).toMatchObject([
      {
        kind: 'scan',
        success: false,
        costUsd: null,
        inputTokens: null,
        providerRequestId: expect.stringMatching(/-failed$/) as string,
      },
    ]);
  });

  it('writes one row for an Assistant Request, of kind assistant', async () => {
    const ana = await member();
    const { secret } = await tokens.create(ana.id, 'Phone');
    answers = [{ data: voiceReading, usage }];
    await request(app.getHttpServer())
      .post('/api/assistant/requests')
      .set('authorization', `Bearer ${secret}`)
      .send({ text: 'add milk' })
      .expect(200);
    expect(await rowsOf(ana.id)).toMatchObject([
      {
        kind: 'assistant',
        step: 'reading',
        familyId: ana.familyId,
        success: true,
      },
    ]);
  });

  it('writes one row for a link read, from a page and from pasted text', async () => {
    const ana = await member();
    answers = [
      { data: linkReading, usage },
      { data: linkReading, usage },
    ];
    await recipes(ana.cookie)
      .post('/from-link', { url: 'https://example.com/u' })
      .expect(200);
    await recipes(ana.cookie)
      .post('/from-link', { text: 'Pancakes: flour' })
      .expect(200);
    const rows = await rowsOf(ana.id);
    expect(rows.map((r) => r.kind).sort()).toEqual(['link-page', 'link-text']);
  });

  it('writes one row for Suggest Guidance', async () => {
    const ana = await member();
    answers = [{ data: proposal, usage }];
    await recipes(ana.cookie)
      .post('/suggest-guidance', guidanceRequest)
      .expect(200);
    expect(await rowsOf(ana.id)).toMatchObject([
      {
        kind: 'guidance',
        memberId: ana.id,
        familyId: ana.familyId,
        success: true,
      },
    ]);
  });

  it('writes a row for Admin Catalog Suggest Guidance, with no Member or Family, and no Credits charged', async () => {
    const ana = await member();
    await promoteToAdmin(database, ana.email);
    answers = [{ data: proposal, usage }];
    const before = calls;
    await client(app, ana.cookie, '/api/admin/recipes')
      .post('/suggest-guidance', guidanceRequest)
      .expect(200);
    const [row] = await database
      .select()
      .from(usageRecord)
      .where(eq(usageRecord.providerRequestId, `req-${before + 1}`));
    expect(row).toMatchObject({
      kind: 'guidance-admin',
      memberId: null,
      familyId: null,
      success: true,
    });
    const balance = await client(app, ana.cookie, '/api/credits').get('');
    expect((balance.body as { balance: number }).balance).toBe(100);
  });

  it('writes one row per Plate Scan step, the dish step recorded with the Member but not charged', async () => {
    const ana = await member();
    answers = [
      { data: { matches: [{ title: 'Pancakes', confidence: 0.7 }] }, usage },
      {
        data: {
          items: [
            {
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
            },
          ],
        },
        usage,
      },
    ];
    const { token } = (
      await post(ana.cookie, 'scan/plate', { plateImage: IMAGE }).expect(201)
    ).body as { token: string };
    const balanceAfterPhoto = (
      (await client(app, ana.cookie, '/api/credits').get('')).body as {
        balance: number;
      }
    ).balance;
    await post(ana.cookie, 'scan/plate/ingredients', {
      dishTitle: 'Pancakes',
      plateToken: token,
    }).expect(201);
    const rows = await rowsOf(ana.id);
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toMatchObject({
        kind: 'scan',
        memberId: ana.id,
        familyId: ana.familyId,
        success: true,
      });
    }
    // The dish step is part of the one Plate Scan price.
    expect(
      (await client(app, ana.cookie, '/api/credits').get('')).body,
    ).toMatchObject({ balance: balanceAfterPhoto });
  });

  it('keeps the rows, with the Member link cleared, when the Member is deleted', async () => {
    const ana = await member();
    answers = [{ data: parmesan, usage }];
    await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(201);
    const [row] = await rowsOf(ana.id);
    await database.delete(user).where(eq(user.id, ana.id));
    const [kept] = await database
      .select()
      .from(usageRecord)
      .where(eq(usageRecord.id, row.id));
    expect(kept).toMatchObject({
      kind: 'scan',
      memberId: null,
      familyId: ana.familyId,
    });
  });

  it('keeps the rows, with the Family link cleared, when the Family is deleted', async () => {
    const ana = await member();
    answers = [{ data: parmesan, usage }];
    await post(ana.cookie, 'scan/product', { productImage: IMAGE }).expect(201);
    const [row] = await rowsOf(ana.id);
    await client(app, ana.cookie, '/api/family').del('').expect(200);
    const [kept] = await database
      .select()
      .from(usageRecord)
      .where(inArray(usageRecord.id, [row.id]));
    expect(kept).toMatchObject({
      kind: 'scan',
      memberId: ana.id,
      familyId: null,
    });
  });
});
