import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, sql } from 'drizzle-orm';
import request from 'supertest';
import {
  seedCatalog,
  seedId,
  stableId,
} from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  aisles,
  catalogTranslations,
  ingredients,
  leafCategories,
  parentCategories,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type SearchResult = {
  id: string;
  name: string;
  defaultUnit: string;
  leafCategory: { id: string; name: string };
  parentCategory: { id: string; name: string; aisle: string };
};

describe('Catalog (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    await seedCatalog(database);

    const email = `catalog-${Date.now()}@example.com`;
    const signUp = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .send({ name: 'Catalog Member', email, password: 'correct-horse-staple' })
      .expect(200);
    cookie = [signUp.headers['set-cookie'] ?? []]
      .flat()
      .map((value) => value.split(';')[0])
      .join('; ');
  });

  afterAll(async () => {
    await app.close();
  });

  async function search(q: string, locale?: string): Promise<SearchResult[]> {
    const response = await request(app.getHttpServer())
      .get('/api/catalog/search')
      .query({ q, ...(locale ? { locale } : {}) })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .expect(200);
    return (response.body as { results: SearchResult[] }).results;
  }

  describe('search', () => {
    it('finds Parmesan for "parm" in English and "parmezan" in Romanian', async () => {
      const en = (await search('parm', 'en')).find(
        (r) => r.name === 'Parmesan',
      );
      const ro = (await search('parmezan', 'ro')).find(
        (r) => r.name === 'Parmezan',
      );
      expect(en).toBeDefined();
      expect(ro?.id).toBe(en?.id);
    });

    it('is diacritic-insensitive: "brânză" and "branza" match the same Ingredients', async () => {
      const withDiacritics = await search('brânză', 'ro');
      const without = await search('branza', 'ro');
      expect(withDiacritics.length).toBeGreaterThan(0);
      expect(withDiacritics.map((r) => r.id)).toEqual(without.map((r) => r.id));
      expect(withDiacritics.map((r) => r.name)).toContain('Brânză feta');
    });

    it('ignores case, punctuation, and extra whitespace', async () => {
      const plain = await search('olive oil');
      const messy = await search('  OLIVE-oil!! ');
      expect(plain.length).toBeGreaterThan(0);
      expect(messy.map((r) => r.id)).toEqual(plain.map((r) => r.id));
    });

    it('matches Ingredient names from any locale', async () => {
      const results = await search('parmezan', 'en');
      expect(results.map((r) => r.name)).toContain('Parmesan');
    });

    it('matches Synonyms', async () => {
      expect((await search('mayo', 'en')).map((r) => r.name)).toContain(
        'Mayonnaise',
      );
      expect((await search('franzela', 'ro')).map((r) => r.name)).toContain(
        'Pâine',
      );
    });

    it('returns display names in the requested locale', async () => {
      const [parmesan] = await search('parmesan', 'ro');
      expect(parmesan.name).toBe('Parmezan');
      expect(parmesan.leafCategory.name).toBe('Brânzeturi tari');
      expect(parmesan.parentCategory.name).toBe('Lactate');
      expect(parmesan.parentCategory.aisle).toBe('Lactate și ouă');
    });

    it('localises the Aisle name, with English fallback', async () => {
      const [ro] = await search('parsley', 'ro');
      expect(ro.parentCategory.aisle).toBe('Legume și fructe');
      const [en] = await search('parsley', 'en');
      expect(en.parentCategory.aisle).toBe('Fruit & veg');
      // Herbs and Produce share one Aisle.
      expect((await search('tomato', 'en'))[0].parentCategory.aisle).toBe(
        en.parentCategory.aisle,
      );
    });

    it('defaults to English when no locale is given', async () => {
      const [fallback] = await search('parmesan');
      expect(fallback).toMatchObject({
        name: 'Parmesan',
        defaultUnit: 'g',
        leafCategory: { name: 'Hard cheese' },
        parentCategory: { name: 'Dairy', aisle: 'Dairy & eggs' },
      });
    });

    it('falls back to the English display name, not the canonical name, when a locale has no translation', async () => {
      const [parmesan] = await search('parmesan');
      const ids = {
        leaf: '00000000-0000-4000-8000-0000000000e1',
        ingredient: '00000000-0000-4000-8000-0000000000e2',
      };
      await database
        .insert(leafCategories)
        .values({
          id: ids.leaf,
          parentId: parmesan.parentCategory.id,
          name: 'Fallback Leaf Canonical',
          normalizedName: 'fallback leaf canonical',
        })
        .onConflictDoNothing();
      await database
        .insert(ingredients)
        .values({
          id: ids.ingredient,
          leafCategoryId: ids.leaf,
          name: 'Fallback Thing Canonical',
          normalizedName: 'fallback thing canonical',
          defaultUnit: 'g',
        })
        .onConflictDoNothing();
      await database
        .insert(catalogTranslations)
        .values([
          {
            id: '00000000-0000-4000-8000-0000000000e3',
            entityType: 'ingredient',
            entityId: ids.ingredient,
            locale: 'en',
            kind: 'name',
            value: 'Fallback Thing English',
            normalizedValue: 'fallback thing english',
          },
          {
            id: '00000000-0000-4000-8000-0000000000e4',
            entityType: 'leaf_category',
            entityId: ids.leaf,
            locale: 'en',
            kind: 'name',
            value: 'Fallback Leaf English',
            normalizedValue: 'fallback leaf english',
          },
        ])
        .onConflictDoNothing();

      const [result] = await search('fallback thing', 'ro');
      expect(result.name).toBe('Fallback Thing English');
      expect(result.leafCategory.name).toBe('Fallback Leaf English');
    });

    it('falls back to the canonical name when no translation exists at all', async () => {
      await database
        .insert(ingredients)
        .values({
          id: '00000000-0000-4000-8000-0000000000f1',
          leafCategoryId: (await search('parmesan'))[0].leafCategory.id,
          name: 'Test Untranslated Thing',
          normalizedName: 'test untranslated thing',
          defaultUnit: 'g',
        })
        .onConflictDoNothing();
      const [result] = await search('untranslated thing', 'ro');
      expect(result.name).toBe('Test Untranslated Thing');
    });

    it('ranks exact matches before prefix matches', async () => {
      const results = await search('milk');
      expect(results[0].name).toBe('Milk');
    });

    it('returns nothing for blank or unmatched queries', async () => {
      expect(await search('zzzzqqq')).toEqual([]);
      expect(await search('   ')).toEqual([]);
    });

    it('rejects unsupported locales and unauthenticated callers', async () => {
      await request(app.getHttpServer())
        .get('/api/catalog/search')
        .query({ q: 'milk', locale: 'xx' })
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .expect(400);
      await request(app.getHttpServer())
        .get('/api/catalog/search')
        .query({ q: 'milk' })
        .set('origin', TEST_ORIGIN)
        .expect(401);
    });
  });

  describe('Romanian receipt lines', () => {
    // Receipt text after quantities and prices are stripped. Search is
    // stage one (exact, prefix, word-prefix), so these are the short names and
    // abbreviations receipts actually print.
    const lines: [string, string][] = [
      ['LAPTE UHT', 'Lapte'],
      ['PIEPT PUI', 'Piept de pui'],
      ['PULPE PUI', 'Pulpe de pui dezosate'],
      ['CARNE TOCATA MIXTA', 'Carne tocată amestec'],
      ['PARIZER', 'Parizer'],
      ['CARTOFI ALBI', 'Cartofi'],
      ['ROSII CHERRY', 'Roșii cherry'],
      ['CASTRAVETI', 'Castraveți'],
      ['CASCAVAL FELII', 'Cașcaval'],
      ['TELEMEA DE VACA', 'Telemea'],
      ['SMANTANA 20', 'Smântână'],
      ['IAURT GRECESC', 'Iaurt grecesc'],
      ['OUA M', 'Ouă'],
      ['PAINE ALBA', 'Pâine'],
      ['FAINA 000', 'Făină'],
      ['ZAHAR', 'Zahăr'],
      ['ULEI FLOAREA SOARELUI', 'Ulei de floarea soarelui'],
      ['BOIA DULCE', 'Boia de ardei'],
      ['APA PLATA', 'Apă plată'],
      ['CAFEA MACINATA', 'Cafea'],
    ];

    it.each(lines)('matches "%s" to %s', async (line, expected) => {
      const results = await search(line, 'ro');
      expect(results[0]?.name).toBe(expected);
    });
  });

  describe('schema constraints', () => {
    it('rejects an Ingredient whose normalised canonical name already exists', async () => {
      const [leaf] = await database.select().from(leafCategories).limit(1);
      await expect(
        database.insert(ingredients).values({
          id: '00000000-0000-4000-8000-0000000000f2',
          leafCategoryId: leaf.id,
          name: 'PARMESAN!',
          normalizedName: 'parmesan',
          defaultUnit: 'g',
        }),
      ).rejects.toThrow();
    });

    it('rejects a duplicate normalised display name within a locale', async () => {
      // An Ingredient with no Romanian name yet, so only the per-locale
      // uniqueness (not one-name-per-entity) can reject the insert.
      const probeId = '00000000-0000-4000-8000-0000000000e5';
      await database
        .insert(ingredients)
        .values({
          id: probeId,
          leafCategoryId: (await search('parmesan'))[0].leafCategory.id,
          name: 'Constraint Probe',
          normalizedName: 'constraint probe',
          defaultUnit: 'g',
        })
        .onConflictDoNothing();
      const error: unknown = await database
        .insert(catalogTranslations)
        .values({
          id: '00000000-0000-4000-8000-0000000000f3',
          entityType: 'ingredient',
          entityId: probeId,
          locale: 'ro',
          kind: 'name',
          value: 'Parmezan',
          normalizedValue: 'parmezan',
        })
        .then(
          () => null,
          (e: unknown) => e,
        );
      // Drizzle wraps the pg error; the violated index is on the cause.
      expect(
        (error as { cause?: { constraint?: string } }).cause?.constraint,
      ).toBe('catalog_translations_display_value_idx');
    });
  });

  describe('seed', () => {
    const snapshot = async () => ({
      aisles: await database.select().from(aisles).orderBy(aisles.id),
      parents: await database
        .select()
        .from(parentCategories)
        .orderBy(parentCategories.id),
      leaves: await database
        .select()
        .from(leafCategories)
        .orderBy(leafCategories.id),
      ingredients: await database
        .select()
        .from(ingredients)
        .orderBy(ingredients.id),
      translations: await database
        .select()
        .from(catalogTranslations)
        .orderBy(catalogTranslations.id),
    });

    it('leaves the database unchanged when run twice', async () => {
      const before = await snapshot();
      await seedCatalog(database);
      await seedCatalog(database);
      expect(await snapshot()).toEqual(before);
    });

    it('does not fail when a display name was worded differently by an earlier seed', async () => {
      const id = stableId(
        `translation:ingredient:${seedId.ingredient('parmesan')}:en:name`,
      );
      const [original] = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.id, id));
      expect(original?.value).toBe('Parmesan');
      await database
        .update(catalogTranslations)
        .set({ value: 'Old Parmesan', normalizedValue: 'old parmesan' })
        .where(eq(catalogTranslations.id, id));
      try {
        await expect(seedCatalog(database)).resolves.toBeUndefined();
        const [after] = await database
          .select()
          .from(catalogTranslations)
          .where(eq(catalogTranslations.id, id));
        expect(after.value).toBe('Old Parmesan');
      } finally {
        await database
          .update(catalogTranslations)
          .set({ value: 'Parmesan', normalizedValue: 'parmesan' })
          .where(eq(catalogTranslations.id, id));
      }
    });

    it('loads a full Catalog and leaves existing rows alone', async () => {
      const [{ count }] = await database
        .select({ count: sql<number>`count(*)::int` })
        .from(ingredients);
      expect(count).toBeGreaterThanOrEqual(400);
      const [{ leafCount }] = await database
        .select({ leafCount: sql<number>`count(*)::int` })
        .from(leafCategories);
      expect(leafCount).toBeGreaterThanOrEqual(100);
    });

    it('gives Parent Categories that share an Aisle one shared sort order', async () => {
      const rows = await database
        .select({
          parent: parentCategories.name,
          aisleId: aisles.id,
          sortOrder: aisles.sortOrder,
        })
        .from(parentCategories)
        .innerJoin(aisles, eq(parentCategories.aisleId, aisles.id));
      const produce = rows.find((r) => r.parent === 'Produce');
      const herbs = rows.find((r) => r.parent === 'Herbs');
      expect(produce?.aisleId).toBe(herbs?.aisleId);
      expect(produce?.sortOrder).toBe(herbs?.sortOrder);
      const orders = (await database.select().from(aisles)).map(
        (a) => a.sortOrder,
      );
      expect(new Set(orders).size).toBe(orders.length);
    });

    it('loads 18 Parent Categories with Aisles and an Other Leaf under each', async () => {
      const parents = await database.select().from(parentCategories);
      expect(parents).toHaveLength(18);
      const leaves = await database.select().from(leafCategories);
      for (const parent of parents) {
        expect(
          leaves.some(
            (leaf) =>
              leaf.parentId === parent.id &&
              leaf.normalizedName.startsWith('other'),
          ),
        ).toBe(true);
      }
    });
  });
});
