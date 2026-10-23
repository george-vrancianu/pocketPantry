import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'node:crypto';
import { eq, like } from 'drizzle-orm';
import request from 'supertest';
import { ApiException } from '../src/common/api-exception';
import { normalizeName } from '../src/catalog/normalize';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  allergens,
  catalogTranslations,
  ingredientAllergens,
  openFoodFactsCache,
} from '../src/database/schema';
import type { OpenFoodFactsProduct } from '../src/barcode/open-food-facts.client';
import { freshBarcode } from './support/fresh-barcode';
import { client, signUp } from './support/admin-session';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Json = Record<string, unknown>;

const product = (
  overrides: Partial<OpenFoodFactsProduct> = {},
): OpenFoodFactsProduct => ({
  productName: null,
  productNames: {},
  genericName: null,
  genericNames: {},
  quantity: null,
  ...overrides,
});

// Spec: #342 / #346, ADR 0013. The Open Food Facts client is replaced, so no
// test reaches the network.
describe('Barcode Lookup (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let a: ReturnType<typeof client>;
  let b: ReturnType<typeof client>;
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;
  const asked: string[] = [];
  let found: OpenFoodFactsProduct | null = null;
  let failWith: Error | null = null;
  let aiCalls = 0;

  beforeAll(async () => {
    app = await createTestApp(
      [],
      {
        generate: () => {
          aiCalls += 1;
          return Promise.resolve({
            data: {
              productName: 'Grana Padano 200g',
              productType: 'Hard cheese',
              matchedIngredientId: seedId.ingredient('parmesan'),
              matchedCategory: 'Hard cheese',
              matchConfidence: 0.92,
              fallbackIngredientName: 'Grana Padano',
              expiryDate: null,
              expiryText: null,
              netQuantity: null,
              netUnit: null,
              confidence: 0.95,
            },
            requestId: null,
          });
        },
      },
      undefined,
      {
        fetchProduct: (barcode) => {
          asked.push(barcode);
          if (failWith) return Promise.reject(failWith);
          return Promise.resolve(found);
        },
      },
    );
    database = app.get<Database>(DATABASE);
    await seedCatalog(database);
    a = client(
      app,
      await signUp(app, `bc-a-${stamp}@example.com`, 'A'),
      '/api',
    );
    b = client(
      app,
      await signUp(app, `bc-b-${stamp}@example.com`, 'B'),
      '/api',
    );
  });

  let code = '';

  beforeEach(() => {
    code = freshBarcode();
    asked.length = 0;
    found = null;
    failWith = null;
  });

  afterAll(async () => {
    await app.close();
  });

  const lookup = (who: typeof a, barcode = code, locale = 'en') =>
    who.get(`/barcode-lookup/${barcode}?locale=${locale}`);

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .get('/api/barcode-lookup/3017620422003')
      .set('origin', TEST_ORIGIN)
      .expect(401);
  });

  it.each(['abc', '123', '12345678901234', '3017620422003x', '30176 20422003'])(
    'rejects the invalid barcode %j without asking Open Food Facts',
    async (invalid) => {
      await lookup(a, invalid).expect(400);
      expect(asked).toEqual([]);
    },
  );

  it('rejects a barcode with a wrong check digit without asking Open Food Facts', async () => {
    await lookup(a, '3017620422004').expect(400);
    await lookup(a, '036000291453').expect(400);
    expect(asked).toEqual([]);
  });

  it.each([
    ['EAN-8', 8, ''],
    ['UPC-A', 12, '0'],
    ['EAN-13', 13, ''],
  ])(
    'accepts a %s barcode and asks Open Food Facts for it prefixed with %j',
    async (_format, length, prefix) => {
      const barcode = freshBarcode(length);
      found = product({ productName: 'Parmesan' });
      await lookup(a, barcode).expect(200);
      expect(asked).toEqual([`${prefix}${barcode}`]);
    },
  );

  it('answers not found when Open Food Facts does not know the barcode', async () => {
    found = null;
    const res = await lookup(a).expect(200);
    expect(res.body).toEqual({ found: false });
  });

  it('answers not found for a product with no name at all', async () => {
    found = product({ quantity: '200 g' });
    expect((await lookup(a).expect(200)).body).toEqual({ found: false });
  });

  it('answers 502 barcode.provider_unavailable when Open Food Facts fails', async () => {
    failWith = new ApiException(502, 'barcode.provider_unavailable');
    const res = await lookup(a).expect(502);
    expect(res.body).toMatchObject({ code: 'barcode.provider_unavailable' });
  });

  describe('matching the Catalog', () => {
    it('returns an exact name match with its default unit, quantity, description and source', async () => {
      found = product({ productName: 'Parmesan', quantity: '200 g' });
      expect((await lookup(a).expect(200)).body).toMatchObject({
        found: true,
        source: 'open_food_facts',
        match: {
          id: seedId.ingredient('parmesan'),
          name: 'Parmesan',
          defaultUnit: expect.any(String) as unknown,
          defaults: { location: 'fridge', expiryDays: 60 },
        },
        lowConfidence: false,
        productDescription: 'Parmesan',
        quantity: 200,
        unit: 'g',
      });
    });

    it('matches a shared Synonym', async () => {
      found = product({ productName: 'Guleroedder' });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body.match).toMatchObject({ id: seedId.ingredient('carrot') });
    });

    it('matches by the Catalog search when the name is a prefix of one Ingredient only', async () => {
      found = product({ productName: 'Parmes' });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body.match).toMatchObject({ id: seedId.ingredient('parmesan') });
    });

    it('leaves the match empty when the search is ambiguous', async () => {
      found = product({ productName: 'Chee' });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body).toMatchObject({ found: true, match: null });
    });

    it('leaves the match empty, but keeps the product name, when nothing matches', async () => {
      found = product({ productName: 'Zorblax Crunch 500g' });
      expect((await lookup(a).expect(200)).body).toMatchObject({
        found: true,
        match: null,
        productDescription: 'Zorblax Crunch 500g',
      });
    });

    it("lets the Family's own Synonym win over a shared one for the same name", async () => {
      const name = unique('Bc Wheel');
      await database.insert(catalogTranslations).values({
        id: randomUUID(),
        entityType: 'ingredient',
        entityId: seedId.ingredient('parmesan'),
        locale: 'en',
        kind: 'synonym',
        value: name,
        normalizedValue: normalizeName(name),
      });
      found = product({ productName: name });
      expect(((await lookup(a).expect(200)).body as Json).match).toMatchObject({
        id: seedId.ingredient('parmesan'),
      });

      await a
        .post('/catalog/family-synonyms?locale=en', {
          name,
          ingredientId: seedId.ingredient('cheddar'),
        })
        .expect(201);
      expect(((await lookup(a).expect(200)).body as Json).match).toMatchObject({
        id: seedId.ingredient('cheddar'),
      });
      // Another Family still sees the shared one.
      expect(((await lookup(b).expect(200)).body as Json).match).toMatchObject({
        id: seedId.ingredient('parmesan'),
      });
    });

    afterAll(async () => {
      await database
        .delete(catalogTranslations)
        .where(like(catalogTranslations.value, `%${stamp}-%`));
    });
  });

  describe('name selection', () => {
    const names = product({
      productName: 'Default Name',
      productNames: { en: 'English Name', da: 'Dansk Navn' },
      genericName: 'Generic Name',
      genericNames: { ro: 'Nume Generic' },
    });
    const described = async (locale: string) =>
      ((await lookup(a, freshBarcode(), locale).expect(200)).body as Json)
        .productDescription;

    it("prefers the product name in the Member's locale", async () => {
      found = names;
      expect(await described('da')).toBe('Dansk Navn');
    });

    it("falls back to the generic name, in the Member's locale first", async () => {
      found = names;
      expect(await described('ro')).toBe('Nume Generic');
      found = { ...names, genericNames: {} };
      expect(await described('ro')).toBe('Generic Name');
    });

    it('then to English, then to the default product name', async () => {
      found = { ...names, genericName: null, genericNames: {} };
      expect(await described('ro')).toBe('English Name');
      found = {
        ...names,
        genericName: null,
        genericNames: {},
        productNames: {},
      };
      expect(await described('da')).toBe('Default Name');
    });
  });

  describe('net quantity', () => {
    const quantityOf = async (quantity: string | null) => {
      found = product({ productName: 'Zorblax', quantity });
      const body = (await lookup(a).expect(200)).body as Json;
      return [body.quantity, body.unit];
    };

    it.each([
      ['200 g', [200, 'g']],
      ['1 kg', [1, 'kg']],
      ['500ml', [500, 'ml']],
      ['1,5 l', [1.5, 'l']],
      ['33 cl', [330, 'ml']],
      ['6 pcs', [6, 'pcs']],
    ])('parses %j', async (text, expected) => {
      expect(await quantityOf(text)).toEqual(expected);
    });

    it.each([['12 oz'], ['6 x 125 g'], ['a bottle'], [''], [null]])(
      'gives no quantity for %j',
      async (text) => {
        expect(await quantityOf(text)).toEqual([null, null]);
      },
    );
  });

  // Spec: #352. Open Food Facts allergens, as a proposal for the Contains row
  // (no match) or an informational note (a match missing them).
  describe('allergens', () => {
    const named = (...slugs: string[]) =>
      slugs.map((slug) => ({
        id: seedId.allergen(slug),
        name: expect.any(String) as unknown,
      }));

    it('lists the mapped Allergens of an unmatched product and ignores unknown tags', async () => {
      found = product({
        productName: 'Zorblax Crunch 500g',
        allergenTags: ['en:milk', 'en:kiwi', 'en:sesame-seeds'],
      });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body).toMatchObject({ match: null });
      expect(body.allergens).toEqual(named('milk', 'sesame'));
      expect(body.missingAllergens).toEqual([]);
    });

    it('names the Allergens in the requested locale', async () => {
      found = product({
        productName: 'Zorblax Crunch 500g',
        allergenTags: ['en:milk'],
      });
      const body = (await lookup(a, code, 'da').expect(200)).body as Json;
      expect(body.allergens).toEqual([
        { id: seedId.allergen('milk'), name: 'Mælk' },
      ]);
    });

    it.each([
      ['an empty list', []],
      ['no list at all', undefined],
      ['only unknown tags', ['en:kiwi']],
    ])('lists none for %s', async (_label, allergenTags) => {
      found = product({ productName: 'Zorblax Crunch 500g', allergenTags });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body.allergens).toEqual([]);
    });

    it('never lists a retired Allergen', async () => {
      found = product({
        productName: 'Zorblax Crunch 500g',
        allergenTags: ['en:milk', 'en:lupin'],
      });
      const lupin = seedId.allergen('lupin');
      await database
        .update(allergens)
        .set({ archivedAt: new Date() })
        .where(eq(allergens.id, lupin));
      try {
        const body = (await lookup(a).expect(200)).body as Json;
        expect(body.allergens).toEqual(named('milk'));
      } finally {
        await database
          .update(allergens)
          .set({ archivedAt: null })
          .where(eq(allergens.id, lupin));
      }
    });

    it('notes only the listed Allergens a matched Ingredient is not tagged with', async () => {
      // Parmesan is tagged milk in the seed.
      found = product({
        productName: 'Parmesan',
        allergenTags: ['en:milk', 'en:gluten'],
      });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body).toMatchObject({
        match: { id: seedId.ingredient('parmesan') },
      });
      expect(body.missingAllergens).toEqual(named('gluten'));
    });

    it('notes nothing when the matched Ingredient already has every listed Allergen', async () => {
      found = product({ productName: 'Parmesan', allergenTags: ['en:milk'] });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body.missingAllergens).toEqual([]);
    });

    it('does not change the matched Ingredient tags', async () => {
      const tagsOfParmesan = () =>
        database
          .select()
          .from(ingredientAllergens)
          .where(
            eq(ingredientAllergens.ingredientId, seedId.ingredient('parmesan')),
          );
      const before = await tagsOfParmesan();
      found = product({ productName: 'Parmesan', allergenTags: ['en:gluten'] });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body.missingAllergens).toEqual(named('gluten'));
      expect(await tagsOfParmesan()).toEqual(before);
    });

    it('keeps the allergens in the cache and serves them without asking again', async () => {
      found = product({
        productName: 'Zorblax Crunch 500g',
        allergenTags: ['en:eggs'],
      });
      await lookup(a).expect(200);
      found = null;
      const body = (await lookup(b).expect(200)).body as Json;
      expect(asked).toEqual([code]);
      expect(body.allergens).toEqual(named('eggs'));
    });

    it('lists none from a product cached before allergens were kept', async () => {
      await database.insert(openFoodFactsCache).values({
        barcode: code,
        product: product({ productName: 'Zorblax Old Entry' }),
        fetchedAt: new Date(),
      });
      const body = (await lookup(a).expect(200)).body as Json;
      expect(body).toMatchObject({ found: true });
      expect(body.allergens).toEqual([]);
    });
  });

  it('never uses the Scan Cap', async () => {
    found = product({ productName: 'Parmesan' });
    // The test cap is 3 Scans a day.
    for (let i = 0; i < 6; i++) await lookup(b).expect(200);
    await b
      .post('/scan/product?locale=en', {
        productImage: 'data:image/jpeg;base64,YQ==',
      })
      .expect(201);
    expect(aiCalls).toBe(1);
  });

  describe('with a Catalog Language Preference', () => {
    // UI Language en, Catalog Language ro, Scan Language da: all three differ.
    it('matches on the Catalog Language product name and returns the Ingredient name in it', async () => {
      const cookie = await signUp(app, `bc-ro-${stamp}@example.com`, 'R');
      const romanian = client(app, cookie, '/api');
      await romanian
        .put('/settings/preferences', {
          locale: 'en',
          catalogLanguage: 'ro',
          scanLanguage: 'da',
        })
        .expect(200);
      found = product({
        productName: 'Unmatchable brand thing',
        productNames: { en: 'Unmatchable brand thing', ro: 'Lapte' },
      });
      const body = (await lookup(romanian).expect(200)).body as Json;
      expect(body.match).toMatchObject({
        id: seedId.ingredient('milk'),
        name: 'Lapte',
      });
    });
  });
});
