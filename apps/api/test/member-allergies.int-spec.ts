import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes as recipesTable } from '../src/database/schema';
import type {
  AdminRecipeDetail,
  FamilyRecipeEdit,
  RecipeDetail,
} from '../src/recipes/recipes.schemas';
import type { AllergiesView } from '../src/settings/settings.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { storeUiLanguage } from './support/stored-language';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec: #350 / #356, ADR 0014. A Member's Allergies and the Allergy Warning on a Recipe's page.
describe('Allergies and the Allergy Warning (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let memberCookie: string;
  let admin: ReturnType<typeof client>;
  let recipes: ReturnType<typeof client>;
  let settings: ReturnType<typeof client>;
  let otherSettings: ReturnType<typeof client>;
  let ownerFamily: ReturnType<typeof client>;
  let otherFamily: ReturnType<typeof client>;
  let otherRecipes: ReturnType<typeof client>;
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const PARMESAN = seedId.ingredient('parmesan'); // milk
  const PEANUTS = seedId.ingredient('peanuts'); // peanuts
  const ONION = seedId.ingredient('onion');
  const MILK = seedId.allergen('milk');
  const PEANUT = seedId.allergen('peanuts');
  const g = (ingredientId: string, extra: object = {}) => ({
    ingredientId,
    quantity: 100,
    unit: 'g',
    ...extra,
  });

  const detail = async (id: string, query = '', who = recipes) =>
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
  const allergies = async (who = settings) =>
    (await who.get('/allergies').expect(200)).body as AllergiesView;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `allergies-admin-${stamp}@example.com`;
    const cookie = await signUp(app, adminEmail, 'Admin');
    memberCookie = cookie;
    await promoteToAdmin(database, adminEmail);
    admin = client(app, cookie, '/api/admin/recipes');
    recipes = client(app, cookie, '/api/recipes');
    settings = client(app, cookie, '/api/settings');
    ownerFamily = client(app, cookie, '/api/family');
    const otherCookie = await signUp(
      app,
      `allergies-other-${stamp}@example.com`,
      'Other',
    );
    otherSettings = client(app, otherCookie, '/api/settings');
    otherFamily = client(app, otherCookie, '/api/family');
    otherRecipes = client(app, otherCookie, '/api/recipes');
  });

  afterAll(async () => {
    await database
      .delete(recipesTable)
      .where(ilike(recipesTable.title, `%${stamp}-%`));
    await app.close();
  });

  describe('Allergies in Settings', () => {
    it('require authentication', async () => {
      await client(app, '', '/api/settings').get('/allergies').expect(401);
    });

    it('start empty and list the Allergens in the curated order, named in the locale', async () => {
      const view = await allergies();
      expect(view.allergenIds).toEqual([]);
      expect(view.allergens).toHaveLength(14);
      expect(view.allergens[0].name).toBe('Gluten');
      await storeUiLanguage(app, memberCookie, 'ro');
      const ro = (await settings.get('/allergies').expect(200))
        .body as AllergiesView;
      expect(ro.allergens.find((a) => a.id === MILK)?.name).toBe('Lapte');
      await storeUiLanguage(app, memberCookie, 'en');
    });

    it('set, replace and clear the Member own Allergies', async () => {
      const saved = (
        await settings
          .put('/allergies', { allergenIds: [MILK, PEANUT] })
          .expect(200)
      ).body as AllergiesView;
      expect([...saved.allergenIds].sort()).toEqual([MILK, PEANUT].sort());
      expect(await allergies()).toEqual(saved);

      const replaced = (
        await settings.put('/allergies', { allergenIds: [PEANUT] }).expect(200)
      ).body as AllergiesView;
      expect(replaced.allergenIds).toEqual([PEANUT]);

      const cleared = (
        await settings.put('/allergies', { allergenIds: [] }).expect(200)
      ).body as AllergiesView;
      expect(cleared.allergenIds).toEqual([]);
    });

    it('accept a repeated Allergen once and reject an unknown one', async () => {
      const saved = (
        await settings
          .put('/allergies', { allergenIds: [MILK, MILK] })
          .expect(200)
      ).body as AllergiesView;
      expect(saved.allergenIds).toEqual([MILK]);
      await settings
        .put('/allergies', {
          allergenIds: ['00000000-0000-4000-8000-000000000000'],
        })
        .expect(404);
      await settings.put('/allergies', { allergenIds: ['nope'] }).expect(400);
      expect((await allergies()).allergenIds).toEqual([MILK]);
      await settings.put('/allergies', { allergenIds: [] }).expect(200);
    });

    it("cannot change another Member's Allergies: each Member only writes their own", async () => {
      await settings.put('/allergies', { allergenIds: [MILK] }).expect(200);
      await otherSettings
        .put('/allergies', { allergenIds: [PEANUT] })
        .expect(200);
      expect((await allergies()).allergenIds).toEqual([MILK]);
      expect((await allergies(otherSettings)).allergenIds).toEqual([PEANUT]);
      await settings.put('/allergies', { allergenIds: [] }).expect(200);
      await otherSettings.put('/allergies', { allergenIds: [] }).expect(200);
    });

    it('stay with the Member when they leave a Family and join another', async () => {
      await otherSettings
        .put('/allergies', { allergenIds: [PEANUT] })
        .expect(200);
      const family = (await ownerFamily.get('').expect(200)).body as {
        inviteCode: string;
      };
      await otherFamily.post('/join', { code: family.inviteCode }).expect(201);
      expect((await allergies(otherSettings)).allergenIds).toEqual([PEANUT]);
      await otherFamily.post('/leave').expect(200);
      expect((await allergies(otherSettings)).allergenIds).toEqual([PEANUT]);
      await otherSettings.put('/allergies', { allergenIds: [] }).expect(200);
    });
  });

  describe('allergyWarning on Recipe detail', () => {
    beforeEach(async () => {
      await settings.put('/allergies', { allergenIds: [] }).expect(200);
      await otherSettings.put('/allergies', { allergenIds: [] }).expect(200);
    });
    afterAll(async () => {
      await settings.put('/allergies', { allergenIds: [] }).expect(200);
    });
    const setAllergies = (...allergenIds: string[]) =>
      settings.put('/allergies', { allergenIds }).expect(200);

    it('is absent when the Member has no Allergies', async () => {
      const created = await catalogRecipe([g(PARMESAN)]);
      expect((await detail(created.id)).allergyWarning).toBeNull();
    });

    it('is absent when the Recipe holds none of the Member Allergies', async () => {
      await setAllergies(PEANUT);
      const created = await catalogRecipe([g(PARMESAN), g(ONION)]);
      expect((await detail(created.id)).allergyWarning).toBeNull();
    });

    it('is strong when a required line contains an Allergy, naming the Allergen and its lines', async () => {
      await setAllergies(MILK);
      const created = await catalogRecipe([g(ONION), g(PARMESAN)]);
      expect((await detail(created.id)).allergyWarning).toEqual({
        severity: 'strong',
        entries: [
          {
            allergen: { id: MILK, name: 'Milk' },
            owner: { kind: 'own' },
            tier: 'yours',
            severity: 'strong',
            lines: [{ lineId: created.lines[1].id, severity: 'strong' }],
          },
        ],
        uncheckedCount: 0,
      });
    });

    it('names the Allergen in the requested locale', async () => {
      await setAllergies(MILK);
      const created = await catalogRecipe([g(PARMESAN)]);
      await storeUiLanguage(app, memberCookie, 'ro');
      const ro = await detail(created.id);
      expect(ro.allergyWarning?.entries[0].allergen.name).toBe('Lapte');
      await storeUiLanguage(app, memberCookie, 'en');
    });

    it('is soft when only an optional line contains the Allergy', async () => {
      await setAllergies(PEANUT);
      const created = await catalogRecipe([
        g(ONION),
        g(PEANUTS, { optional: true }),
      ]);
      expect((await detail(created.id)).allergyWarning).toEqual({
        severity: 'soft',
        entries: [
          {
            allergen: { id: PEANUT, name: 'Peanuts' },
            owner: { kind: 'own' },
            tier: 'yours',
            severity: 'soft',
            lines: [{ lineId: created.lines[1].id, severity: 'soft' }],
          },
        ],
        uncheckedCount: 0,
      });
    });

    it('is soft for Unchecked lines alone, and only for a Member with an Allergy', async () => {
      const recipe = (
        await otherRecipes
          .post('', {
            title: title('Family'),
            servings: 2,
            locale: 'en',
            parentId: null,
            lines: [g(ONION), { rawName: `Zq mystery ${stamp}` }],
            steps: [{ text: 'Stir' }],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;
      expect(
        (await detail(recipe.id, '', otherRecipes)).allergyWarning,
      ).toBeNull();
      await otherSettings
        .put('/allergies', { allergenIds: [MILK] })
        .expect(200);
      expect(
        (await detail(recipe.id, '', otherRecipes)).allergyWarning,
      ).toEqual({
        severity: 'soft',
        entries: [],
        uncheckedCount: 1,
      });
      await otherSettings.put('/allergies', { allergenIds: [] }).expect(200);
    });

    it('is the viewer own: another Member without the Allergy sees none', async () => {
      await setAllergies(MILK);
      const created = await catalogRecipe([g(PARMESAN)]);
      expect((await detail(created.id)).allergyWarning?.severity).toBe(
        'strong',
      );
      expect(
        (await detail(created.id, '', otherRecipes)).allergyWarning,
      ).toBeNull();
    });

    it('judges a Variant on its own lines', async () => {
      await setAllergies(PEANUT);
      const base = await catalogRecipe([g(PEANUTS), g(ONION)]);
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      const peanutFree = (
        await admin
          .put(`/${variant.id}`, {
            title: variant.title,
            servings: variant.servings,
            tagIds: variant.tagIds,
            lines: [g(ONION)],
            steps: variant.steps.map((step) => ({ ...step })),
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect((await detail(base.id)).allergyWarning?.severity).toBe('strong');
      expect((await detail(peanutFree.id)).allergyWarning).toBeNull();
    });
  });
});
