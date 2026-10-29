import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq } from 'drizzle-orm';
import request from 'supertest';
import { AssistantTokenService } from '../src/assistant-tokens/assistant-token.service';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { ApiException } from '../src/common/api-exception';
import { scanUsage, user } from '../src/database/schema';
import type { PageFetcher } from '../src/page-fetch/page-fetcher';
import { client, signUp } from './support/admin-session';
import { setBalance } from './support/credits';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec #688 / #692: every AI read but the Scan spends Credits through Paid Reads, over HTTP. The balance is read
// through GET /api/credits, never from ledger rows.
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
const linkReading = (recipeFound = true) => ({
  recipeFound,
  sourceLanguage: 'en',
  title: 'Pancakes',
  servings: null,
  prepMinutes: 10,
  cookMinutes: 15,
  tagIndexes: [],
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
});
const voiceAction = {
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
};
const PAGE = `<html><head><script type="application/ld+json">${JSON.stringify({
  '@type': 'Recipe',
  name: 'Pancakes',
  recipeIngredient: ['2 cups flour'],
})}</script></head><body>x</body></html>`;

describe('Every AI read spends Credits (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let tokens: AssistantTokenService;
  let counter = 0;
  const stamp = Date.now();
  let aiCalls = 0;
  let aiData: () => unknown;
  let aiFails: boolean;
  let transcript: string;
  let transcribeCalls = 0;
  const fetched: string[] = [];
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
      fetchPage: (url) => {
        fetched.push(url);
        return Promise.resolve({ finalUrl: url, html: PAGE });
      },
    };
    app = await createTestApp(
      [],
      {
        generate: () => {
          aiCalls++;
          return aiFails
            ? Promise.reject(new ApiException(502, 'scan.provider_unavailable'))
            : Promise.resolve({ data: aiData(), requestId: 'req' });
        },
      },
      undefined,
      undefined,
      {
        isConfigured: () => true,
        transcribe: () => {
          transcribeCalls++;
          return Promise.resolve({ text: transcript });
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
    aiCalls = 0;
    transcribeCalls = 0;
    aiFails = false;
    transcript = 'add milk';
    aiData = () => ({
      spokenLanguage: null,
      actions: [voiceAction],
      unsupported: [],
    });
    fetched.length = 0;
  });

  async function member(balance = 100) {
    const n = ++counter;
    const email = `credits-reads-${stamp}-${n}@example.com`;
    const cookie = await signUp(app, email, `Reads ${n}`);
    const [row] = await database
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email));
    if (balance < 100) await setBalance(app, row.id, balance);
    return { id: row.id, email, cookie };
  }
  const balanceOf = async (cookie: string) =>
    (
      (await client(app, cookie, '/api/credits').get('').expect(200)).body as {
        balance: number;
      }
    ).balance;
  const capCount = async (
    memberId: string,
    kind: 'voice' | 'assistant' | 'link' | 'guidance',
  ) =>
    (
      await database
        .select({ count: scanUsage.count })
        .from(scanUsage)
        .where(and(eq(scanUsage.memberId, memberId), eq(scanUsage.kind, kind)))
    ).reduce((sum, row) => sum + row.count, 0);
  const code = (res: { body: unknown }) => (res.body as { code: string }).code;

  const voice = (cookie: string) =>
    request(app.getHttpServer())
      .post('/api/voice')
      .set('origin', 'http://localhost:5173')
      .set('cookie', cookie)
      .field('spokenLanguage', 'en')
      .field('locale', 'en')
      .field('defaultTarget', 'shopping')
      .field('today', '2026-10-16')
      .field('durationMs', '3000')
      .attach('audio', Buffer.from('a'), {
        filename: 'n.webm',
        contentType: 'audio/webm',
      });
  const assistant = (secret: string) =>
    request(app.getHttpServer())
      .post('/api/assistant/requests')
      .set('authorization', `Bearer ${secret}`)
      .send({ text: 'add milk' });
  const recipes = (cookie: string) => client(app, cookie, '/api/recipes');
  const link = (cookie: string, body: object) =>
    recipes(cookie).post('/from-link', body);

  describe('Voice Note', () => {
    it('costs 1 Credit for the whole read, transcription and reading together', async () => {
      const ana = await member();
      await voice(ana.cookie).expect(201);
      expect(aiCalls).toBe(1);
      expect(transcribeCalls).toBe(1);
      expect(await balanceOf(ana.cookie)).toBe(99);
    });

    it('costs nothing when nothing was heard, or the transcript reads into nothing, or the provider fails', async () => {
      const ana = await member();
      transcript = '  ';
      expect(code(await voice(ana.cookie).expect(422))).toBe(
        'voice.nothing_heard',
      );
      transcript = 'thank you';
      aiData = () => ({ spokenLanguage: null, actions: [], unsupported: [] });
      expect(code(await voice(ana.cookie).expect(422))).toBe(
        'voice.nothing_heard',
      );
      aiFails = true;
      await voice(ana.cookie).expect(502);
      expect(await balanceOf(ana.cookie)).toBe(100);
      expect(await capCount(ana.id, 'voice')).toBe(0);
    });

    it('is refused at 0 Credits before any provider call, leaving the Cap untouched', async () => {
      const ana = await member(0);
      const res = await voice(ana.cookie).expect(402);
      expect(code(res)).toBe('credits.insufficient');
      expect(res.body).toMatchObject({ params: { price: 1, balance: 0 } });
      expect(transcribeCalls).toBe(0);
      expect(aiCalls).toBe(0);
      expect(await capCount(ana.id, 'voice')).toBe(0);
    });
  });

  describe('Assistant Request', () => {
    const withToken = async (balance = 100) => {
      const ana = await member(balance);
      const { secret } = await tokens.create(ana.id, 'Phone');
      return { ...ana, secret };
    };

    it('costs 1 Credit and reuses the Voice reading without a second charge', async () => {
      const ana = await withToken();
      await assistant(ana.secret).expect(200);
      expect(aiCalls).toBe(1);
      expect(await balanceOf(ana.cookie)).toBe(99);
    });

    it('costs nothing with zero outcomes, or when the provider fails', async () => {
      const ana = await withToken();
      aiData = () => ({ spokenLanguage: null, actions: [], unsupported: [] });
      await assistant(ana.secret).expect(200);
      aiFails = true;
      await assistant(ana.secret).expect(502);
      expect(await balanceOf(ana.cookie)).toBe(100);
    });

    it.each([
      [
        'en',
        'Your Family has run out of Credits. Ask for more to use the assistant.',
      ],
      [
        'ro',
        'Familia ta a rămas fără Credite. Cere mai multe ca să folosești asistentul.',
      ],
      [
        'da',
        'Jeres familie har ingen kreditter tilbage. Bed om flere for at bruge assistenten.',
      ],
    ])(
      'speaks one sentence in %s when out of Credits, and applies nothing',
      async (locale, sentence) => {
        const ana = await withToken(0);
        await database.update(user).set({ locale }).where(eq(user.id, ana.id));
        const res = await assistant(ana.secret).expect(402);
        expect(res.body).toEqual({ outcomes: [], speech: sentence });
        expect(aiCalls).toBe(0);
        expect(await capCount(ana.id, 'assistant')).toBe(0);
        const list = await client(app, ana.cookie, '/api/shopping-list').get(
          '?locale=en',
        );
        expect(JSON.stringify(list.body)).not.toContain('Milk');
      },
    );
  });

  describe('Suggest Guidance', () => {
    const suggest = (cookie: string) =>
      recipes(cookie).post('/suggest-guidance', guidanceRequest);
    const proposal = (note: string | null) => () => ({
      nutritionNote: note,
      pairings: null,
      eatingMoments: null,
    });

    it('costs 1 Credit', async () => {
      const ana = await member();
      aiData = proposal('Filling and rich in carbs.');
      await suggest(ana.cookie).expect(200);
      expect(await balanceOf(ana.cookie)).toBe(99);
    });

    it('costs nothing without a usable suggestion, or when the provider fails', async () => {
      const ana = await member();
      aiData = proposal(null);
      await suggest(ana.cookie).expect(200);
      aiFails = true;
      await suggest(ana.cookie).expect(502);
      expect(await balanceOf(ana.cookie)).toBe(100);
    });

    it('is refused at 0 Credits before any provider call, leaving the Cap untouched', async () => {
      const ana = await member(0);
      const res = await suggest(ana.cookie).expect(402);
      expect(code(res)).toBe('credits.insufficient');
      expect(aiCalls).toBe(0);
      expect(await capCount(ana.id, 'guidance')).toBe(0);
    });

    it('costs an Admin nothing for a Catalog Recipe, even at 0 Credits', async () => {
      const ana = await member(0);
      await promoteToAdmin(database, ana.email);
      aiData = proposal('Filling and rich in carbs.');
      await client(app, ana.cookie, '/api/admin/recipes')
        .post('/suggest-guidance', guidanceRequest)
        .expect(200);
      expect(aiCalls).toBe(1);
      expect(await balanceOf(ana.cookie)).toBe(0);
    });
  });

  describe('Recipe from Link', () => {
    it('costs 2 Credits from a web page', async () => {
      const ana = await member();
      aiData = () => linkReading();
      await link(ana.cookie, { url: 'https://example.com/a' }).expect(200);
      expect(await balanceOf(ana.cookie)).toBe(98);
    });

    it('costs 1 Credit from pasted text', async () => {
      const ana = await member();
      aiData = () => linkReading();
      await link(ana.cookie, { text: 'Pancakes: flour' }).expect(200);
      expect(await balanceOf(ana.cookie)).toBe(99);
    });

    it('costs nothing when the page has no recipe, or the provider fails', async () => {
      const ana = await member();
      aiData = () => linkReading(false);
      expect(
        code(
          await link(ana.cookie, { url: 'https://example.com/b' }).expect(422),
        ),
      ).toBe('link.no_recipe');
      expect(
        code(await link(ana.cookie, { text: 'No recipe here' }).expect(422)),
      ).toBe('link.no_recipe');
      aiFails = true;
      await link(ana.cookie, { text: 'Soup' }).expect(502);
      expect(await balanceOf(ana.cookie)).toBe(100);
    });

    it('costs nothing for a link already in the Recipes', async () => {
      const ana = await member();
      await recipes(ana.cookie)
        .post('', {
          title: `Dup ${stamp}`,
          servings: 2,
          locale: 'en',
          parentId: null,
          lines: [{ ingredientId: flour, quantity: 50, unit: 'g' }],
          steps: [{ text: 'Whisk' }],
          sourceLink: 'https://example.com/dup',
        })
        .expect(201);
      const res = await link(ana.cookie, {
        url: 'https://example.com/dup',
      }).expect(200);
      expect(res.body).toMatchObject({ kind: 'duplicate' });
      expect(fetched).toEqual([]);
      expect(aiCalls).toBe(0);
      expect(await balanceOf(ana.cookie)).toBe(100);
    });

    it('at a balance of 1 refuses a web page before the fetch, and lets pasted text go ahead', async () => {
      const ana = await member(1);
      const refused = await link(ana.cookie, {
        url: 'https://example.com/c',
      }).expect(402);
      expect(code(refused)).toBe('credits.insufficient');
      expect(refused.body).toMatchObject({ params: { price: 2, balance: 1 } });
      expect(fetched).toEqual([]);
      expect(aiCalls).toBe(0);
      expect(await capCount(ana.id, 'link')).toBe(0);
      aiData = () => linkReading();
      await link(ana.cookie, { text: 'Pancakes: flour' }).expect(200);
      expect(await balanceOf(ana.cookie)).toBe(0);
    });

    it('at 0 Credits refuses pasted text too, without a provider call', async () => {
      const ana = await member(0);
      expect(code(await link(ana.cookie, { text: 'Soup' }).expect(402))).toBe(
        'credits.insufficient',
      );
      expect(aiCalls).toBe(0);
      expect(await capCount(ana.id, 'link')).toBe(0);
    });
  });
});
