import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, inArray } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  allergens,
  catalogTranslations,
  family,
  familyAllergies,
  ingredientAllergens,
  ingredients,
  memberAllergies,
  recipes as recipesTable,
} from '../src/database/schema';
import type {
  AdminRecipeDetail,
  RecipeAllergens,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { storeUiLanguage } from './support/stored-language';
import { promoteToAdmin } from './support/promote-to-admin';

type AllergenRow = {
  id: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  translations: { locale: string; value: string }[];
};
type IngredientRow = { id: string; allergenIds: string[] };

jest.setTimeout(30_000);

// Spec: #350 / #355, ADR 0014. Admins curate Allergens and tag shared Ingredients.
describe('Admin Allergens (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  let recipes: ReturnType<typeof client>;
  let memberSettings: ReturnType<typeof client>;
  let memberCookie: string;
  const stamp = Date.now();
  const ingredientIds: string[] = [];
  const recipeIds: string[] = [];
  const GHOST = '00000000-0000-4000-8000-000000000000';

  const overview = async () =>
    (await admin.get('').expect(200)).body as {
      allergens: AllergenRow[];
      ingredients: IngredientRow[];
    };
  const list = async () => (await overview()).allergens;
  const create = async (name: string) =>
    (await admin.post('/allergens', { name }).expect(201)).body as AllergenRow;
  const tagsOf = async (id: string) =>
    (await overview()).ingredients.find((i) => i.id === id)?.allergenIds ?? [];
  const checked = async (id: string) =>
    (
      await database
        .select({ checked: ingredients.allergensChecked })
        .from(ingredients)
        .where(eq(ingredients.id, id))
    )[0].checked;

  // A fresh shared Ingredient, so tagging never disturbs the seed's own tags other suites read.
  const createIngredient = async (label: string) => {
    const [{ leaf }] = await database
      .select({ leaf: ingredients.leafCategoryId })
      .from(ingredients)
      .where(eq(ingredients.id, seedId.ingredient('onion')));
    const created = (
      await admin
        .post('/ingredients', {
          leafCategoryId: leaf,
          name: `${label} ${stamp}`,
          defaultUnit: 'g',
        })
        .expect(201)
    ).body as { id: string };
    ingredientIds.push(created.id);
    return created;
  };

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `allergens-admin-${stamp}@example.com`;
    const cookie = await signUp(app, email, 'Allergen Admin');
    memberCookie = cookie;
    await promoteToAdmin(database, email);
    admin = client(app, cookie, '/api/admin/catalog');
    recipes = client(app, cookie, '/api/admin/recipes');
    memberSettings = client(app, cookie, '/api/settings');
    member = client(
      app,
      await signUp(app, `allergens-member-${stamp}@example.com`, 'Member'),
      '/api/admin/catalog',
    );
  });

  afterAll(async () => {
    // Leave no rows behind even if a test failed midway: later specs in this worker count Catalog rows.
    const like = `%${stamp}%`;
    if (recipeIds.length > 0) {
      await database
        .delete(recipesTable)
        .where(inArray(recipesTable.id, recipeIds));
    }
    // Tags and Allergies restrict deleting an Allergen, so clear them first.
    const stamped = (
      await database
        .select({ id: allergens.id })
        .from(allergens)
        .where(ilike(allergens.name, like))
    ).map((row) => row.id);
    if (stamped.length > 0) {
      await database
        .delete(ingredientAllergens)
        .where(inArray(ingredientAllergens.allergenId, stamped));
      await database
        .delete(memberAllergies)
        .where(inArray(memberAllergies.allergenId, stamped));
      await database
        .delete(familyAllergies)
        .where(inArray(familyAllergies.allergenId, stamped));
    }
    await database.delete(allergens).where(ilike(allergens.name, like));
    if (ingredientIds.length > 0) {
      await database
        .delete(ingredients)
        .where(inArray(ingredients.id, ingredientIds));
    }
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  describe('curating the list', () => {
    it('adds an Allergen last in the list with its English name', async () => {
      const first = await create(`Kiwi ${stamp}`);
      const second = await create(`Mango ${stamp}`);
      expect(second.sortOrder).toBeGreaterThan(first.sortOrder);
      const row = (await list()).find((a) => a.id === first.id);
      expect(row?.archived).toBe(false);
      expect(row?.translations.map((t) => [t.locale, t.value])).toEqual([
        ['en', `Kiwi ${stamp}`],
      ]);
      await admin.post('/allergens', { name: `kiwi ${stamp}` }).expect(409);
    });

    it('renames and translates an Allergen, which then shows in the locale', async () => {
      const kiwi = await create(`Papaya ${stamp}`);
      await admin
        .patch(`/allergens/${kiwi.id}`, { name: `Guava ${stamp}` })
        .expect(200);
      await admin
        .post('/translations', {
          entityType: 'allergen',
          entityId: kiwi.id,
          locale: 'ro',
          kind: 'name',
          value: `Guava ro ${stamp}`,
        })
        .expect(201);
      const row = (await list()).find((a) => a.id === kiwi.id);
      expect(row?.name).toBe(`Guava ${stamp}`);
      expect(row?.translations.map((t) => [t.locale, t.value]).sort()).toEqual([
        ['en', `Guava ${stamp}`],
        ['ro', `Guava ro ${stamp}`],
      ]);
      // A signed-in request's `?locale=` is ignored: the stored UI Language decides.
      await storeUiLanguage(app, memberCookie, 'ro');
      const ro = (await memberSettings.get('/allergies').expect(200)).body as {
        allergens: { id: string; name: string }[];
      };
      expect(ro.allergens.find((a) => a.id === kiwi.id)?.name).toBe(
        `Guava ro ${stamp}`,
      );
      await storeUiLanguage(app, memberCookie, 'da');
      const da = (await memberSettings.get('/allergies').expect(200)).body as {
        allergens: { id: string; name: string }[];
      };
      await storeUiLanguage(app, memberCookie, 'en');
      // No Danish name yet: falls back to the English one.
      expect(da.allergens.find((a) => a.id === kiwi.id)?.name).toBe(
        `Guava ${stamp}`,
      );
      await admin
        .patch(`/allergens/${GHOST}`, { name: `Ghost ${stamp}` })
        .expect(404);
    });

    it('retires an Allergen in use instead of deleting it, hides it from the picker and keeps its tags', async () => {
      const lychee = await create(`Lychee ${stamp}`);
      const onion = (await createIngredient('Retire')).id;
      const before = await tagsOf(onion);
      await admin
        .put(`/ingredients/${onion}/allergens`, {
          allergenIds: [...before, lychee.id],
        })
        .expect(200);
      await memberSettings
        .put('/allergies', { allergenIds: [lychee.id] })
        .expect(200);

      await admin.post(`/allergens/${lychee.id}/archive`).expect(200);
      expect((await list()).find((a) => a.id === lychee.id)?.archived).toBe(
        true,
      );
      // No raw foreign-key error anywhere: the tag and the Allergy stay.
      expect(await tagsOf(onion)).toContain(lychee.id);
      const picker = (await memberSettings.get('/allergies').expect(200))
        .body as { allergenIds: string[] };
      expect(picker.allergenIds).toContain(lychee.id);

      // A new tag with a retired Allergen is refused with a clear code.
      const other = await create(`Plum ${stamp}`);
      await admin.post(`/allergens/${other.id}/archive`).expect(200);
      const refused = await admin
        .put(`/ingredients/${onion}/allergens`, {
          allergenIds: [...before, lychee.id, other.id],
        })
        .expect(409);
      expect((refused.body as { code: string }).code).toBe(
        'catalog.allergen_retired',
      );

      await admin.post(`/allergens/${lychee.id}/unarchive`).expect(200);
      expect((await list()).find((a) => a.id === lychee.id)?.archived).toBe(
        false,
      );
      await admin
        .put(`/ingredients/${onion}/allergens`, { allergenIds: before })
        .expect(200);
      await memberSettings.put('/allergies', { allergenIds: [] }).expect(200);
      await admin.post(`/allergens/${GHOST}/archive`).expect(404);
    });

    it('keeps retired Allergens out of the Member pickers and refuses them as new picks', async () => {
      const fig = await create(`Fig ${stamp}`);
      await admin.post(`/allergens/${fig.id}/archive`).expect(200);
      const picker = (await memberSettings.get('/allergies').expect(200))
        .body as { allergens: { id: string }[] };
      expect(picker.allergens.map((a) => a.id)).not.toContain(fig.id);
      const refused = await memberSettings
        .put('/allergies', { allergenIds: [fig.id] })
        .expect(409);
      expect((refused.body as { code: string }).code).toBe(
        'settings.allergen_retired',
      );
      await memberSettings
        .post('/family-allergies', { allergenId: fig.id })
        .expect(409);
      const familyPicker = (
        await memberSettings.get('/family-allergies').expect(200)
      ).body as { allergens: { id: string }[] };
      expect(familyPicker.allergens.map((a) => a.id)).not.toContain(fig.id);
    });

    it('keeps curation Admin-only', async () => {
      await member.post('/allergens', { name: `Nope ${stamp}` }).expect(403);
      await member.patch(`/allergens/${GHOST}`, { name: 'x' }).expect(403);
      await member.post(`/allergens/${GHOST}/archive`).expect(403);
      await member
        .put(`/ingredients/${GHOST}/allergens`, {
          allergenIds: [],
        })
        .expect(403);
    });
  });

  describe('tagging a shared Ingredient', () => {
    const PEANUTS = seedId.allergen('peanuts');
    const MILK = seedId.allergen('milk');

    it('tags and untags, flags the Ingredient as checked, and every Recipe using it reflects the change', async () => {
      const onion = (await createIngredient('Tagged')).id;
      // Not yet flagged: the seed would still apply its tags over an Admin's edit.
      expect(await checked(onion)).toBe(false);

      const recipe = (
        await recipes
          .post('', {
            title: `Onion dish ${stamp}`,
            servings: 2,
            lines: [{ ingredientId: onion, quantity: 100, unit: 'g' }],
            steps: [{ text: 'Cook' }],
          })
          .expect(201)
      ).body as AdminRecipeDetail;
      recipeIds.push(recipe.id);
      const derived = async () =>
        (await recipes.get(`/${recipe.id}/allergens`).expect(200))
          .body as RecipeAllergens;

      await admin
        .put(`/ingredients/${onion}/allergens`, {
          allergenIds: [PEANUTS, MILK],
        })
        .expect(200);
      expect(await checked(onion)).toBe(true);
      expect(new Set(await tagsOf(onion))).toEqual(new Set([PEANUTS, MILK]));
      expect((await derived()).items.map((i) => i.allergen.name)).toEqual([
        'Peanuts',
        'Milk',
      ]);

      await admin
        .put(`/ingredients/${onion}/allergens`, { allergenIds: [MILK] })
        .expect(200);
      expect(await tagsOf(onion)).toEqual([MILK]);
      expect((await derived()).items.map((i) => i.allergen.name)).toEqual([
        'Milk',
      ]);

      // Untagging everything is a real "contains none", still checked.
      await admin
        .put(`/ingredients/${onion}/allergens`, { allergenIds: [] })
        .expect(200);
      expect(await tagsOf(onion)).toEqual([]);
      expect(await checked(onion)).toBe(true);
      expect(await derived()).toEqual({ items: [], uncheckedCount: 0 });
    });

    it('rejects unknown Allergens and unknown Ingredients', async () => {
      const onion = (await createIngredient('Unknown')).id;
      await admin
        .put(`/ingredients/${onion}/allergens`, { allergenIds: [GHOST] })
        .expect(404);
      await admin
        .put(`/ingredients/${GHOST}/allergens`, { allergenIds: [] })
        .expect(404);
    });

    it('never sees a Family Ingredient', async () => {
      const [owner] = await database.select({ id: family.id }).from(family);
      const [{ leaf }] = await database
        .select({ leaf: ingredients.leafCategoryId })
        .from(ingredients)
        .where(eq(ingredients.id, seedId.ingredient('onion')));
      const id = crypto.randomUUID();
      await database.insert(ingredients).values({
        id,
        name: `Mine ${stamp}`,
        normalizedName: `mine ${stamp}`,
        leafCategoryId: leaf,
        defaultUnit: 'g',
        amountScale: 'medium',
        ownerFamilyId: owner.id,
      });
      try {
        await admin
          .put(`/ingredients/${id}/allergens`, { allergenIds: [] })
          .expect(404);
      } finally {
        await database.delete(ingredients).where(eq(ingredients.id, id));
      }
    });
  });
});
