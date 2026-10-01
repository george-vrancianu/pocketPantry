import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { count } from 'drizzle-orm';
import request from 'supertest';
import { seedCatalog } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
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
      expect((await search('parm', 'en')).map((r) => r.name)).toContain(
        'Parmesan',
      );
      expect((await search('parmezan', 'ro')).map((r) => r.name)).toContain(
        'Parmezan',
      );
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

    it('falls back to the English name when a locale has no translation', async () => {
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
      const [parmesan] = await search('parmesan');
      await expect(
        database.insert(catalogTranslations).values({
          id: '00000000-0000-4000-8000-0000000000f3',
          entityType: 'ingredient',
          entityId: parmesan.id,
          locale: 'ro',
          kind: 'name',
          value: 'Parmezan',
          normalizedValue: 'parmezan',
        }),
      ).rejects.toThrow();
    });
  });

  describe('seed', () => {
    const totals = async () =>
      Promise.all(
        [
          parentCategories,
          leafCategories,
          ingredients,
          catalogTranslations,
        ].map(
          async (table) =>
            (await database.select({ n: count() }).from(table))[0].n,
        ),
      );

    it('leaves the database unchanged when run twice', async () => {
      const before = await totals();
      const rowsBefore = await database.select().from(catalogTranslations);
      await seedCatalog(database);
      await seedCatalog(database);
      expect(await totals()).toEqual(before);
      expect(await database.select().from(catalogTranslations)).toEqual(
        rowsBefore,
      );
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
