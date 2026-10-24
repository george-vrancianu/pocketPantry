import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { StructuredOutputAiError } from '../src/ai/structured-output-ai.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes } from '../src/database/schema';
import { PageFetchError } from '../src/page-fetch/page-fetcher';
import type { PageFetcher } from '../src/page-fetch/page-fetcher';
import type { RecipeFromLink } from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(30_000);

const code = (res: { body: unknown }) => (res.body as { code: string }).code;
const flour = seedId.ingredient('flour');
const milk = seedId.ingredient('milk');
const mediterranean = seedId.cuisine('mediterranean');

const jsonLdPage = (recipe: object, wrap: (r: object) => object = (r) => r) =>
  `<html><head><script type="application/ld+json">${JSON.stringify(wrap(recipe))}</script></head><body>x</body></html>`;

const PANCAKES = {
  '@type': 'Recipe',
  name: 'Fluffy pancakes',
  recipeIngredient: ['2 cups flour', '1 cup milk'],
};

const reading = (overrides: Record<string, unknown> = {}) => ({
  recipeFound: true,
  title: 'Pancakes',
  servings: null,
  prepMinutes: 10,
  cookMinutes: 15,
  cuisineId: mediterranean,
  methodId: null,
  steps: [
    { text: 'Whisk everything.', timerMinutes: null },
    { text: 'Fry each side.', timerMinutes: 2 },
  ],
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
    {
      nameAsWritten: 'grandma spice',
      ingredientId: null,
      matchConfidence: 0,
      quantity: null,
      unit: null,
      originalAmount: 'a pinch',
      preparation: 'ground',
      optional: true,
    },
  ],
  ...overrides,
});

