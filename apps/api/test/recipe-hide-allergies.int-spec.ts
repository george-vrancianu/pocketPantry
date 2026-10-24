import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { batches, ingredients, recipes, user } from '../src/database/schema';
import type {
  AdminRecipeDetail,
  CookTonightView,
  PlateMatchView,
  RecipeDetail,
  RecipeListItem,
} from '../src/recipes/recipes.schemas';
import type { FamilyAllergyView } from '../src/settings/settings.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec: #350 / #359, ADR 0014, ADR 0012. "Hide Recipes with my Allergies": Recipe browse and
// search, Cook Tonight (the Cook Tonight card too) and Plate Scan matches leave out Recipes with
// the viewer's own or Family Allergies in a required, checked line; detail, Variants and
// Pairing links never drop; the Meal Plan's calls pass the override.
describe('Hide Recipes with my Allergies (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let settings: ReturnType<typeof client>;
  let recipesApi: ReturnType<typeof client>;
  let benSettings: ReturnType<typeof client>;
  const stamp = Date.now();
  const email = `hide-allergies-${stamp}@example.com`;
  let n = 0;

  const MILK = seedId.allergen('milk');
  const PEANUT = seedId.allergen('peanuts');
  const g = (slug: string, extra: object = {}) => ({
    ingredientId: seedId.ingredient(slug),
    quantity: 100,
    unit: 'g',
    ...extra,
  });
  const create = async (lines: object[], word = `Hide ${stamp}-${++n}`) =>
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
  const variantOf = async (base: AdminRecipeDetail, lines: object[]) => {
    const variant = (
      await admin
        .post(`/${base.id}/variants`, { title: `Hide Variant ${stamp}-${++n}` })
        .expect(201)
    ).body as AdminRecipeDetail;
    await admin
      .put(`/${variant.id}`, {
        title: variant.title,
        servings: 4,
        lines,
        steps: [{ text: 'Cook' }],
      })
      .expect(200);
    return variant;
  };
  const mine = (...ids: string[]) =>
    settings.put('/allergies', { allergenIds: ids }).expect(200);
  const hiding = (on: boolean) =>
    settings.put('/preferences', { hideRecipesWithAllergies: on }).expect(200);
  const familyId = async () =>
    (
      await database
        .select({ id: user.familyId })
        .from(user)
        .where(eq(user.email, email))
    )[0].id;
  const stock = async (slug: string) => {
    const [{ leaf }] = await database
      .select({ leaf: ingredients.leafCategoryId })
      .from(ingredients)
      .where(eq(ingredients.id, seedId.ingredient(slug)));
    await database.insert(batches).values({
      familyId: await familyId(),
      ingredientId: seedId.ingredient(slug),
      unmatched: false,
      leafCategoryId: leaf,
      location: 'fridge',
      quantity: 500,
      unit: 'g',
    });
  };
  const familyAllergyIds: string[] = [];
  const addFamilyAllergy = async (allergenId: string) => {
    const row = (
      await settings.post('/family-allergies', { allergenId, label: 'Mia' })
    ).body as FamilyAllergyView;
    familyAllergyIds.push(row.id);
  };

  type Listing = { recipes: RecipeListItem[]; hiddenByAllergiesCount: number };
  const list = async (query = '') =>
    (await recipesApi.get(`?locale=en${query}`).expect(200)).body as Listing;
  const found = async (extra = '') => list(`&search=${stamp}-${extra}`);
  const tonight = async (extra = '') =>
    (
      await recipesApi
        .get(`/cook-tonight?locale=en&today=2026-10-11${extra}`)
        .expect(200)
    ).body as CookTonightView;
  const plate = async (word: string, ids: string[], showHidden?: boolean) =>
    (
      await recipesApi
        .post('/plate-matches', {
          locale: 'en',
          dishTitle: word,
          ingredientIds: ids,
          ...(showHidden === undefined ? {} : { showHidden }),
        })
        .expect(200)
    ).body as { matches: PlateMatchView[]; hiddenByAllergiesCount: number };
  const ids = (rows: { id: string }[]) => rows.map((r) => r.id);

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const cookie = await signUp(app, email, 'Hider');
    await promoteToAdmin(database, email);
    admin = client(app, cookie, '/api/admin/recipes');
    settings = client(app, cookie, '/api/settings');
    recipesApi = client(app, cookie, '/api/recipes');
    const family = (
      await client(app, cookie, '/api/family').get('').expect(200)
    ).body as { inviteCode: string };
    const benCookie = await signUp(
      app,
      `hide-allergies-ben-${stamp}@example.com`,
      'Ben',
    );
    benSettings = client(app, benCookie, '/api/settings');
    await client(app, benCookie, '/api/family')
      .post('/join', { code: family.inviteCode })
      .expect(201);
  });

  afterEach(async () => {
    await hiding(false);
    await mine();
    await benSettings.put('/allergies', { allergenIds: [] }).expect(200);
    for (const id of familyAllergyIds.splice(0)) {
      await settings.del(`/family-allergies/${id}`).expect(200);
    }
    // Each test counts the Recipes it made, so none may linger into the next.
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await database
      .delete(batches)
      .where(eq(batches.familyId, await familyId()));
  });

  afterAll(async () => {
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await app.close();
  });

  describe('Recipe browse and search', () => {
    it('shows everything, and counts none hidden, while the preference is off', async () => {
      const milky = await create([g('parmesan')]);
      await mine(MILK);
      const body = await found();
      expect(ids(body.recipes)).toContain(milky.id);
      expect(body.hiddenByAllergiesCount).toBe(0);
    });

    it('leaves out Recipes with the own Allergy in a required line and counts them', async () => {
      const milky = await create([g('parmesan'), g('flour')]);
      const clear = await create([g('flour')]);
      await mine(MILK);
      await hiding(true);

      const body = await found();
      expect(ids(body.recipes)).toEqual([clear.id]);
      expect(body.hiddenByAllergiesCount).toBe(1);
      expect(ids(body.recipes)).not.toContain(milky.id);
    });

    it('also hides on a Family Allergy', async () => {
      const milky = await create([g('parmesan')]);
      await addFamilyAllergy(MILK);
      await hiding(true);
      const body = await found();
      expect(ids(body.recipes)).not.toContain(milky.id);
      expect(body.hiddenByAllergiesCount).toBe(1);
    });

    it('brings them back, with their warning, under the "show hidden" override and counts none', async () => {
      const milky = await create([g('parmesan')]);
      await mine(MILK);
      await hiding(true);
      const body = await found('&showHidden=true');
      const row = body.recipes.find((r) => r.id === milky.id)!;
      expect(row.allergyWarning?.severity).toBe('strong');
      expect(body.hiddenByAllergiesCount).toBe(0);
    });

    it('does not hide for another Member`s Allergy', async () => {
      const milky = await create([g('parmesan')]);
      await benSettings.put('/allergies', { allergenIds: [MILK] }).expect(200);
      await hiding(true);
      const body = await found();
      expect(ids(body.recipes)).toContain(milky.id);
      expect(body.hiddenByAllergiesCount).toBe(0);
    });

    it('keeps optional-only and Unchecked matches visible', async () => {
      const optional = await create([
        g('flour'),
        g('parmesan', { optional: true }),
      ]);
      // Only a Family Recipe can hold an Unmatched (Unchecked) line.
      const unchecked = (
        await recipesApi
          .post('', {
            title: `Hide Family ${stamp}-${++n}`,
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
      await hiding(true);
      const body = await found();
      expect(ids(body.recipes)).toEqual(
        expect.arrayContaining([optional.id, unchecked.id]),
      );
      expect(body.hiddenByAllergiesCount).toBe(0);
      expect(
        body.recipes.find((r) => r.id === optional.id)?.allergyWarning
          ?.severity,
      ).toBe('soft');
    });

    it('judges a Variant on its own lines: the peanut-free Variant stays, the peanut Base goes', async () => {
      const base = await create([g('flour'), g('peanuts')]);
      const variant = await variantOf(base, [g('flour')]);
      await mine(PEANUT);
      await hiding(true);
      const body = await found('&includeVariants=true');
      expect(ids(body.recipes)).toContain(variant.id);
      expect(ids(body.recipes)).not.toContain(base.id);
      expect(body.hiddenByAllergiesCount).toBe(1);
    });
  });

  describe('Cook Tonight and the Cook Tonight card', () => {
    it('drops hidden cards, counts them, and the override brings them back', async () => {
      const milky = await create([g('parmesan')]);
      const clear = await create([g('flour')]);
      await mine(MILK);
      await hiding(true);

      const shown = await tonight();
      const all = await tonight('&showHidden=true');
      const shownIds = shown.cards.map((c) => c.recipe.id);
      expect(shownIds).toContain(clear.id);
      expect(shownIds).not.toContain(milky.id);
      expect(all.cards.map((c) => c.recipe.id)).toContain(milky.id);
      expect(shown.hiddenByAllergiesCount).toBeGreaterThanOrEqual(1);
      expect(all.hiddenByAllergiesCount).toBe(0);
      expect(all.cards.length - shown.cards.length).toBe(
        shown.hiddenByAllergiesCount,
      );
    });

    it('counts nothing while the preference is off', async () => {
      await create([g('parmesan')]);
      await mine(MILK);
      expect((await tonight()).hiddenByAllergiesCount).toBe(0);
    });

    it('lets a peanut-free Variant stand in for its hidden Base Recipe', async () => {
      const base = await create([g('peanuts')]);
      const variant = await variantOf(base, [g('flour')]);
      await mine(PEANUT);
      await hiding(true);
      const card = (await tonight()).cards.find((c) => c.base.id === base.id);
      expect(card?.recipe.id).toBe(variant.id);
    });

    it('keeps a hidden Variant out of "+N other Variants" when the top card is visible', async () => {
      await stock('flour');
      await stock('parmesan');
      const base = await create([g('flour')]);
      await variantOf(base, [g('flour'), g('parmesan')]);
      await mine(MILK);
      await hiding(true);
      const shown = (await tonight()).cards.find((c) => c.base.id === base.id)!;
      expect(shown.recipe.id).toBe(base.id);
      expect(shown.otherVariantsCount).toBe(0);
      // The override lists the Variant again.
      const all = (await tonight('&showHidden=true')).cards.find(
        (c) => c.base.id === base.id,
      )!;
      expect(all.otherVariantsCount + (all.recipe.id === base.id ? 0 : 1)).toBe(
        1,
      );
    });

    it('does not hide for another Member`s Allergy or an optional-only line', async () => {
      const other = await create([g('parmesan')]);
      const optional = await create([
        g('flour'),
        g('parmesan', { optional: true }),
      ]);
      await benSettings.put('/allergies', { allergenIds: [MILK] }).expect(200);
      await mine(MILK);
      await hiding(true);
      const cardIds = (await tonight()).cards.map((c) => c.recipe.id);
      expect(cardIds).toContain(optional.id);
      expect(cardIds).not.toContain(other.id);
      await mine();
      await addFamilyAllergy(PEANUT);
      expect((await tonight()).cards.map((c) => c.recipe.id)).toContain(
        other.id,
      );
    });
  });

  describe('Plate Scan matches', () => {
    it('drops hidden matches and counts them; the override brings them back', async () => {
      const word = `Plate Hide ${stamp}-${++n}`;
      const dish = await create([g('parmesan'), g('flour')], word);
      await mine(MILK);
      await hiding(true);
      const dishIngredients = [seedId.ingredient('parmesan')];

      const shown = await plate(word, dishIngredients);
      expect(ids(shown.matches)).not.toContain(dish.id);
      expect(shown.hiddenByAllergiesCount).toBeGreaterThanOrEqual(1);

      const all = await plate(word, dishIngredients, true);
      expect(ids(all.matches)).toContain(dish.id);
      expect(all.hiddenByAllergiesCount).toBe(0);
    });

    it('keeps an optional-only match visible with its soft warning', async () => {
      const word = `Plate Soft ${stamp}-${++n}`;
      const dish = await create(
        [g('flour'), g('parmesan', { optional: true })],
        word,
      );
      await mine(MILK);
      await hiding(true);
      const body = await plate(word, [seedId.ingredient('flour')]);
      expect(
        body.matches.find((m) => m.id === dish.id)?.allergyWarning,
      ).toMatchObject({ severity: 'soft' });
    });

    it('counts nothing while the preference is off', async () => {
      const word = `Plate Off ${stamp}-${++n}`;
      await create([g('parmesan')], word);
      await mine(MILK);
      const body = await plate(word, [seedId.ingredient('parmesan')]);
      expect(body.hiddenByAllergiesCount).toBe(0);
    });
  });

  describe('never hidden', () => {
    it('keeps Recipe detail, the Variants list and Pairing links', async () => {
      const milky = await create([g('parmesan')]);
      const base = await create([g('peanuts')]);
      const variant = await variantOf(base, [g('flour')]);
      const other = await variantOf(base, [g('peanuts')]);
      await admin
        .put(`/${variant.id}/guidance`, {
          nutritionNote: null,
          pairings: [
            {
              kind: 'food',
              label: 'a cheesy side',
              reason: 'rich',
              linkedRecipeId: milky.id,
            },
          ],
          eatingMoments: [],
        })
        .expect(200);
      await mine(MILK, PEANUT);
      await hiding(true);

      const detail = (
        await recipesApi.get(`/${milky.id}?locale=en`).expect(200)
      ).body as RecipeDetail;
      expect(detail.allergyWarning?.severity).toBe('strong');

      const baseDetail = (
        await recipesApi.get(`/${base.id}?locale=en`).expect(200)
      ).body as RecipeDetail;
      expect(ids(baseDetail.variants).sort()).toEqual(
        [variant.id, other.id].sort(),
      );

      const variantDetail = (
        await recipesApi.get(`/${variant.id}?locale=en`).expect(200)
      ).body as RecipeDetail;
      expect(variantDetail.guidance.pairings[0].link).toEqual({
        type: 'recipe',
        id: milky.id,
        title: milky.title,
      });
    });
  });

  describe('the Meal Plan', () => {
    it('is not narrowed when its calls pass the override (includeVariants, showHidden)', async () => {
      const base = await create([g('peanuts')]);
      const variant = await variantOf(base, [g('peanuts')]);
      await mine(PEANUT);
      await hiding(true);
      const picker = await list(
        `&includeVariants=true&showHidden=true&search=${stamp}-`,
      );
      expect(ids(picker.recipes)).toEqual(
        expect.arrayContaining([base.id, variant.id]),
      );
      expect(picker.hiddenByAllergiesCount).toBe(0);
    });
  });
});
