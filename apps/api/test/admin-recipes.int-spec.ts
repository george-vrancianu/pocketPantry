import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, isNull } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  cuisines,
  ingredients,
  methods,
  recipeIngredientLines,
  recipes,
  shoppingItems,
  shoppingItemSourceRecipes,
  shoppingLists,
  user,
} from '../src/database/schema';
import type {
  AdminRecipeDetail,
  AdminRecipeListItem,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Api = ReturnType<typeof client>;
const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Admin Recipes (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: Api;
  let member: Api;
  let adminEmail: string;
  let salt: string;
  let flour: string;
  let cuisineId: string;
  let methodId: string;
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const doc = (overrides: Record<string, unknown> = {}) => ({
    title: title('Soup'),
    servings: 4,
    lines: [
      { ingredientId: flour, quantity: 200, unit: 'g', note: 'sifted' },
      { ingredientId: salt },
    ],
    steps: [{ text: 'Mix' }, { text: 'Bake', timerSeconds: 600 }],
    ...overrides,
  });

  async function createBase(overrides: Record<string, unknown> = {}) {
    const res = await admin.post('', doc(overrides)).expect(201);
    return res.body as AdminRecipeDetail;
  }
  const detail = async (id: string) =>
    (await admin.get(`/${id}`).expect(200)).body as AdminRecipeDetail;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = (adminEmail = `recipes-admin-${stamp}@example.com`);
    admin = client(
      app,
      await signUp(app, email, 'Recipes Admin'),
      '/api/admin/recipes',
    );
    await promoteToAdmin(database, email);
    member = client(
      app,
      await signUp(app, `recipes-member-${stamp}@example.com`, 'Member'),
      '/api/admin/recipes',
    );
    const rows = await database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(isNull(ingredients.ownerFamilyId))
      .limit(2);
    [flour, salt] = rows.map((r) => r.id);
    cuisineId = crypto.randomUUID();
    methodId = crypto.randomUUID();
    await database.insert(cuisines).values({
      id: cuisineId,
      name: `Cuisine ${stamp}`,
      normalizedName: `cuisine ${stamp}`,
    });
    await database.insert(methods).values({
      id: methodId,
      name: `Method ${stamp}`,
      normalizedName: `method ${stamp}`,
    });
  });

  afterAll(async () => {
    // Variants reference their base, so they go first.
    const like = `%${stamp}%`;
    const all = await database
      .select({ id: recipes.id, parentId: recipes.parentId })
      .from(recipes)
      .where(ilike(recipes.title, like));
    for (const row of all.filter((r) => r.parentId)) {
      await database.delete(recipes).where(eq(recipes.id, row.id));
    }
    await database.delete(recipes).where(ilike(recipes.title, like));
    await database.delete(cuisines).where(eq(cuisines.id, cuisineId));
    await database.delete(methods).where(eq(methods.id, methodId));
    await app.close();
  });

  describe('Base Recipe document', () => {
    it('keeps Recipes Admin-only', async () => {
      await member.get('').expect(403);
      await member.post('', doc()).expect(403);
    });

    it('creates a Base Recipe with ordered lines and steps and reads it back', async () => {
      const created = await createBase({
        prepMinutes: 15,
        cookMinutes: 30,
        difficulty: 'easy',
        cuisineId,
        methodId,
      });
      expect(created).toMatchObject({
        parentId: null,
        servings: 4,
        prepMinutes: 15,
        cookMinutes: 30,
        difficulty: 'easy',
        cuisineId,
        methodId,
        archived: false,
        parentTips: null,
      });
      expect(
        created.lines.map((l) => [
          l.ingredientId,
          l.quantity,
          l.unit,
          l.optional,
          l.note,
        ]),
      ).toEqual([
        [flour, 200, 'g', false, 'sifted'],
        [salt, null, null, false, null],
      ]);
      expect(created.steps.map((s) => [s.text, s.timerSeconds])).toEqual([
        ['Mix', null],
        ['Bake', 600],
      ]);
      expect(await detail(created.id)).toEqual(created);
    });

    it('refuses quantity without unit and unit without quantity with a coded error', async () => {
      const noUnit = await admin
        .post('', doc({ lines: [{ ingredientId: flour, quantity: 2 }] }))
        .expect(400);
      expect(code(noUnit)).toBe('recipes.quantity_unit_mismatch');
      const noQuantity = await admin
        .post('', doc({ lines: [{ ingredientId: flour, unit: 'g' }] }))
        .expect(400);
      expect(code(noQuantity)).toBe('recipes.quantity_unit_mismatch');
    });

    it('refuses a Catalog line without an Ingredient and an unknown Ingredient', async () => {
      const none = await admin
        .post('', doc({ lines: [{ ingredientId: null }] }))
        .expect(400);
      expect(code(none)).toBe('recipes.ingredient_required');
      const unknown = await admin
        .post('', doc({ lines: [{ ingredientId: crypto.randomUUID() }] }))
        .expect(404);
      expect(code(unknown)).toBe('catalog.not_found');
    });

    it('validates servings, minutes and timers', async () => {
      await admin.post('', doc({ servings: 0 })).expect(400);
      await admin.post('', doc({ servings: 1.5 })).expect(400);
      await admin.post('', doc({ prepMinutes: -1 })).expect(400);
      await admin
        .post('', doc({ steps: [{ text: 'x', timerSeconds: -5 }] }))
        .expect(400);
      await admin.post('', doc({ parentId: crypto.randomUUID() })).expect(400);
    });

    it('refuses an unknown Cuisine or Method', async () => {
      await admin.post('', doc({ cuisineId: crypto.randomUUID() })).expect(404);
      await admin.post('', doc({ methodId: crypto.randomUUID() })).expect(404);
    });

    it('edits in place: lines and steps with an id keep it, new ones are inserted, missing ones are deleted', async () => {
      const created = await createBase();
      const [mix, bake] = created.steps;
      const [flourLine] = created.lines;
      const res = await admin
        .put(`/${created.id}`, {
          ...doc({ title: created.title }),
          servings: 6,
          // Reordered, one new step in the middle, "Mix" kept, the salt line dropped.
          steps: [
            { id: bake.id, text: 'Bake longer', timerSeconds: 900 },
            { text: 'Rest' },
            { id: mix.id, text: 'Mix well' },
          ],
          lines: [
            { id: flourLine.id, ingredientId: flour, quantity: 250, unit: 'g' },
            { ingredientId: salt, quantity: 1, unit: 'pcs', optional: true },
          ],
        })
        .expect(200);
      const edited = res.body as AdminRecipeDetail;
      expect(edited.servings).toBe(6);
      expect(edited.steps.map((s) => s.text)).toEqual([
        'Bake longer',
        'Rest',
        'Mix well',
      ]);
      expect(edited.steps[0].id).toBe(bake.id);
      expect(edited.steps[2].id).toBe(mix.id);
      expect(edited.steps[1].id).not.toBe(mix.id);
      expect(edited.lines[0]).toMatchObject({
        id: flourLine.id,
        quantity: 250,
        note: null,
      });
      expect(edited.lines).toHaveLength(2);
      expect(edited.lines[1].id).not.toBe(created.lines[1].id);
      const remaining = await database
        .select({ id: recipeIngredientLines.id })
        .from(recipeIngredientLines)
        .where(eq(recipeIngredientLines.recipeId, created.id));
      expect(remaining).toHaveLength(2);
    });

    it("refuses an id that is not one of the Recipe's lines or steps", async () => {
      const a = await createBase();
      const b = await createBase();
      const res = await admin
        .put(`/${a.id}`, {
          ...doc({ title: a.title }),
          steps: [{ id: b.steps[0].id, text: 'stolen' }],
        })
        .expect(400);
      expect(code(res)).toBe('recipes.item_not_found');
      expect((await detail(b.id)).steps[0].text).toBe('Mix');
    });

    it('lists Recipes, and Base Recipes that are not archived for the Variant picker', async () => {
      const base = await createBase();
      const archivedBase = await createBase();
      await admin.post(`/${archivedBase.id}/archive`).expect(200);
      const all = (await admin.get('').expect(200))
        .body as AdminRecipeListItem[];
      expect(all.find((r) => r.id === archivedBase.id)?.archived).toBe(true);
      expect(all.find((r) => r.id === base.id)?.archived).toBe(false);
      const picker = (
        await admin.get('?baseOnly=true&archived=exclude').expect(200)
      ).body as AdminRecipeListItem[];
      expect(picker.some((r) => r.id === base.id)).toBe(true);
      expect(picker.some((r) => r.id === archivedBase.id)).toBe(false);
    });

    it('archives instead of deleting, and 404s unknown Recipes', async () => {
      const base = await createBase();
      const res = await admin.post(`/${base.id}/archive`).expect(200);
      expect((res.body as AdminRecipeDetail).archived).toBe(true);
      expect(
        await database.select().from(recipes).where(eq(recipes.id, base.id)),
      ).toHaveLength(1);
      await admin.get(`/${crypto.randomUUID()}`).expect(404);
      await admin.post(`/${crypto.randomUUID()}/archive`).expect(404);
    });
  });

  describe('Source Recipes', () => {
    it('point at real Recipes: unknown ids are refused, and the rows go with the Recipe', async () => {
      const [{ familyId }] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, adminEmail));
      const [list] = await database
        .insert(shoppingLists)
        .values({ familyId, status: 'archived' })
        .returning();
      const [item] = await database
        .insert(shoppingItems)
        .values({ listId: list.id, ingredientId: flour })
        .returning();
      await expect(
        database.insert(shoppingItemSourceRecipes).values({
          shoppingItemId: item.id,
          recipeId: crypto.randomUUID(),
        }),
      ).rejects.toThrow();

      const base = await createBase();
      await database
        .insert(shoppingItemSourceRecipes)
        .values({ shoppingItemId: item.id, recipeId: base.id });
      await database.delete(recipes).where(eq(recipes.id, base.id));
      expect(
        await database
          .select()
          .from(shoppingItemSourceRecipes)
          .where(eq(shoppingItemSourceRecipes.shoppingItemId, item.id)),
      ).toEqual([]);
      await database.delete(shoppingLists).where(eq(shoppingLists.id, list.id));
    });
  });
});
