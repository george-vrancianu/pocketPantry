import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ilike, inArray } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  ingredientAllergens,
  ingredients,
  recipes,
} from '../src/database/schema';
import type {
  AdminRecipeDetail,
  FamilyRecipeEdit,
  RecipeDetail,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { storeUiLanguage } from './support/stored-language';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec: #350 / #353, ADR 0014. A Recipe's Allergens are derived from its lines.
describe('Recipe detail Allergens (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let memberCookie: string;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  let family: ReturnType<typeof client>;
  let familyRecipes: ReturnType<typeof client>;
  const stamp = Date.now();
  let n = 0;
  const familyIngredientIds: string[] = [];
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  // Seed tags: parmesan and butter contain milk, peanuts contain peanuts.
  const PARMESAN = seedId.ingredient('parmesan');
  const BUTTER = seedId.ingredient('butter');
  const PEANUTS = seedId.ingredient('peanuts');
  const ONION = seedId.ingredient('onion');
  const g = (ingredientId: string, extra: object = {}) => ({
    ingredientId,
    quantity: 100,
    unit: 'g',
    ...extra,
  });

  const detail = async (id: string, query = '', who = member) =>
    (await who.get(`/${id}${query}`).expect(200)).body as RecipeDetail;
  const catalogRecipe = async (lines: object[]) =>
    (
      await admin
        .post('', {
          title: title('Catalog'),
          servings: 4,
          lines,
          steps: [{ text: 'Cook' }],
        })
        .expect(201)
    ).body as AdminRecipeDetail;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `allergens-admin-${stamp}@example.com`;
    const cookie = await signUp(app, adminEmail, 'Admin');
    memberCookie = cookie;
    await promoteToAdmin(database, adminEmail);
    admin = client(app, cookie, '/api/admin/recipes');
    member = client(app, cookie, '/api/recipes');
    const familyCookie = await signUp(
      app,
      `allergens-fam-${stamp}@example.com`,
      'Family Member',
    );
    family = client(app, familyCookie, '/api');
    familyRecipes = client(app, familyCookie, '/api/recipes');
  });

  afterAll(async () => {
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    if (familyIngredientIds.length > 0) {
      await database
        .delete(ingredientAllergens)
        .where(inArray(ingredientAllergens.ingredientId, familyIngredientIds));
      await database
        .delete(ingredients)
        .where(inArray(ingredients.id, familyIngredientIds));
    }
    await app.close();
  });

  describe('a Catalog Recipe', () => {
    it('lists each Allergen with its source lines, optional-only flag and no Unchecked lines', async () => {
      const created = await catalogRecipe([
        g(PARMESAN),
        g(BUTTER),
        g(PEANUTS, { optional: true }),
        g(ONION),
      ]);

      const { allergens } = await detail(created.id);

      expect(allergens.uncheckedCount).toBe(0);
      expect(allergens.items).toEqual([
        {
          allergen: { id: seedId.allergen('peanuts'), name: 'Peanuts' },
          lines: [
            {
              id: created.lines[2].id,
              ingredientName: 'Peanuts',
              optional: true,
            },
          ],
          optionalOnly: true,
        },
        {
          allergen: { id: seedId.allergen('milk'), name: 'Milk' },
          lines: [
            {
              id: created.lines[0].id,
              ingredientName: 'Parmesan',
              optional: false,
            },
            {
              id: created.lines[1].id,
              ingredientName: 'Butter',
              optional: false,
            },
          ],
          optionalOnly: false,
        },
      ]);
    });

    it('orders Allergens by the Admin-curated list, not by line order', async () => {
      const created = await catalogRecipe([g(BUTTER), g(PEANUTS)]);
      const { allergens } = await detail(created.id);
      // Peanuts precede Milk in the list, though the Milk line comes first.
      expect(allergens.items.map((i) => i.allergen.name)).toEqual([
        'Peanuts',
        'Milk',
      ]);
    });

    it('has none when no line is tagged, counting shared Ingredients as checked', async () => {
      const created = await catalogRecipe([g(ONION)]);
      expect((await detail(created.id)).allergens).toEqual({
        items: [],
        uncheckedCount: 0,
      });
    });

    it('names Allergens in the requested locale', async () => {
      const created = await catalogRecipe([g(PARMESAN)]);
      await storeUiLanguage(app, memberCookie, 'ro');
      const ro = await detail(created.id);
      expect(ro.allergens.items[0].allergen.name).toBe('Lapte');
      await storeUiLanguage(app, memberCookie, 'da');
      const da = await detail(created.id);
      expect(da.allergens.items[0].allergen.name).toBe('Mælk');
      await storeUiLanguage(app, memberCookie, 'en');
    });
  });

  describe('a Family Recipe', () => {
    it('counts an Unmatched line and an untagged Family Ingredient as Unchecked, and a tagged one as checked', async () => {
      const familyIngredient = async (name: string) => {
        const made = (
          await family
            .post('/catalog/family-ingredients?locale=en', {
              name: `${name} ${stamp}`,
              leafCategoryId: seedId.leaf('hard-cheese'),
              defaultUnit: 'g',
            })
            .expect(201)
        ).body as { id: string };
        familyIngredientIds.push(made.id);
        return made;
      };
      const tagged = await familyIngredient('Zq nut spread');
      const untagged = await familyIngredient('Zq mystery paste');
      await family
        .put(`/catalog/family-ingredients/${tagged.id}/allergens`, {
          allergenIds: [seedId.allergen('peanuts')],
        })
        .expect(200);

      const created = (
        await familyRecipes
          .post('', {
            title: title('Family'),
            servings: 2,
            locale: 'en',
            parentId: null,
            lines: [
              g(PARMESAN),
              g(tagged.id),
              g(untagged.id),
              { rawName: `Zq grandma spice ${stamp}`, optional: true },
            ],
            steps: [{ text: 'Stir' }],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;

      const { allergens } = await detail(created.id, '', familyRecipes);

      expect(allergens.uncheckedCount).toBe(2);
      expect(
        allergens.items.map((item) => [
          item.allergen.name,
          item.lines.map((l) => l.id),
        ]),
      ).toEqual([
        ['Peanuts', [created.lines[1].id]],
        ['Milk', [created.lines[0].id]],
      ]);
    });
  });

  describe('a Variant', () => {
    it('is judged on its own lines, not its base', async () => {
      const base = await catalogRecipe([g(PEANUTS), g(ONION)]);
      const created = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      const peanutFree = (
        await admin
          .put(`/${created.id}`, {
            title: created.title,
            servings: created.servings,
            tagIds: created.tagIds,
            lines: [g(ONION), g(BUTTER)],
            steps: created.steps.map((step) => ({ ...step })),
          })
          .expect(200)
      ).body as AdminRecipeDetail;

      const baseView = await detail(base.id);
      const variantView = await detail(peanutFree.id);

      expect(baseView.allergens.items.map((i) => i.allergen.name)).toEqual([
        'Peanuts',
      ]);
      expect(variantView.allergens.items.map((i) => i.allergen.name)).toEqual([
        'Milk',
      ]);
    });
  });
});
