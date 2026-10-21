import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes } from '../src/database/schema';
import type {
  AdminRecipeDetail,
  CompactAllergyWarning,
  CookTonightView,
  RecipeDetail,
  RecipeListItem,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec: #350 / #358, ADR 0014. The compact allergyWarning on Recipe browse, Cook Tonight
// (which also feeds the Can Make strip) and Plate Scan matches.
describe('Allergy indicators on Recipe lists and matches (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let settings: ReturnType<typeof client>;
  let recipesApi: ReturnType<typeof client>;
  const stamp = Date.now();
  let n = 0;

  const MILK = seedId.allergen('milk');
  const PEANUT = seedId.allergen('peanuts');
  const g = (slug: string, extra: object = {}) => ({
    ingredientId: seedId.ingredient(slug),
    quantity: 100,
    unit: 'g',
    ...extra,
  });
  const mine = (...ids: string[]) =>
    settings.put('/allergies', { allergenIds: ids }).expect(200);
  const create = async (lines: object[], word = `Indicator ${stamp}-${++n}`) =>
    (
      await admin
        .post('', {
          title: word,
          servings: 4,
          lines,
          steps: [{ text: 'Cook' }],
        })
        .expect(201)
    ).body as AdminRecipeDetail;
  const detailWarning = async (id: string) =>
    ((await recipesApi.get(`/${id}`).expect(200)).body as RecipeDetail)
      .allergyWarning;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `allergy-indicators-${stamp}@example.com`;
    const cookie = await signUp(app, email, 'Indy');
    await promoteToAdmin(database, email);
    admin = client(app, cookie, '/api/admin/recipes');
    settings = client(app, cookie, '/api/settings');
    recipesApi = client(app, cookie, '/api/recipes');
    // Catalog rows another suite could leave behind: one-Ingredient Recipes that would crowd
    // a Plate Scan's five matches if the dishes below did not out-score them.
    for (let k = 0; k < 6; k++) {
      await create([g('parmesan')], `Plate ${stamp}-crowd${k}a`);
      await create([g('flour')], `Plate ${stamp}-crowd${k}b`);
    }
  });

  afterEach(async () => {
    await mine();
  });

  afterAll(async () => {
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await app.close();
  });

  describe('Recipe browse and search', () => {
    const list = async (query = '') =>
      (
        (await recipesApi.get(`?locale=en${query}`).expect(200)).body as {
          recipes: (RecipeListItem & {
            allergyWarning: CompactAllergyWarning | null;
          })[];
        }
      ).recipes;

    it('names the Allergen on each Recipe, strong or soft as on Recipe detail, and none when clear', async () => {
      const strong = await create([g('parmesan'), g('flour')]);
      const soft = await create([
        g('flour'),
        g('parmesan', { optional: true }),
      ]);
      const clear = await create([g('flour')]);
      await mine(MILK);

      const rows = await list(`&search=${stamp}-`);
      const of = (id: string) => rows.find((r) => r.id === id)!;
      expect(of(strong.id).allergyWarning).toEqual({
        severity: 'strong',
        allergens: [
          {
            id: MILK,
            name: 'Milk',
            tier: 'yours',
            severity: 'strong',
            owners: [{ kind: 'own' }],
          },
        ],
        uncheckedCount: 0,
      });
      expect(of(soft.id).allergyWarning).toEqual({
        severity: 'soft',
        allergens: [
          {
            id: MILK,
            name: 'Milk',
            tier: 'yours',
            severity: 'soft',
            owners: [{ kind: 'own' }],
          },
        ],
        uncheckedCount: 0,
      });
      expect(of(clear.id).allergyWarning).toBeNull();
      for (const recipe of [strong, soft, clear]) {
        const detail = await detailWarning(recipe.id);
        expect(of(recipe.id).allergyWarning?.severity).toBe(detail?.severity);
      }
    });

    it('names the Allergen in the requested locale', async () => {
      const recipe = await create([g('parmesan')]);
      await mine(MILK);
      const ro = (
        (await recipesApi.get(`?locale=ro&search=${stamp}-`).expect(200))
          .body as {
          recipes: { id: string; allergyWarning: CompactAllergyWarning }[];
        }
      ).recipes.find((r) => r.id === recipe.id)!;
      expect(ro.allergyWarning.allergens[0].name).toBe('Lapte');
    });

    it('carries the warning on the Variants listed for Meal Plans, judged on their own lines', async () => {
      const base = await create([g('flour'), g('peanuts')]);
      const variant = (
        await admin
          .post(`/${base.id}/variants`, {
            title: `Indicator Variant ${stamp}-${++n}`,
          })
          .expect(201)
      ).body as AdminRecipeDetail;
      await admin
        .put(`/${variant.id}`, {
          title: variant.title,
          servings: 4,
          lines: [g('flour')],
          steps: [{ text: 'Cook' }],
        })
        .expect(200);
      await mine(PEANUT);

      const rows = await list('&includeVariants=true');
      expect(rows.find((r) => r.id === base.id)?.allergyWarning?.severity).toBe(
        'strong',
      );
      expect(rows.find((r) => r.id === variant.id)?.allergyWarning).toBeNull();
    });

    it('marks a Recipe with an Unchecked line softly, without naming an Allergen', async () => {
      // Only a Family Recipe can hold an Unmatched line.
      const recipe = (
        await recipesApi
          .post('', {
            title: `Indicator Family ${stamp}-${++n}`,
            servings: 2,
            locale: 'en',
            parentId: null,
            lines: [
              g('flour'),
              { rawName: 'mystery spice', quantity: 1, unit: 'g' },
            ],
          })
          .expect(201)
      ).body as { id: string };
      await mine(MILK);
      const row = (await list(`&search=${stamp}-`)).find(
        (r) => r.id === recipe.id,
      )!;
      expect(row.allergyWarning).toEqual({
        severity: 'soft',
        allergens: [],
        uncheckedCount: 1,
      });
    });

    it('has no warning for a Member with no Allergies', async () => {
      const recipe = await create([g('parmesan')]);
      await mine();
      const row = (await list(`&search=${stamp}-`)).find(
        (r) => r.id === recipe.id,
      )!;
      expect(row.allergyWarning).toBeNull();
    });
  });

  describe('Cook Tonight and the Can Make strip', () => {
    it('adds the warning to the card Recipe', async () => {
      // One missing line each, so both are near misses and get a card.
      const strong = await create([g('parmesan')]);
      const soft = await create([
        g('flour'),
        g('parmesan', { optional: true }),
      ]);
      await mine(MILK);
      const { cards } = (
        await recipesApi
          .get('/cook-tonight?locale=en&today=2026-10-11')
          .expect(200)
      ).body as CookTonightView;
      const of = (id: string) => cards.find((c) => c.recipe.id === id)!;
      expect(of(strong.id).recipe.allergyWarning).toEqual({
        severity: 'strong',
        allergens: [
          {
            id: MILK,
            name: 'Milk',
            tier: 'yours',
            severity: 'strong',
            owners: [{ kind: 'own' }],
          },
        ],
        uncheckedCount: 0,
      });
      expect(of(soft.id).recipe.allergyWarning?.severity).toBe('soft');
      for (const recipe of [strong, soft]) {
        const detail = await detailWarning(recipe.id);
        const compact = of(recipe.id).recipe.allergyWarning;
        expect(compact?.severity).toBe(detail?.severity);
        expect(compact?.allergens.map((a) => a.name)).toEqual(
          detail?.entries.map((e) => e.allergen.name),
        );
      }
    });

    it("gives a Variant card the Variant's own warning, not its base's", async () => {
      // Both are near misses with the same rank; the Variant's title sorts first, so it is the card.
      const base = await create([g('flour')]);
      const variant = (
        await admin
          .post(`/${base.id}/variants`, {
            title: `Aaa Indicator Variant ${stamp}-${++n}`,
          })
          .expect(201)
      ).body as AdminRecipeDetail;
      await admin
        .put(`/${variant.id}`, {
          title: variant.title,
          servings: 4,
          lines: [g('parmesan')],
          steps: [{ text: 'Cook' }],
        })
        .expect(200);
      await mine(MILK);
      const { cards } = (
        await recipesApi
          .get('/cook-tonight?locale=en&today=2026-10-11')
          .expect(200)
      ).body as CookTonightView;
      const card = cards.find((c) => c.base.id === base.id)!;
      expect(card.recipe.id).toBe(variant.id);
      expect(card.recipe.allergyWarning?.severity).toBe('strong');
      expect(card.recipe.allergyWarning?.allergens.map((a) => a.name)).toEqual([
        'Milk',
      ]);
    });
  });

  describe('Plate Scan matches', () => {
    // Plate Scan ranks the whole Catalog and keeps five, so each dish scans exactly its own
    // Ingredients and carries a stamped title: nothing another suite left behind can outscore it.
    it('adds the warning to each match', async () => {
      const word = `Plate ${stamp}-${++n}`;
      const dish = await create([g('parmesan'), g('flour')], word);
      await mine(MILK);
      const { matches } = (
        await recipesApi
          .post('/plate-matches', {
            locale: 'en',
            dishTitle: word,
            ingredientIds: [
              seedId.ingredient('parmesan'),
              seedId.ingredient('flour'),
            ],
          })
          .expect(200)
      ).body as {
        matches: {
          id: string;
          allergyWarning: CompactAllergyWarning | null;
        }[];
      };
      const match = matches.find((m) => m.id === dish.id)!;
      expect(match.allergyWarning).toEqual({
        severity: 'strong',
        allergens: [
          {
            id: MILK,
            name: 'Milk',
            tier: 'yours',
            severity: 'strong',
            owners: [{ kind: 'own' }],
          },
        ],
        uncheckedCount: 0,
      });
      expect(match.allergyWarning?.severity).toBe(
        (await detailWarning(dish.id))?.severity,
      );
    });

    it('is soft when only an optional line contains the Allergen, as on Recipe detail', async () => {
      const word = `Plate ${stamp}-${++n}`;
      const dish = await create(
        [g('flour'), g('parmesan', { optional: true })],
        word,
      );
      await mine(MILK);
      const { matches } = (
        await recipesApi
          .post('/plate-matches', {
            locale: 'en',
            dishTitle: word,
            ingredientIds: [
              seedId.ingredient('flour'),
              seedId.ingredient('parmesan'),
            ],
          })
          .expect(200)
      ).body as {
        matches: { id: string; allergyWarning: CompactAllergyWarning | null }[];
      };
      const compact = matches.find((m) => m.id === dish.id)!.allergyWarning;
      const detail = await detailWarning(dish.id);
      expect(compact?.severity).toBe('soft');
      expect(compact?.severity).toBe(detail?.severity);
      expect(compact?.allergens).toEqual([
        {
          id: MILK,
          name: 'Milk',
          tier: 'yours',
          severity: 'soft',
          owners: [{ kind: 'own' }],
        },
      ]);
    });
  });
});