describe('Recipe from Link (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let member: ReturnType<typeof client>;
  let familyBMember: ReturnType<typeof client>;
  let cookieB: string;
  const stamp = Date.now();
  const prompts: StructuredOutputRequest[] = [];
  let answer: () => Promise<{ data: unknown; requestId: string | null }>;
  let page: () => Promise<{ finalUrl: string; html: string }>;
  const fetched: string[] = [];

  const respondWith = (data: unknown) => {
    answer = () => Promise.resolve({ data, requestId: 'fake-request' });
  };
  const serve = (html: string) => {
    page = () => Promise.resolve({ finalUrl: 'https://example.com/', html });
  };
  const read = (url: string, who = member) => who.post('/from-link', { url });

  beforeAll(async () => {
    const pageFetcher: PageFetcher = {
      fetchPage: (url) => {
        fetched.push(url);
        return page();
      },
    };
    app = await createTestApp(
      [],
      {
        generate: (input) => {
          prompts.push(input);
          return answer();
        },
      },
      undefined,
      undefined,
      undefined,
      pageFetcher,
    );
    database = app.get<Database>(DATABASE);
    member = client(
      app,
      await signUp(app, `link-a-${stamp}@example.com`, 'A'),
      '/api/recipes',
    );
    cookieB = await signUp(app, `link-b-${stamp}@example.com`, 'B');
    familyBMember = client(app, cookieB, '/api/recipes');
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    prompts.length = 0;
    fetched.length = 0;
    serve(jsonLdPage(PANCAKES));
    respondWith(reading());
  });

  it('requires authentication', async () => {
    await client(app, '', '/api/recipes')
      .post('/from-link', { url: 'https://example.com/' })
      .expect(401);
  });

  it('turns a JSON-LD page into a draft with matched and Unmatched lines, converted amounts and Steps', async () => {
    const res = await read('https://Example.com/pancakes#top').expect(200);
    const body = res.body as RecipeFromLink;

    expect(fetched).toEqual(['https://example.com/pancakes']);
    expect(body).toMatchObject({
      kind: 'draft',
      sourceLink: 'https://example.com/pancakes',
      closestBases: [],
    });
    expect(body.draft).toMatchObject({
      title: 'Pancakes',
      servings: null,
      prepMinutes: 10,
      cookMinutes: 15,
      cuisineId: mediterranean,
      methodId: null,
      tips: [],
      guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
      steps: [
        { text: 'Whisk everything.', timerSeconds: null },
        { text: 'Fry each side.', timerSeconds: 120 },
      ],
    });
    expect(body.draft.lines).toEqual([
      {
        ingredientId: flour,
        rawName: null,
        ingredientName: 'Flour',
        quantity: 250,
        unit: 'g',
        optional: false,
        note: '2 cups',
      },
      {
        ingredientId: null,
        rawName: 'grandma spice',
        ingredientName: 'grandma spice',
        quantity: null,
        unit: null,
        optional: true,
        note: 'a pinch, ground',
      },
    ]);
  });

  it('finds the Recipe inside @graph and hands the JSON-LD to the model', async () => {
    serve(
      jsonLdPage({ ...PANCAKES, name: 'Graph Pancakes 7731' }, (r) => ({
        '@context': 'https://schema.org',
        '@graph': [{ '@type': 'WebSite' }, r],
      })),
    );
    await read('https://example.com/graph').expect(200);
    expect(prompts).toHaveLength(1);
    expect(prompts[0].prompt).toContain('Graph Pancakes 7731');
    expect(prompts[0].prompt).toContain('2 cups flour');
    expect(prompts[0].prompt).toContain(flour);
  });

  it('asks in the Catalog Language of the Member', async () => {
    const cookie = await signUp(app, `link-ro-${stamp}@example.com`, 'RO');
    await client(app, cookie, '/api/settings')
      .put('/preferences', {
        locale: 'en',
        catalogLanguage: 'ro',
        scanLanguage: 'da',
      })
      .expect(200);
    await read(
      'https://example.com/ro',
      client(app, cookie, '/api/recipes'),
    ).expect(200);
    expect(prompts[0].prompt).toContain('Romanian');
    expect(prompts[0].prompt).not.toContain('Danish');
  });

  it('leaves ids outside the Family scope, and low-confidence matches, Unmatched', async () => {
    const ingredients = reading().ingredients;
    respondWith(
      reading({
        ingredients: [
          {
            ...ingredients[0],
            ingredientId: crypto.randomUUID(),
            nameAsWritten: 'mystery',
          },
          {
            ...ingredients[0],
            ingredientId: milk,
            matchConfidence: 0.1,
            nameAsWritten: 'maybe milk',
          },
          {
            ...ingredients[0],
            ingredientId: milk,
            matchConfidence: 0.95,
            nameAsWritten: 'milk',
          },
        ],
      }),
    );
    const { draft } = (await read('https://example.com/scope').expect(200))
      .body as RecipeFromLink;
    expect(draft.lines.map((l) => [l.ingredientId, l.rawName])).toEqual([
      [null, 'mystery'],
      [null, 'maybe milk'],
      [milk, null],
    ]);
  });

  it("matches the Family's own Ingredient but not another Family's", async () => {
    const own = (
      await client(app, cookieB, '/api/catalog')
        .post('/family-ingredients', {
          name: `Zq secret sauce ${stamp}`,
          leafCategoryId: seedId.leaf('hard-cheese'),
          defaultUnit: 'g',
        })
        .expect(201)
    ).body as { id: string };
    respondWith(
      reading({
        ingredients: [{ ...reading().ingredients[0], ingredientId: own.id }],
      }),
    );
    const mine = (
      await read('https://example.com/own', familyBMember).expect(200)
    ).body as RecipeFromLink;
    expect(mine.draft.lines[0]).toMatchObject({
      ingredientId: own.id,
      rawName: null,
    });
    // The other Family's prompt does not list it, and its answer cannot use it.
    const theirs = (await read('https://example.com/own').expect(200))
      .body as RecipeFromLink;
    expect(theirs.draft.lines[0]).toMatchObject({ ingredientId: null });
    expect(prompts[1].prompt).not.toContain(own.id);
    expect(prompts[0].prompt).toContain(own.id);
  });

  it('drops unknown Cuisine and Method ids and zero quantities', async () => {
    const line = reading().ingredients[0];
    respondWith(
      reading({
        cuisineId: crypto.randomUUID(),
        methodId: crypto.randomUUID(),
        servings: 4,
        ingredients: [
          { ...line, quantity: 0 },
          { ...line, quantity: -3, nameAsWritten: 'neg' },
        ],
      }),
    );
    const { draft } = (await read('https://example.com/drop').expect(200))
      .body as RecipeFromLink;
    expect(draft).toMatchObject({
      cuisineId: null,
      methodId: null,
      servings: 4,
    });
    expect(draft.lines.map((l) => [l.quantity, l.unit])).toEqual([
      [null, null],
      [null, null],
    ]);
  });

  describe('errors', () => {
    it.each([['ftp://example.com/a'], ['javascript:alert(1)'], ['not a link']])(
      'link.invalid for %s, without fetching',
      async (url) => {
        const res = await read(url).expect(400);
        expect(code(res)).toBe('link.invalid');
        expect(fetched).toEqual([]);
        expect(prompts).toEqual([]);
      },
    );

    it('link.invalid when the fetcher refuses the address', async () => {
      page = () => Promise.reject(new PageFetchError('invalid', 'refused'));
      const res = await read('https://example.com/private').expect(400);
      expect(code(res)).toBe('link.invalid');
      expect(prompts).toEqual([]);
    });

    it('link.unreadable when the fetch fails', async () => {
      page = () => Promise.reject(new PageFetchError('unreadable', 'timeout'));
      const res = await read('https://example.com/slow').expect(422);
      expect(code(res)).toBe('link.unreadable');
      expect(prompts).toEqual([]);
    });

    it('link.no_recipe without a JSON-LD Recipe, and no AI call', async () => {
      serve('<html><body>Just a blog</body></html>');
      const res = await read('https://example.com/blog').expect(422);
      expect(code(res)).toBe('link.no_recipe');
      expect(prompts).toEqual([]);
    });

    it('link.no_recipe when the AI finds none', async () => {
      respondWith(reading({ recipeFound: false }));
      const res = await read('https://example.com/odd').expect(422);
      expect(code(res)).toBe('link.no_recipe');
      expect(prompts).toHaveLength(1);
    });

    it('maps a provider failure like the Scans do', async () => {
      answer = () =>
        Promise.reject(new StructuredOutputAiError('failed', null));
      const res = await read('https://example.com/down').expect(502);
      expect(code(res)).toBe('scan.provider_unavailable');
    });

    it('scan.result_invalid when the answer is not a reading', async () => {
      respondWith({ nope: true });
      const res = await read('https://example.com/bad').expect(502);
      expect(code(res)).toBe('scan.result_invalid');
    });
  });

  it('saves nothing', async () => {
    const before = await database
      .select()
      .from(recipes)
      .where(eq(recipes.title, 'Pancakes'));
    await read('https://example.com/nosave').expect(200);
    expect(
      await database
        .select()
        .from(recipes)
        .where(eq(recipes.title, 'Pancakes')),
    ).toHaveLength(before.length);
  });
});
