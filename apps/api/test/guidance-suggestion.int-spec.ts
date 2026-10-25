import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { count, eq } from 'drizzle-orm';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { StructuredOutputAiError } from '../src/ai/structured-output-ai.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  recipeEatingMoments,
  recipeIngredientLines,
  recipePairings,
  recipes,
} from '../src/database/schema';
import type { GuidanceSuggestion } from '../src/recipes/guidance-suggestion.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(30_000);

const flour = seedId.ingredient('flour');

const recipe = (overrides: Record<string, unknown> = {}) => ({
  title: 'Pancakes 8841',
  servings: 4,
  lines: [
    { ingredientId: flour, quantity: 250, unit: 'g' },
    { ingredientId: null, rawName: 'grandma spice' },
  ],
  steps: [{ text: 'Whisk everything.' }, { text: 'Fry each side.' }],
  ...overrides,
});
const emptyGuidance = { nutritionNote: null, pairings: [], eatingMoments: [] };
const request = (guidance: object = emptyGuidance, extra: object = {}) => ({
  recipe: recipe(),
  guidance,
  ...extra,
});

describe('Suggest Guidance (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let member: ReturnType<typeof client>;
  let settings: ReturnType<typeof client>;
  const prompts: StructuredOutputRequest[] = [];
  let answer: () => Promise<{ data: unknown; requestId: string | null }>;
  const stamp = Date.now();
  let memberCount = 0;

  const respondWith = (data: unknown) => {
    answer = () => Promise.resolve({ data, requestId: 'fake-request' });
  };
  const suggest = (body: object, who = member) =>
    who.post('/suggest-guidance', body);
  const rowCounts = async () =>
    Promise.all(
      [recipes, recipeIngredientLines, recipePairings, recipeEatingMoments].map(
        async (table) =>
          (await database.select({ n: count() }).from(table))[0].n,
      ),
    );

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input) => {
        prompts.push(input);
        return answer();
      },
    });
    database = app.get<Database>(DATABASE);
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(async () => {
    const cookie = await signUp(
      app,
      `guidance-${stamp}-${++memberCount}@example.com`,
      'G',
    );
    member = client(app, cookie, '/api/recipes');
    settings = client(app, cookie, '/api/settings');
    prompts.length = 0;
    respondWith({
      nutritionNote: 'Filling and rich in carbs. Light on fibre.',
    });
  });

  it('requires authentication', async () => {
    await client(app, '', '/api/recipes')
      .post('/suggest-guidance', request())
      .expect(401);
  });

  it('proposes a Nutrition Note for an empty one and writes nothing', async () => {
    const before = await rowCounts();
    const res = await suggest(request()).expect(200);

    expect(res.body as GuidanceSuggestion).toEqual({
      guidance: { nutritionNote: 'Filling and rich in carbs. Light on fibre.' },
      noSuggestions: [],
    });
    expect(prompts).toHaveLength(1);
    // The page's current content reaches the model, matched lines by name.
    expect(prompts[0].prompt).toContain('Pancakes 8841');
    expect(prompts[0].prompt).toContain('Flour');
    expect(prompts[0].prompt).toContain('grandma spice');
    expect(prompts[0].prompt).toContain('Fry each side.');
    expect(await rowCounts()).toEqual(before);
  });

  it('leaves the stored Recipe untouched when called with its recipeId', async () => {
    const created = await member
      .post('', {
        title: 'Stored 8841',
        servings: 2,
        locale: 'en',
        parentId: null,
        lines: [{ ingredientId: flour, quantity: 50, unit: 'g' }],
        steps: [{ text: 'Whisk' }],
      })
      .expect(201);
    const recipeId = (created.body as { id: string }).id;
    const stored = async () => ({
      row: (
        await database.select().from(recipes).where(eq(recipes.id, recipeId))
      )[0],
      counts: await rowCounts(),
    });
    const before = await stored();
    expect(before.row.nutritionNote).toBeNull();

    await suggest(request(emptyGuidance, { recipeId })).expect(200);

    expect(prompts).toHaveLength(1);
    expect(await stored()).toEqual(before);
  });

  it('refuses without an AI call when the Nutrition Note is filled', async () => {
    const res = await suggest(
      request({ ...emptyGuidance, nutritionNote: 'Mine.' }),
    ).expect(400);
    expect((res.body as { code: string }).code).toBe(
      'guidance.nothing_to_suggest',
    );
    expect(prompts).toHaveLength(0);
  });

  it('accepts the Guidance of a form with Pairings and Eating Moments, and the id of the Recipe being edited', async () => {
    const res = await suggest(
      request(
        {
          ...emptyGuidance,
          pairings: [{ kind: 'food', label: 'Berries', reason: 'Fresh.' }],
        },
        { recipeId: '3f0c8a5e-6b1d-4c53-9a53-0d4f6f5e9a11' },
      ),
    ).expect(200);
    expect(
      (res.body as GuidanceSuggestion).guidance.nutritionNote,
    ).toBeTruthy();
  });

  it('trims a note over 500 characters', async () => {
    respondWith({ nutritionNote: `  ${'x'.repeat(700)}  ` });
    const res = await suggest(request()).expect(200);
    expect(
      (res.body as GuidanceSuggestion).guidance.nutritionNote,
    ).toHaveLength(500);
  });

  it('reports a field with nothing to propose instead of filling it', async () => {
    respondWith({ nutritionNote: '   ' });
    const res = await suggest(request()).expect(200);
    expect(res.body as GuidanceSuggestion).toEqual({
      guidance: {},
      noSuggestions: ['nutritionNote'],
    });
  });

  it('rejects an invalid Recipe or Guidance body', async () => {
    await suggest({ guidance: emptyGuidance }).expect(400);
    await suggest(request({ nutritionNote: 5 })).expect(400);
    expect(prompts).toHaveLength(0);
  });

  it('fails with a coded error when the answer is unusable, and when the provider fails', async () => {
    respondWith({ nope: true });
    const bad = await suggest(request()).expect(502);
    expect((bad.body as { code: string }).code).toBe('scan.result_invalid');

    answer = () => Promise.reject(new StructuredOutputAiError('failed', null));
    const down = await suggest(request()).expect(502);
    expect((down.body as { code: string }).code).toBe(
      'scan.provider_unavailable',
    );
  });

  it('writes in the language of the Recipe, falling back to the Catalog Language', async () => {
    await settings
      .put('/preferences', { locale: 'en', catalogLanguage: 'ro' })
      .expect(200);
    await suggest(request()).expect(200);
    expect(prompts[0].prompt).toContain('Romanian');
  });
});
