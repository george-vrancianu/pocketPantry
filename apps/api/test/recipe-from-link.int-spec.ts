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
  sourceLanguage: 'en',
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
  const read = (url: string, who = member, extra: object = {}) =>
    who.post('/from-link', { url, ...extra });

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

  describe('language choice and source language', () => {
    const url = 'https://example.com/lang';

    it('defaults to the Catalog Language and instructs it for the text', async () => {
      await read(url).expect(200);
      const prompt = prompts[0].prompt;
      expect(prompt).toContain('Write the title and the steps in English');
      expect(prompt).toContain(
        'nameAsWritten as a short ingredient name in English',
      );
      expect(prompt).not.toContain("page's own language");
    });

    it('catalog is the same as the default, in the Catalog Language', async () => {
      const cookie = await signUp(app, `link-lc-${stamp}@example.com`, 'LC');
      await client(app, cookie, '/api/settings')
        .put('/preferences', {
          locale: 'en',
          catalogLanguage: 'da',
          scanLanguage: 'en',
        })
        .expect(200);
      await read(url, client(app, cookie, '/api/recipes'), {
        language: 'catalog',
      }).expect(200);
      expect(prompts[0].prompt).toContain(
        'Write the title and the steps in Danish',
      );
    });

    it('source keeps the page language and does not name the Catalog Language', async () => {
      const cookie = await signUp(app, `link-ls-${stamp}@example.com`, 'LS');
      await client(app, cookie, '/api/settings')
        .put('/preferences', {
          locale: 'en',
          catalogLanguage: 'ro',
          scanLanguage: 'en',
        })
        .expect(200);
      await read(url, client(app, cookie, '/api/recipes'), {
        language: 'source',
      }).expect(200);
      const prompt = prompts[0].prompt;
      expect(prompt).toContain("in the page's own language");
      expect(prompt).toContain('do not translate anything');
      expect(prompt).not.toContain('Romanian');
      expect(prompt).not.toContain('Write the title and the steps in English');
      // Matching against the Catalog is unchanged.
      expect(prompt).toContain('Set ingredientId only to an exact id');
    });

    it('refuses an unknown language choice and extra fields', async () => {
      await read(url, member, { language: 'french' }).expect(400);
      await read(url, member, { language: null }).expect(400);
      await read(url, member, { extra: 1 }).expect(400);
      expect(prompts).toHaveLength(0);
    });

    it('sets sourceLanguage when the page language differs from the Catalog Language', async () => {
      respondWith(reading({ sourceLanguage: 'ro' }));
      const res = await read(url).expect(200);
      expect((res.body as RecipeFromLink).sourceLanguage).toBe('ro');
    });

    it('normalises a regional code to its base code', async () => {
      respondWith(reading({ sourceLanguage: ' DA-dk ' }));
      const res = await read(url).expect(200);
      expect((res.body as RecipeFromLink).sourceLanguage).toBe('da');
    });

    it('is null when the page language is the Catalog Language', async () => {
      respondWith(reading({ sourceLanguage: 'en-GB' }));
      const res = await read(url).expect(200);
      expect((res.body as RecipeFromLink).sourceLanguage).toBeNull();
    });

    it('is null with the source choice, even when detected', async () => {
      respondWith(reading({ sourceLanguage: 'ro' }));
      const res = await read(url, member, { language: 'source' }).expect(200);
      expect((res.body as RecipeFromLink).sourceLanguage).toBeNull();
    });

    it.each([null, '', '  ', 'not a language!', '123'])(
      'is null for an unknown detected language (%j)',
      async (detected) => {
        respondWith(reading({ sourceLanguage: detected }));
        const res = await read(url).expect(200);
        expect((res.body as RecipeFromLink).sourceLanguage).toBeNull();
      },
    );

    it('is null when the model leaves the field out', async () => {
      const rest: Record<string, unknown> = reading();
      delete rest.sourceLanguage;
      respondWith(rest);
      const res = await read(url).expect(200);
      expect((res.body as RecipeFromLink).sourceLanguage).toBeNull();
    });
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
