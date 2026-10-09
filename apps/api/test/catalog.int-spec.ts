import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, inArray, sql } from 'drizzle-orm';
import request from 'supertest';
import {
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from '../src/catalog/seed/catalog-seed-data';
import {
  seedCatalog,
  seedId,
  stableId,
} from '../src/catalog/seed/seed-catalog';
import { CatalogSearchService } from '../src/catalog/catalog-search.service';
import { normalizeName } from '../src/catalog/normalize';
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
    // The starter Catalog is seeded once by global-setup.mjs.

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

  describe('parents', () => {
    const parents = (locale: string) =>
      request(app.getHttpServer())
        .get('/api/catalog/parents')
        .query({ locale })
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie);

    it('lists the Parent Categories by name in the Member locale, for placing Unmatched Batches', async () => {
      const en = (
        (await parents('en').expect(200)).body as {
          parents: { id: string; name: string }[];
        }
      ).parents;
      const ro = (
        (await parents('ro').expect(200)).body as {
          parents: { id: string; name: string }[];
        }
      ).parents;
      expect(en.length).toBeGreaterThan(5);
      expect(en.map((p) => p.name)).toEqual(
        [...en.map((p) => p.name)].sort((a, b) => a.localeCompare(b)),
      );
      const dairyEn = en.find((p) => p.name === 'Dairy');
      expect(dairyEn).toBeDefined();
      expect(ro.find((p) => p.id === dairyEn?.id)?.name).toBe('Lactate');
    });

    it('lists the Parent Categories in Danish, sorted by the Danish name', async () => {
      const da = (
        (await parents('da').expect(200)).body as {
          parents: { id: string; name: string }[];
        }
      ).parents;
      expect(da.find((p) => p.id === seedId.parent('dairy'))?.name).toBe(
        'Mejeri',
      );
      expect(da.map((p) => p.name)).toEqual(
        [...da.map((p) => p.name)].sort((a, b) => a.localeCompare(b, 'da')),
      );
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/catalog/parents')
        .expect(401);
    });
  });

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

    it('returns Danish display names for locale=da, and finds them by their Danish name', async () => {
      const [parmesan] = await search('parmesan', 'da');
      expect(parmesan.name).toBe('Parmesan');
      expect(parmesan.leafCategory.name).toBe('Hård ost');
      expect(parmesan.parentCategory.name).toBe('Mejeri');
      expect(parmesan.parentCategory.aisle).toBe('Mejeri og æg');
      const [milk] = await search('mælk', 'da');
      expect(milk).toMatchObject({
        id: seedId.ingredient('milk'),
        name: 'Mælk',
        leafCategory: { name: 'Mælk og fløde' },
      });
      // The same Ingredient is found by its Danish name under any UI locale.
      expect((await search('mælk', 'en'))[0].id).toBe(milk.id);
      expect((await search('milk', 'da'))[0].name).toBe('Mælk');
    });

    it('folds æ, ø and å to the ASCII spellings Danish receipts print', async () => {
      const milk = seedId.ingredient('milk');
      expect((await search('maelk', 'da'))[0]).toMatchObject({
        id: milk,
        name: 'Mælk',
      });
      expect((await search('SKUMMETMAELK', 'da'))[0].id).toBe(milk);
      expect((await search('roedbede', 'da'))[0].id).toBe(
        seedId.ingredient('beetroot'),
      );
      expect(
        (await search('flaaede tomater', 'da')).map((r) => r.id),
      ).toContain(seedId.ingredient('canned-tomatoes'));
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

  describe('findExact', () => {
    const exact = (names: string[], locale: 'en' | 'ro' = 'en') =>
      app.get(CatalogSearchService).findExact(names, locale);

    it('matches names, Synonyms and other-locale names, keyed by the name as given', async () => {
      const found = await exact([
        ' MAYO ',
        'Parmezan',
        'nothing like it',
        '!!',
      ]);
      expect([...found.keys()].sort()).toEqual([' MAYO ', 'Parmezan']);
      expect(found.get(' MAYO ')?.name).toBe('Mayonnaise');
      expect(found.get('Parmezan')?.id).toBe(seedId.ingredient('parmesan'));
    });

    it('matches a receipt line printed without Danish letters', async () => {
      const found = await exact(['GULEROEDDER', 'Gulerødder']);
      expect(found.get('GULEROEDDER')?.id).toBe(seedId.ingredient('carrot'));
      expect(found.get('Gulerødder')?.id).toBe(seedId.ingredient('carrot'));
    });

    it('leaves out a name that is exactly the name of more than one Ingredient', async () => {
      const ids = [seedId.ingredient('milk'), seedId.ingredient('parmesan')];
      const rows = ids.map((entityId, i) => ({
        id: `00000000-0000-4000-8000-0000000000a${i}`,
        entityType: 'ingredient' as const,
        entityId,
        locale: 'en',
        kind: 'synonym' as const,
        value: 'Zzambig',
        normalizedValue: 'zzambig',
      }));
      await database.insert(catalogTranslations).values(rows);
      try {
        const found = await exact(['Zzambig', 'mayo']);
        expect([...found.keys()]).toEqual(['mayo']);
      } finally {
        await database.delete(catalogTranslations).where(
          inArray(
            catalogTranslations.id,
            rows.map((row) => row.id),
          ),
        );
      }
    });

    it('returns nothing without any usable name', async () => {
      expect((await exact([])).size).toBe(0);
      expect((await exact(['  ', '?'])).size).toBe(0);
    });
  });

  describe('Romanian receipt lines', () => {
    // Receipt text as printed: upper case, no diacritics, abbreviated, with
    // quantities and prices already stripped. Search is stage one (exact,
    // prefix, word-prefix) over names and Synonyms.
    const lines: [string, string][] = [
      ['LAPTE UHT', 'Lapte UHT'],
      ['SMANT', 'Smântână'],
      ['CASC FELII', 'Cașcaval'],
      ['BR VACI', 'Brânză de vaci'],
      ['TELEMEA DE VACI', 'Telemea'],
      ['PIEPT PUI DEZ', 'Piept de pui'],
      ['PULPE PUI', 'Pulpe întregi de pui'],
      ['MUSCHI FILE', 'Mușchi de porc'],
      ['SALAM SASESC', 'Salam'],
      ['CRENV', 'Crenvurști'],
      ['TOBA', 'Tobă'],
      ['CARNE TOC MIXTA', 'Carne tocată amestec'],
      ['CARTOFI ALBI', 'Cartofi'],
      ['ROSII CHERRY', 'Roșii cherry'],
      ['LEURDA', 'Leurdă'],
      ['OUA M', 'Ouă'],
      ['PAINE FELIATA', 'Pâine pentru toast'],
      ['ULEI FL SOARELUI', 'Ulei de floarea soarelui'],
      ['ZAHAR TOS', 'Zahăr'],
      ['APA PLATA', 'Apă plată'],
    ];

    it.each(lines)('matches "%s" to %s', async (line, expected) => {
      const results = await search(line, 'ro');
      expect(results[0]?.name).toBe(expected);
    });
  });

  describe('Danish receipt lines', () => {
    // As on a Danish receipt: upper case, abbreviated, quantities stripped.
    const lines: [string, string][] = [
      ['MINIMÆLK', 'Mælk'],
      ['KYLLINGEBRYST', 'Kyllingebryst'],
      ['HAKKET OKSEKØD', 'Hakket oksekød'],
      ['RUGBRØD SKÅRET', 'Rugbrød'],
      ['AGURK', 'Agurk'],
      ['ÆG', 'Æg'],
      ['LØG', 'Løg'],
      ['SMØR USALTET', 'Smør'],
      ['CREMEFRAICHE', 'Creme fraiche'],
      ['HVEDEMEL', 'Hvedemel'],
      ['HAVREGRYN GROVE', 'Havregryn'],
      ['PEBERFRUGTER', 'Peberfrugt'],
    ];

    it.each(lines)('matches "%s" to %s', async (line, expected) => {
      const results = await search(line, 'da');
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
      // Run inside one transaction that is rolled back: other test workers
      // read this seeded row and must never see the uncommitted edit.
      class Rollback extends Error {}
      await expect(
        database.transaction(async (tx) => {
          const [original] = await tx
            .select()
            .from(catalogTranslations)
            .where(eq(catalogTranslations.id, id));
          expect(original?.value).toBe('Parmesan');
          await tx
            .update(catalogTranslations)
            .set({ value: 'Old Parmesan', normalizedValue: 'old parmesan' })
            .where(eq(catalogTranslations.id, id));
          await expect(seedCatalog(tx)).resolves.toBeUndefined();
          const [after] = await tx
            .select()
            .from(catalogTranslations)
            .where(eq(catalogTranslations.id, id));
          expect(after.value).toBe('Old Parmesan');
          throw new Rollback();
        }),
      ).rejects.toBeInstanceOf(Rollback);
      const [restored] = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.id, id));
      expect(restored.value).toBe('Parmesan');
    });

    it('adds the Danish names to a database seeded before Danish, keeping Admin rows and not failing on a clash with one', async () => {
      const entity = (slug: string) => seedId.ingredient(slug);
      const rows = (slug: string, locale: string, kind: 'name' | 'synonym') =>
        and(
          eq(catalogTranslations.entityId, entity(slug)),
          eq(catalogTranslations.locale, locale),
          eq(catalogTranslations.kind, kind),
        );
      const adminRow = (
        id: string,
        slug: string,
        kind: 'name' | 'synonym',
        value: string,
      ) => ({
        id: stableId(`test:${id}`),
        entityType: 'ingredient' as const,
        entityId: entity(slug),
        locale: 'da',
        kind,
        value,
        normalizedValue: normalizeName(value),
      });
      // One transaction, rolled back: other test workers read the seeded rows.
      class Rollback extends Error {}
      let failure: Error | undefined;
      await expect(
        database.transaction(async (tx) => {
          try {
            // Back to how a pre-Danish database looks, plus three Admin edits:
            // a curated Romanian name, and a Danish name and Synonym that
            // collide with rows the seed is about to insert.
            await tx
              .delete(catalogTranslations)
              .where(eq(catalogTranslations.locale, 'da'));
            await tx
              .update(catalogTranslations)
              .set({
                value: 'Parmezan curat',
                normalizedValue: 'parmezan curat',
              })
              .where(rows('parmesan', 'ro', 'name'));
            await tx
              .insert(catalogTranslations)
              .values([
                adminRow('da-name', 'butter', 'name', 'Smør af Admin'),
                adminRow('da-synonym', 'milk', 'synonym', 'minimælk'),
              ]);
            // The English Synonym "squash" the old seed gave Pumpkin.
            const oldSquash = stableId(
              `translation:ingredient:${entity('pumpkin')}:en:synonym:squash`,
            );
            await tx.insert(catalogTranslations).values({
              id: oldSquash,
              entityType: 'ingredient',
              entityId: entity('pumpkin'),
              locale: 'en',
              kind: 'synonym',
              value: 'squash',
              normalizedValue: 'squash',
            });

            // The ASCII Synonym the old seed gave carrot, from before Danish
            // letters were folded.
            const oldGuleroedder = stableId(
              `translation:ingredient:${entity('carrot')}:da:synonym:guleroedder`,
            );
            await tx.insert(catalogTranslations).values({
              id: oldGuleroedder,
              entityType: 'ingredient',
              entityId: entity('carrot'),
              locale: 'da',
              kind: 'synonym',
              value: 'guleroedder',
              normalizedValue: 'guleroedder',
            });

            await expect(seedCatalog(tx)).resolves.toBeUndefined();

            // The retired rows are gone, so "squash" has one owner: Zucchini.
            expect(
              await tx
                .select()
                .from(catalogTranslations)
                .where(
                  inArray(catalogTranslations.id, [oldSquash, oldGuleroedder]),
                ),
            ).toEqual([]);

            const value = async (
              slug: string,
              locale: string,
              kind: 'name' | 'synonym',
            ) =>
              (
                await tx
                  .select()
                  .from(catalogTranslations)
                  .where(rows(slug, locale, kind))
              ).map((row) => row.value);
            expect(await value('milk', 'da', 'name')).toEqual(['Mælk']);
            expect(await value('zucchini', 'da', 'name')).toEqual(['Squash']);
            expect(await value('parmesan', 'ro', 'name')).toEqual([
              'Parmezan curat',
            ]);
            expect(await value('butter', 'da', 'name')).toEqual([
              'Smør af Admin',
            ]);
            // The Admin's Synonym is the only "minimælk"; the seeded copy was skipped.
            expect(await value('milk', 'da', 'synonym')).toEqual(
              expect.arrayContaining(['minimælk', 'sødmælk']),
            );
            expect(
              (await value('milk', 'da', 'synonym')).filter(
                (v) => v.toLowerCase() === 'minimælk',
              ),
            ).toEqual(['minimælk']);
          } catch (error) {
            failure = error as Error;
          }
          throw new Rollback();
        }),
      ).rejects.toBeInstanceOf(Rollback);
      if (failure) throw failure;
    });

    it('keeps the ids of Synonyms with Danish letters that earlier seed runs wrote', async () => {
      // Ids shipped before æ, ø and å were folded, so a re-seed must not
      // insert a second copy under a new id.
      const [row] = await database
        .select({ value: catalogTranslations.value })
        .from(catalogTranslations)
        .where(
          eq(
            catalogTranslations.id,
            stableId(
              `translation:ingredient:${seedId.ingredient('beetroot')}:da:synonym:rødbede`,
            ),
          ),
        );
      expect(row?.value).toBe('rødbede');
    });

    it('loads exactly the seeded Catalog', async () => {
      const count = async (
        table:
          | typeof ingredients
          | typeof leafCategories
          | typeof parentCategories
          | typeof aisles,
        ids: string[],
      ) =>
        (
          await database
            .select({ n: sql<number>`count(*)::int` })
            .from(table)
            .where(inArray(table.id, ids))
        )[0].n;
      expect(
        await count(
          ingredients,
          SEED_INGREDIENTS.map((i) => seedId.ingredient(i.slug)),
        ),
      ).toBe(SEED_INGREDIENTS.length);
      expect(
        await count(
          leafCategories,
          SEED_LEAVES.map((l) => seedId.leaf(l.slug)),
        ),
      ).toBe(SEED_LEAVES.length);
      expect(
        await count(
          parentCategories,
          SEED_PARENTS.map((p) => seedId.parent(p.slug)),
        ),
      ).toBe(18);
      const synonyms = SEED_INGREDIENTS.reduce(
        (n, i) =>
          n +
          (i.synonyms?.en?.length ?? 0) +
          (i.synonyms?.ro?.length ?? 0) +
          (i.synonyms?.da?.length ?? 0),
        0,
      );
      const [{ stored }] = await database
        .select({ stored: sql<number>`count(*)::int` })
        .from(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.entityType, 'ingredient'),
            eq(catalogTranslations.kind, 'synonym'),
            inArray(
              catalogTranslations.entityId,
              SEED_INGREDIENTS.map((i) => seedId.ingredient(i.slug)),
            ),
          ),
        );
      expect(stored).toBe(synonyms);
    });

    it('leaves a row edited since the last seed run exactly as it was', async () => {
      const id = seedId.ingredient('parmesan');
      await database
        .update(ingredients)
        .set({ defaultUnit: 'kg' })
        .where(eq(ingredients.id, id));
      try {
        await seedCatalog(database);
        const [row] = await database
          .select()
          .from(ingredients)
          .where(eq(ingredients.id, id));
        expect(row.defaultUnit).toBe('kg');
      } finally {
        await database
          .update(ingredients)
          .set({ defaultUnit: 'g' })
          .where(eq(ingredients.id, id));
      }
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
      // Seed rows only: other specs in this worker insert Parent Categories
      // they never delete.
      const seedParentIds = new Set(
        SEED_PARENTS.map((parent) => seedId.parent(parent.slug)),
      );
      const parents = (await database.select().from(parentCategories)).filter(
        (row) => seedParentIds.has(row.id),
      );
      expect(parents).toHaveLength(18);
      const leaves = await database.select().from(leafCategories);
      for (const parent of parents) {
        expect(
          leaves.filter((leaf) => leaf.parentId === parent.id && leaf.isOther),
        ).toHaveLength(1);
      }
    });
  });
});
