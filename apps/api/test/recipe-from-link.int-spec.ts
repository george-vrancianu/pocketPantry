import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { StructuredOutputAiError } from '../src/ai/structured-output-ai.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes, scanUsage } from '../src/database/schema';
import { PageFetchError } from '../src/page-fetch/page-fetcher';
import type { PageFetcher } from '../src/page-fetch/page-fetcher';
import type { RecipeFromLink } from '../src/recipes/recipes.schemas';
import { ScanCapService } from '../src/scan/scan-cap.service';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(30_000);

const code = (res: { body: unknown }) => (res.body as { code: string }).code;
const flour = seedId.ingredient('flour');
const milk = seedId.ingredient('milk');
const mediterranean = seedId.cuisine('mediterranean');

const jsonLdPage = (recipe: object, wrap: (r: object) => object = (r) => r) =>
  `<html><head><script type="application/ld+json">${JSON.stringify(wrap(recipe))}</script></head><body>Blog chatter 5521</body></html>`;

const ldScript = (json: string, attributes = 'type="application/ld+json"') =>
  `<script ${attributes}>${json}</script>`;
const htmlPage = (...scripts: string[]) =>
  `<html><head>${scripts.join('')}</head><body>Blog chatter 5521</body></html>`;

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
    cookieB = await signUp(app, `link-b-${stamp}@example.com`, 'B');
    familyBMember = client(app, cookieB, '/api/recipes');
  });
  afterAll(async () => {
    await app.close();
  });
  let memberCount = 0;
  beforeEach(async () => {
    // A fresh Member per test: the Link Cap (2 in the test env) counts every read that reaches the AI.
    member = client(
      app,
      await signUp(app, `link-a-${stamp}-${++memberCount}@example.com`, 'A'),
      '/api/recipes',
    );
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
    expect(prompts[0].prompt).not.toContain('Blog chatter 5521');
  });

  describe('finding the Recipe in the page', () => {
    const promptAfter = async (html: string, path: string) => {
      serve(html);
      await read(`https://example.com/${path}`).expect(200);
      return prompts[0].prompt;
    };

    it('drops bulky keys before the prompt', async () => {
      const prompt = await promptAfter(
        jsonLdPage({
          ...PANCAKES,
          image: 'https://cdn.example.com/IMG-8842.jpg',
          video: { name: 'VIDEO-8843' },
          review: [{ reviewBody: 'REVIEW-8844' }],
          comment: [{ text: 'COMMENT-8845' }],
          aggregateRating: { ratingValue: 'RATING-8846' },
        }),
        'bulky',
      );
      expect(prompt).toContain('Fluffy pancakes');
      for (const gone of ['IMG-8842', 'VIDEO-8843', 'REVIEW-8844']) {
        expect(prompt).not.toContain(gone);
      }
      expect(prompt).not.toContain('COMMENT-8845');
      expect(prompt).not.toContain('RATING-8846');
      expect(prompt).not.toContain('Blog chatter 5521');
    });

    it('also reads the graph form with the image beside it', async () => {
      const prompt = await promptAfter(
        jsonLdPage({ ...PANCAKES, image: 'IMG-9001.jpg' }, (r) => ({
          '@graph': [{ '@type': 'ImageObject' }, r],
        })),
        'graph-image',
      );
      expect(prompt).not.toContain('IMG-9001');
    });

    it.each([
      ['an @type array', { ...PANCAKES, '@type': ['Thing', 'Recipe'] }],
      ['schema:Recipe', { ...PANCAKES, '@type': 'schema:Recipe' }],
      [
        'a full schema.org URL type',
        { ...PANCAKES, '@type': 'https://schema.org/Recipe' },
      ],
    ])('finds a Recipe typed as %s', async (_label, recipe) => {
      const prompt = await promptAfter(jsonLdPage(recipe), 'typed');
      expect(prompt).toContain('Fluffy pancakes');
    });

    it('finds a Recipe in a top-level array of nodes', async () => {
      const prompt = await promptAfter(
        htmlPage(ldScript(JSON.stringify([{ '@type': 'WebSite' }, PANCAKES]))),
        'array',
      );
      expect(prompt).toContain('Fluffy pancakes');
    });

    it('finds a Recipe that is the mainEntity of a WebPage', async () => {
      const prompt = await promptAfter(
        jsonLdPage({ ...PANCAKES, name: 'Main Entity Soup 3310' }, (r) => ({
          '@type': 'WebPage',
          mainEntity: r,
        })),
        'main-entity',
      );
      expect(prompt).toContain('Main Entity Soup 3310');
    });

    it('finds a Recipe in mainEntityOfPage when it is an object', async () => {
      const prompt = await promptAfter(
        jsonLdPage({ ...PANCAKES, name: 'Page Entity Soup 3311' }, (r) => ({
          '@type': 'WebPage',
          mainEntityOfPage: r,
        })),
        'main-entity-of-page',
      );
      expect(prompt).toContain('Page Entity Soup 3311');
    });

    it('skips other scripts and invalid blocks before a valid one, in any attribute order and quoting', async () => {
      const prompt = await promptAfter(
        htmlPage(
          '<script>var a=1</script>',
          ldScript('{oops'),
          ldScript('{"@type":"Article"}'),
          `<script data-x='1' TYPE='application/ld+json' id=a>${JSON.stringify({ ...PANCAKES, name: 'Quoted Soup 4410' })}</script>`,
        ),
        'attributes',
      );
      expect(prompt).toContain('Quoted Soup 4410');
    });

    it('reads an unquoted type attribute and an upper-case tag', async () => {
      const prompt = await promptAfter(
        htmlPage(
          `<SCRIPT type=application/ld+json>${JSON.stringify({ ...PANCAKES, name: 'Unquoted Soup 4411' })}</SCRIPT >`,
        ),
        'unquoted',
      );
      expect(prompt).toContain('Unquoted Soup 4411');
    });
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

  it('keeps quantity and unit together, folds wording into the note, and drops empty Steps', async () => {
    const line = reading().ingredients[0];
    respondWith(
      reading({
        steps: [
          { text: ' Mix. ', timerMinutes: 1.5 },
          { text: '   ', timerMinutes: 3 },
          { text: 'Cook', timerMinutes: 0 },
        ],
        ingredients: [
          { ...line, unit: null, nameAsWritten: 'no unit' },
          { ...line, quantity: null, nameAsWritten: 'no quantity' },
          {
            ...line,
            quantity: null,
            unit: null,
            originalAmount: 'a pinch',
            preparation: null,
            nameAsWritten: 'pinch',
          },
          { ...line, ingredientId: flour, preparation: 'sifted' },
        ],
      }),
    );
    const { draft } = (await read('https://example.com/amounts').expect(200))
      .body as RecipeFromLink;
    expect(draft.lines.map((l) => [l.quantity, l.unit, l.note])).toEqual([
      [null, null, '2 cups'],
      [null, null, '2 cups'],
      [null, null, 'a pinch'],
      [250, 'g', '2 cups, sifted'],
    ]);
    expect(draft.steps).toEqual([
      { text: 'Mix.', timerSeconds: 90 },
      { text: 'Cook', timerSeconds: null },
    ]);
  });

  it('does not fail the read when a confidence is out of range', async () => {
    respondWith(
      reading({
        ingredients: [{ ...reading().ingredients[0], matchConfidence: 1.01 }],
      }),
    );
    const { draft } = (await read('https://example.com/confident').expect(200))
      .body as RecipeFromLink;
    expect(draft.lines[0]).toMatchObject({ ingredientId: flour });
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

    it('link.no_recipe for JSON-LD without a Recipe', async () => {
      serve(jsonLdPage({ '@type': 'Article', name: 'News' }));
      const res = await read('https://example.com/article').expect(422);
      expect(code(res)).toBe('link.no_recipe');
      expect(prompts).toEqual([]);
    });

    it('link.no_recipe quickly for a huge page of unclosed script tags', async () => {
      serve(`<html>${'<script>'.repeat(200_000)}`);
      const started = Date.now();
      const res = await read('https://example.com/unclosed').expect(422);
      expect(Date.now() - started).toBeLessThan(5000);
      expect(code(res)).toBe('link.no_recipe');
      expect(prompts).toEqual([]);
    });

    it('link.invalid for a link over the length limit', async () => {
      const res = await read(`https://example.com/${'a'.repeat(2100)}`).expect(
        400,
      );
      expect(code(res)).toBe('link.invalid');
      expect(fetched).toEqual([]);
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

  describe('the Link Cap', () => {
    // The test env sets LINK_DAILY_CAP to 2 and SCAN_DAILY_CAP to 3.
    const idOf = async (cookie: string) =>
      (
        (await client(app, cookie, '/api/auth').get('/get-session')).body as {
          user: { id: string };
        }
      ).user.id;

    it('counts a read only when the AI is called', async () => {
      await read('https://example.com/one').expect(200);
      await read('https://example.com/two').expect(200);
      expect(prompts).toHaveLength(2);
      const res = await read('https://example.com/three').expect(429);
      expect(code(res)).toBe('link.cap_reached');
      expect(prompts).toHaveLength(2);
    });

    it('answers link.cap_reached with the cap and the next UTC midnight', async () => {
      await read('https://example.com/one').expect(200);
      await read('https://example.com/two').expect(200);
      const res = await read('https://example.com/three').expect(429);
      const body = res.body as {
        code: string;
        params: { cap: number; resetsAt: string };
      };
      expect(body.params.cap).toBe(2);
      const resetsAt = Date.parse(body.params.resetsAt);
      expect(resetsAt).toBeGreaterThan(Date.now());
      expect(resetsAt - Date.now()).toBeLessThanOrEqual(86_400_000);
      expect(new Date(resetsAt).toISOString()).toMatch(/T00:00:00\.000Z$/);
    });

    it('is not touched by invalid links, failed fetches or a page without a recipe', async () => {
      await read('not a link').expect(400);
      page = () => Promise.reject(new PageFetchError('invalid', 'refused'));
      await read('https://example.com/private').expect(400);
      page = () => Promise.reject(new PageFetchError('unreadable', 'timeout'));
      await read('https://example.com/slow').expect(422);
      serve('<html><body>Just a blog</body></html>');
      await read('https://example.com/blog').expect(422);
      serve(jsonLdPage({ '@type': 'Article', name: 'News' }));
      await read('https://example.com/article').expect(422);
      expect(prompts).toEqual([]);

      // The whole cap is still there.
      serve(jsonLdPage(PANCAKES));
      await read('https://example.com/one').expect(200);
      await read('https://example.com/two').expect(200);
      await read('https://example.com/three').expect(429);
    });

    it('counts a read the AI answered with no recipe, and hands back one the provider failed', async () => {
      respondWith(reading({ recipeFound: false }));
      await read('https://example.com/odd').expect(422);
      answer = () =>
        Promise.reject(new StructuredOutputAiError('failed', null));
      await read('https://example.com/down').expect(502);
      respondWith({ nope: true });
      await read('https://example.com/bad').expect(502);

      // Only the no-recipe read stayed counted: one use is left.
      respondWith(reading());
      await read('https://example.com/ok').expect(200);
      const res = await read('https://example.com/over').expect(429);
      expect(code(res)).toBe('link.cap_reached');
    });

    it('is separate from the Scan Cap', async () => {
      const caps = app.get(ScanCapService);
      const linkCookie = await signUp(
        app,
        `link-full-${stamp}@example.com`,
        'L',
      );
      const linkFull = client(app, linkCookie, '/api/recipes');
      const scanCookie = await signUp(
        app,
        `link-scan-${stamp}@example.com`,
        'S',
      );
      const scanFull = client(app, scanCookie, '/api/recipes');

      // A full Link Cap leaves every Scan available.
      await read('https://example.com/one', linkFull).expect(200);
      await read('https://example.com/two', linkFull).expect(200);
      await read('https://example.com/three', linkFull).expect(429);
      const linkId = await idOf(linkCookie);
      for (let i = 0; i < 3; i++) await caps.consume(linkId);
      await expect(caps.consume(linkId)).rejects.toMatchObject({
        code: 'scan.cap_reached',
      });

      // A full Scan Cap, in turn, leaves the Link Cap alone.
      const scanId = await idOf(scanCookie);
      for (let i = 0; i < 3; i++) await caps.consume(scanId);
      await read('https://example.com/one', scanFull).expect(200);
      await read('https://example.com/two', scanFull).expect(200);

      const rows = await database
        .select({ kind: scanUsage.kind, count: scanUsage.count })
        .from(scanUsage)
        .where(eq(scanUsage.memberId, scanId));
      expect(rows).toEqual(
        expect.arrayContaining([
          { kind: 'scan', count: 3 },
          { kind: 'link', count: 2 },
        ]),
      );
      expect(rows).toHaveLength(2);
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
