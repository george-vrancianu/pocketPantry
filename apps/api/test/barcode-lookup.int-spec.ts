import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'node:crypto';
import { like } from 'drizzle-orm';
import request from 'supertest';
import { ApiException } from '../src/common/api-exception';
import { normalizeName } from '../src/catalog/normalize';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations } from '../src/database/schema';
import type { OpenFoodFactsProduct } from '../src/barcode/open-food-facts.client';
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

  // The shared cache outlives a test run, so every test looks up a barcode of its own.
  let code = '';
  const freshCode = (length = 13) =>
    `${stamp}${++n}${Math.random().toString().slice(2)}`
      .replace(/\D/g, '')
      .slice(-length)
      .padStart(length, '1');

  beforeEach(() => {
    code = freshCode();
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

  it.each([8, 12, 13])('accepts a %i-digit barcode', async (length) => {
    const barcode = freshCode(length);
    found = product({ productName: 'Parmesan' });
    await lookup(a, barcode).expect(200);
    expect(asked).toEqual([barcode]);
  });

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
      ((await lookup(a, freshCode(), locale).expect(200)).body as Json)
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
});
