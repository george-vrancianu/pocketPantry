import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { allergens, ingredientAllergens } from '../src/database/schema';
import type {
  FamilyRecipeEdit,
  RecipeDetail,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

type Who = ReturnType<typeof client>;
type Made = { id: string; name: string };
type CatalogRow = {
  id: string;
  allergensChecked: boolean;
  allergenIds: string[];
  allergens: { id: string; name: string }[];
};
type AdminIngredient = {
  id: string;
  allergenIds: string[];
  allergensReviewPending: boolean;
};

// Spec: #360 / #350, ADR 0014. Members tag their Family Ingredients; promote and
// merge carry the tags over, flagged for the Admin to review.
describe('Family Ingredient Allergens (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;
  let a: Who;
  let a2: Who;
  let b: Who;
  let c: Who;
  let admin: Who;
  let recipesA: Who;
  let recipesA2: Who;
  let recipesB: Who;
  const GROUND_SPICES = seedId.leaf('ground-spices');
  const PEANUTS = seedId.allergen('peanuts');
  const MILK = seedId.allergen('milk');
  const EGGS = seedId.allergen('eggs');

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const cookieA = await signUp(app, `fia-a-${stamp}@example.com`, 'A');
    const cookieA2 = await signUp(app, `fia-a2-${stamp}@example.com`, 'A2');
    a = client(app, cookieA, '/api');
    a2 = client(app, cookieA2, '/api');
    recipesA = client(app, cookieA, '/api/recipes');
    recipesA2 = client(app, cookieA2, '/api/recipes');
    const cookieB = await signUp(app, `fia-b-${stamp}@example.com`, 'B');
    b = client(app, cookieB, '/api');
    recipesB = client(app, cookieB, '/api/recipes');
    c = client(
      app,
      await signUp(app, `fia-c-${stamp}@example.com`, 'C'),
      '/api',
    );
    const adminEmail = `fia-admin-${stamp}@example.com`;
    admin = client(app, await signUp(app, adminEmail, 'Admin'), '/api');
    await promoteToAdmin(database, adminEmail);
    const invite = (await a.get('/family').expect(200)).body as {
      inviteCode: string;
    };
    await a2.post('/family/join', { code: invite.inviteCode }).expect(201);
  });

  afterAll(async () => {
    await app.close();
  });

  const create = (who: Who, name: string, extra: object = {}) =>
    who.post('/catalog/family-ingredients?locale=en', {
      name,
      leafCategoryId: GROUND_SPICES,
      defaultUnit: 'g',
      ...extra,
    });
  const made = async (who: Who, extra: object = {}) =>
    (await create(who, unique('Fia'), extra).expect(201)).body as Made;
  const rowOf = async (who: Who, id: string) =>
    (
      (await who.get('/catalog/family?locale=en').expect(200)).body as {
        ingredients: CatalogRow[];
      }
    ).ingredients.find((row) => row.id === id);
  const tag = (who: Who, id: string, allergenIds: string[]) =>
    who.put(`/catalog/family-ingredients/${id}/allergens`, { allergenIds });
  const adminRow = async (id: string) =>
    (
      (await admin.get('/admin/catalog').expect(200)).body as {
        ingredients: AdminIngredient[];
      }
    ).ingredients.find((row) => row.id === id)!;
  const familyRecipe = async (who: Who, ingredientId: string) =>
    (
      await who
        .post('', {
          title: unique('Recipe'),
          servings: 2,
          locale: 'en',
          parentId: null,
          lines: [{ ingredientId, quantity: 1, unit: 'g' }],
          steps: [{ text: 'Stir' }],
        })
        .expect(201)
    ).body as FamilyRecipeEdit;
  const detail = async (who: Who, id: string) =>
    (await who.get(`/${id}`).expect(200)).body as RecipeDetail;

  describe('the Allergen options', () => {
    it('lists the Allergens in the locale and leaves out retired ones', async () => {
      const list = (await a.get('/catalog/allergens?locale=ro').expect(200))
        .body as { allergens: { id: string; name: string }[] };
      expect(list.allergens).toContainEqual({ id: MILK, name: 'Lapte' });
      await database
        .update(allergens)
        .set({ archivedAt: new Date() })
        .where(eq(allergens.id, EGGS));
      try {
        const after = (await a.get('/catalog/allergens?locale=en').expect(200))
          .body as { allergens: { id: string }[] };
        expect(after.allergens.map((x) => x.id)).not.toContain(EGGS);
      } finally {
        await database
          .update(allergens)
          .set({ archivedAt: null })
          .where(eq(allergens.id, EGGS));
      }
    });
  });

  describe('creating a Family Ingredient', () => {
    it('with chips is tagged and checked', async () => {
      const row = await made(a, { allergenIds: [PEANUTS, MILK] });
      const stored = await rowOf(a, row.id);
      expect(stored?.allergensChecked).toBe(true);
      expect([...(stored?.allergenIds ?? [])].sort()).toEqual(
        [PEANUTS, MILK].sort(),
      );
    });

    it('with "None" (an empty list) is checked with no tags', async () => {
      const row = await made(a, { allergenIds: [] });
      expect(await rowOf(a, row.id)).toMatchObject({
        allergensChecked: true,
        allergenIds: [],
      });
    });

    it('with the field left out stays Unchecked', async () => {
      const row = await made(a);
      expect(await rowOf(a, row.id)).toMatchObject({
        allergensChecked: false,
        allergenIds: [],
      });
    });

    it('refuses a retired or unknown Allergen and creates nothing', async () => {
      const name = unique('Fia refused');
      await database
        .update(allergens)
        .set({ archivedAt: new Date() })
        .where(eq(allergens.id, EGGS));
      try {
        const retired = await create(a, name, { allergenIds: [EGGS] });
        expect([
          retired.status,
          (retired.body as { code: string }).code,
        ]).toEqual([409, 'catalog.allergen_retired']);
      } finally {
        await database
          .update(allergens)
          .set({ archivedAt: null })
          .where(eq(allergens.id, EGGS));
      }
      const unknown = await create(a, name, {
        allergenIds: ['00000000-0000-4000-8000-000000000000'],
      });
      expect(unknown.status).toBe(404);
      await create(a, name).expect(201);
    });
  });

  describe('tagging from the Family catalog', () => {
    it('tags and re-tags, and "None" counts as checked', async () => {
      const row = await made(a);
      const tagged = await tag(a, row.id, [PEANUTS]).expect(200);
      expect(tagged.body).toEqual({
        id: row.id,
        allergensChecked: true,
        allergenIds: [PEANUTS],
      });
      await tag(a, row.id, [MILK]).expect(200);
      expect(await rowOf(a, row.id)).toMatchObject({
        allergenIds: [MILK],
      });
      await tag(a, row.id, []).expect(200);
      expect(await rowOf(a, row.id)).toMatchObject({
        allergensChecked: true,
        allergenIds: [],
      });
    });

    it('lets any Member of the Family tag it', async () => {
      const row = await made(a);
      await tag(a2, row.id, [MILK]).expect(200);
      expect((await rowOf(a, row.id))?.allergenIds).toEqual([MILK]);
    });

    it('refuses a retired Allergen as a new tag but lets one it has stay', async () => {
      const row = await made(a, { allergenIds: [EGGS] });
      await database
        .update(allergens)
        .set({ archivedAt: new Date() })
        .where(eq(allergens.id, EGGS));
      try {
        await tag(a, row.id, [EGGS, MILK]).expect(200);
        await tag(a, row.id, [EGGS]).expect(200);
        // Still listed, by name, so a Member can untick it.
        const listed = await rowOf(a, row.id);
        expect(listed?.allergens).toEqual([{ id: EGGS, name: 'Eggs' }]);
        const other = await made(a);
        const res = await tag(a, other.id, [EGGS]).expect(409);
        expect((res.body as { code: string }).code).toBe(
          'catalog.allergen_retired',
        );
      } finally {
        await database
          .update(allergens)
          .set({ archivedAt: null })
          .where(eq(allergens.id, EGGS));
      }
    });

    it("keeps another Family's tags private: not listed, not changeable", async () => {
      const row = await made(a, { allergenIds: [PEANUTS] });
      const mine = (await b.get('/catalog/family?locale=en').expect(200))
        .body as {
        ingredients: CatalogRow[];
      };
      expect(mine.ingredients.some((r) => r.id === row.id)).toBe(false);
      await tag(b, row.id, []).expect(404);
      await tag(b, seedId.ingredient('parmesan'), []).expect(404);
      expect((await rowOf(a, row.id))?.allergenIds).toEqual([PEANUTS]);
    });

    it('updates the Allergens of every Recipe using the Ingredient', async () => {
      const row = await made(a);
      const recipe = await familyRecipe(recipesA, row.id);
      expect((await detail(recipesA, recipe.id)).allergens).toMatchObject({
        uncheckedCount: 1,
        items: [],
      });
      await a2
        .put('/settings/allergies', { allergenIds: [PEANUTS] })
        .expect(200);
      const warning = async () =>
        (await detail(recipesA2, recipe.id)).allergyWarning;
      expect(await warning()).toMatchObject({
        severity: 'soft',
        uncheckedCount: 1,
      });
      await tag(a2, row.id, [PEANUTS]).expect(200);
      expect(await warning()).toMatchObject({
        severity: 'strong',
        entries: [{ allergen: { id: PEANUTS }, severity: 'strong' }],
        uncheckedCount: 0,
      });
      const tagged = (await detail(recipesA2, recipe.id)).allergens;
      expect(tagged.uncheckedCount).toBe(0);
      expect(tagged.items.map((i) => i.allergen.id)).toEqual([PEANUTS]);
      await tag(a, row.id, []).expect(200);
      expect(await detail(recipesA, recipe.id)).toMatchObject({
        allergens: { uncheckedCount: 0, items: [] },
      });
      await a2.put('/settings/allergies', { allergenIds: [] }).expect(200);
    });
  });

  describe('promote and merge (ADR 0011)', () => {
    it('promote carries the tags over and flags them for review', async () => {
      const name = unique('Fia promoted');
      const copyA = (
        await create(a, name, { allergenIds: [PEANUTS] }).expect(201)
      ).body as Made;
      await create(b, name, { allergenIds: [MILK] }).expect(201);
      await create(c, name).expect(201);
      await admin
        .post('/admin/family-ingredients/promote', { ingredientId: copyA.id })
        .expect(200);
      const row = await adminRow(copyA.id);
      expect([...row.allergenIds].sort()).toEqual([PEANUTS, MILK].sort());
      expect(row.allergensReviewPending).toBe(true);
      // The merged copy's Family now reads the shared row's tags.
      const recipeB = await familyRecipe(recipesB, copyA.id);
      const seenByB = (await detail(recipesB, recipeB.id)).allergens;
      expect(seenByB.uncheckedCount).toBe(0);
      expect(seenByB.items.map((i) => i.allergen.id).sort()).toEqual(
        [PEANUTS, MILK].sort(),
      );
    });

    it('promoting only Unchecked copies stays Unchecked until the Admin tags it', async () => {
      const name = unique('Fia unchecked promote');
      const copy = (await create(a, name).expect(201)).body as Made;
      await admin
        .post('/admin/family-ingredients/promote', { ingredientId: copy.id })
        .expect(200);
      expect(await adminRow(copy.id)).toMatchObject({
        allergenIds: [],
        allergensReviewPending: true,
      });
      const recipe = await familyRecipe(recipesA, copy.id);
      expect((await detail(recipesA, recipe.id)).allergens.uncheckedCount).toBe(
        1,
      );
      await admin
        .put(`/admin/catalog/ingredients/${copy.id}/allergens`, {
          allergenIds: [],
        })
        .expect(200);
      expect((await detail(recipesA, recipe.id)).allergens.uncheckedCount).toBe(
        0,
      );
    });

    it('merge adds the copies tags to the target (a union) and flags it', async () => {
      const target = (
        await admin
          .post('/admin/catalog/ingredients', {
            leafCategoryId: GROUND_SPICES,
            name: unique('Fia target'),
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Made;
      await admin
        .put(`/admin/catalog/ingredients/${target.id}/allergens`, {
          allergenIds: [MILK],
        })
        .expect(200);
      const copy = await made(a, { allergenIds: [PEANUTS, MILK] });
      await admin
        .post('/admin/family-ingredients/merge', {
          ingredientId: copy.id,
          targetIngredientId: target.id,
        })
        .expect(200);
      const row = await adminRow(target.id);
      expect([...row.allergenIds].sort()).toEqual([PEANUTS, MILK].sort());
      expect(row.allergensReviewPending).toBe(true);
    });

    it('merging checked copies into a promoted Unchecked row makes it checked', async () => {
      const promoted = async () => {
        const copy = await made(a);
        await admin
          .post('/admin/family-ingredients/promote', { ingredientId: copy.id })
          .expect(200);
        return copy;
      };
      for (const extra of [{ allergenIds: [MILK] }, { allergenIds: [] }]) {
        const target = await promoted();
        const recipe = await familyRecipe(recipesA, target.id);
        expect(
          (await detail(recipesA, recipe.id)).allergens.uncheckedCount,
        ).toBe(1);
        const copy = await made(b, extra);
        await admin
          .post('/admin/family-ingredients/merge', {
            ingredientId: copy.id,
            targetIngredientId: target.id,
          })
          .expect(200);
        expect(
          (await detail(recipesA, recipe.id)).allergens.uncheckedCount,
        ).toBe(0);
      }
    });

    it('merge leaves the target alone when the copies add nothing', async () => {
      const target = (
        await admin
          .post('/admin/catalog/ingredients', {
            leafCategoryId: GROUND_SPICES,
            name: unique('Fia plain target'),
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Made;
      const none = await made(a, { allergenIds: [] });
      const unchecked = await made(b);
      for (const copy of [none, unchecked]) {
        await admin
          .post('/admin/family-ingredients/merge', {
            ingredientId: copy.id,
            targetIngredientId: target.id,
          })
          .expect(200);
      }
      expect(await adminRow(target.id)).toMatchObject({
        allergenIds: [],
        allergensReviewPending: false,
      });
    });

    it('the Admin tagging the Ingredient clears the review flag', async () => {
      const name = unique('Fia review');
      const copy = (
        await create(a, name, { allergenIds: [PEANUTS] }).expect(201)
      ).body as Made;
      await admin
        .post('/admin/family-ingredients/promote', { ingredientId: copy.id })
        .expect(200);
      await admin
        .put(`/admin/catalog/ingredients/${copy.id}/allergens`, {
          allergenIds: [PEANUTS],
        })
        .expect(200);
      expect((await adminRow(copy.id)).allergensReviewPending).toBe(false);
      const stored = await database
        .select()
        .from(ingredientAllergens)
        .where(eq(ingredientAllergens.ingredientId, copy.id));
      expect(stored.map((s) => s.allergenId)).toEqual([PEANUTS]);
    });
  });
});
