import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { familyAllergies, recipes } from '../src/database/schema';
import type {
  AdminRecipeDetail,
  RecipeDetail,
} from '../src/recipes/recipes.schemas';
import type {
  FamilyAllergiesView,
  FamilyAllergyView,
} from '../src/settings/settings.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec: #350 / #357, ADR 0014, ADR 0001. Family Allergies, other Members' Allergies
// and the named Allergy Warning.
const anyId = expect.any(String) as string;

describe('Family Allergies and other Members Allergies (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let alphaSettings: ReturnType<typeof client>;
  let alphaRecipes: ReturnType<typeof client>;
  let benSettings: ReturnType<typeof client>;
  let benRecipes: ReturnType<typeof client>;
  let outsiderSettings: ReturnType<typeof client>;
  let outsiderRecipes: ReturnType<typeof client>;
  const stamp = Date.now();
  let n = 0;

  const MILK = seedId.allergen('milk');
  const PEANUT = seedId.allergen('peanuts');
  const GLUTEN = seedId.allergen('gluten');
  const EGG = seedId.allergen('eggs');
  const g = (slug: string, extra: object = {}) => ({
    ingredientId: seedId.ingredient(slug),
    quantity: 100,
    unit: 'g',
    ...extra,
  });

  const view = async (who = alphaSettings, query = '') =>
    (await who.get(`/family-allergies${query}`).expect(200))
      .body as FamilyAllergiesView;
  const add = async (allergenId: string, label?: string, who = alphaSettings) =>
    (await who.post('/family-allergies', { allergenId, label }).expect(201))
      .body as FamilyAllergyView;
  const mine = (...ids: string[]) =>
    alphaSettings.put('/allergies', { allergenIds: ids }).expect(200);
  const bens = (...ids: string[]) =>
    benSettings.put('/allergies', { allergenIds: ids }).expect(200);
  const clearFamilyAllergies = async (who = alphaSettings) => {
    for (const row of (await view(who)).familyAllergies) {
      await who.del(`/family-allergies/${row.id}`).expect(200);
    }
  };

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `fam-allergies-alpha-${stamp}@example.com`;
    const cookie = await signUp(app, adminEmail, 'Alpha');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, cookie, '/api/admin/recipes');
    alphaSettings = client(app, cookie, '/api/settings');
    alphaRecipes = client(app, cookie, '/api/recipes');
    const family = (
      await client(app, cookie, '/api/family').get('').expect(200)
    ).body as { inviteCode: string };
    const benCookie = await signUp(
      app,
      `fam-allergies-ben-${stamp}@example.com`,
      'Ben',
    );
    benSettings = client(app, benCookie, '/api/settings');
    benRecipes = client(app, benCookie, '/api/recipes');
    await client(app, benCookie, '/api/family')
      .post('/join', { code: family.inviteCode })
      .expect(201);
    const outsiderCookie = await signUp(
      app,
      `fam-allergies-outsider-${stamp}@example.com`,
      'Outsider',
    );
    outsiderSettings = client(app, outsiderCookie, '/api/settings');
    outsiderRecipes = client(app, outsiderCookie, '/api/recipes');
  });

  afterAll(async () => {
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await app.close();
  });

  describe('Family Allergies in Settings', () => {
    afterEach(async () => {
      await clearFamilyAllergies();
    });

    it('require authentication', async () => {
      const anon = client(app, '', '/api/settings');
      await anon.get('/family-allergies').expect(401);
      await anon.post('/family-allergies', { allergenId: MILK }).expect(401);
    });

    it('start empty, with the Allergen list named in the locale', async () => {
      const empty = await view();
      expect(empty.familyAllergies).toEqual([]);
      expect(empty.allergens).toHaveLength(14);
      const ro = await view(alphaSettings, '?locale=ro');
      expect(ro.allergens.find((a) => a.id === MILK)?.name).toBe('Lapte');
    });

    it('lets any Member add one with a label, and the other Member sees it', async () => {
      const created = await add(PEANUT, '  Mia  ');
      expect(created.allergen).toEqual({ id: PEANUT, name: 'Peanuts' });
      expect(created.label).toBe('Mia');
      const bens = await add(MILK, undefined, benSettings);
      expect(bens.label).toBeNull();
      const seen = (await view(benSettings)).familyAllergies;
      expect(seen.map((r) => r.id).sort()).toEqual(
        [created.id, bens.id].sort(),
      );
    });

    it('treats a blank label as none', async () => {
      expect((await add(MILK, '   ')).label).toBeNull();
    });

    it('lets several share an Allergen with different labels, but not repeat one', async () => {
      await add(MILK, 'Mia');
      await add(MILK, 'Leo');
      await add(MILK);
      await alphaSettings
        .post('/family-allergies', { allergenId: MILK, label: 'Mia' })
        .expect(409);
      await alphaSettings
        .post('/family-allergies', { allergenId: MILK })
        .expect(409);
      expect((await view()).familyAllergies).toHaveLength(3);
    });

    it('rejects an unknown Allergen, a bad id and an over-long label', async () => {
      await alphaSettings
        .post('/family-allergies', {
          allergenId: '00000000-0000-4000-8000-000000000000',
        })
        .expect(404);
      await alphaSettings
        .post('/family-allergies', { allergenId: 'nope' })
        .expect(400);
      await alphaSettings
        .post('/family-allergies', { allergenId: MILK, label: 'x'.repeat(61) })
        .expect(400);
    });

    it('lets any Member remove one', async () => {
      const created = await add(GLUTEN, 'Mia');
      await benSettings.del(`/family-allergies/${created.id}`).expect(200);
      expect((await view()).familyAllergies).toEqual([]);
      await benSettings.del(`/family-allergies/${created.id}`).expect(404);
    });

    it('never shows or changes them for another Family', async () => {
      const created = await add(PEANUT, 'Mia');
      expect((await view(outsiderSettings)).familyAllergies).toEqual([]);
      await outsiderSettings.del(`/family-allergies/${created.id}`).expect(404);
      const theirs = await add(MILK, 'Zed', outsiderSettings);
      expect((await view()).familyAllergies.map((r) => r.id)).toEqual([
        created.id,
      ]);
      await alphaSettings.del(`/family-allergies/${theirs.id}`).expect(404);
      await clearFamilyAllergies(outsiderSettings);
    });
  });

  describe("other Members' Allergies", () => {
    afterEach(async () => {
      await mine();
      await bens();
    });

    it("lists the other Members' Allergies, not the viewer's own", async () => {
      await mine(MILK);
      await bens(GLUTEN, EGG);
      const fromAlpha = (await view()).members;
      expect(fromAlpha).toHaveLength(1);
      expect(fromAlpha[0].name).toBe('Ben');
      expect(fromAlpha[0].allergens.map((a) => a.id).sort()).toEqual(
        [GLUTEN, EGG].sort(),
      );
      const fromBen = (await view(benSettings)).members;
      expect(fromBen.map((m) => m.name)).toEqual(['Alpha']);
      expect(fromBen[0].allergens).toEqual([{ id: MILK, name: 'Milk' }]);
    });

    it('is read-only: a Member can only change their own, whatever the request', async () => {
      await bens(GLUTEN);
      // The only write route is the caller's own; there is none for another Member.
      await alphaSettings
        .put('/family-allergies/members', { allergenIds: [] })
        .expect(404);
      await alphaSettings
        .put('/allergies', { allergenIds: [], memberId: 'x' })
        .expect(200);
      expect((await view()).members[0].allergens.map((a) => a.id)).toEqual([
        GLUTEN,
      ]);
    });

    it('never shows another Family Members', async () => {
      await bens(GLUTEN);
      expect((await view(outsiderSettings)).members).toEqual([]);
    });
  });

  describe('deleted with the Family', () => {
    it('removes the rows when the Family is deleted', async () => {
      const ownerCookie = await signUp(
        app,
        `fam-allergies-doomed-${stamp}-${++n}@example.com`,
        'Doomed',
      );
      const settings = client(app, ownerCookie, '/api/settings');
      const familyApi = client(app, ownerCookie, '/api/family');
      const { id } = (await familyApi.get('').expect(200)).body as {
        id: string;
      };
      await add(MILK, 'Mia', settings);
      await add(PEANUT, undefined, settings);
      await familyApi.del('').expect(200);
      expect(
        await database
          .select()
          .from(familyAllergies)
          .where(eq(familyAllergies.familyId, id)),
      ).toEqual([]);
      expect((await view(settings)).familyAllergies).toEqual([]);
    });
  });

  describe('the named Allergy Warning on Recipe detail', () => {
    afterEach(async () => {
      await mine();
      await bens();
      await clearFamilyAllergies();
    });

    const feast = async () =>
      (
        await admin
          .post('', {
            title: `Feast ${stamp}-${++n}`,
            servings: 4,
            lines: [g('parmesan'), g('peanuts'), g('flour'), g('eggs')],
            steps: [{ text: 'Cook' }],
          })
          .expect(201)
      ).body as AdminRecipeDetail;
    const warning = async (id: string, who = alphaRecipes) =>
      ((await who.get(`/${id}`).expect(200)).body as RecipeDetail)
        .allergyWarning;
    const named = (w: Awaited<ReturnType<typeof warning>>) =>
      w?.entries.map((e) => [e.allergen.name, e.owner]);

    it("names the viewer's own and Family Allergies first, then other Members'", async () => {
      await mine(MILK);
      await bens(GLUTEN);
      await add(PEANUT, 'Mia');
      const recipe = await feast();
      const w = await warning(recipe.id);
      expect(w?.severity).toBe('strong');
      expect(named(w)).toEqual([
        ['Milk', { kind: 'own' }],
        ['Peanuts', { kind: 'family', label: 'Mia' }],
        ['Gluten', { kind: 'member', memberId: anyId, name: 'Ben' }],
      ]);
      expect(w?.entries.map((e) => e.tier)).toEqual([
        'yours',
        'yours',
        'members',
      ]);
      expect(w?.entries[2].lines).toEqual([
        { lineId: recipe.lines[2].id, severity: 'strong' },
      ]);
    });

    it('counts Family Allergies as every Members own, and names the other Member to Ben', async () => {
      await mine(MILK);
      await bens(GLUTEN);
      await add(PEANUT, 'Mia');
      const recipe = await feast();
      expect(named(await warning(recipe.id, benRecipes))).toEqual([
        ['Gluten', { kind: 'own' }],
        ['Peanuts', { kind: 'family', label: 'Mia' }],
        ['Milk', { kind: 'member', memberId: anyId, name: 'Alpha' }],
      ]);
    });

    it('warns on a Family Allergy alone, unlabeled too', async () => {
      await add(EGG);
      const recipe = await feast();
      expect(named(await warning(recipe.id))).toEqual([
        ['Eggs', { kind: 'family', label: null }],
      ]);
    });

    it('lists each person with the same Allergen', async () => {
      await mine(MILK);
      await add(MILK, 'Mia');
      await bens(MILK);
      const recipe = await feast();
      expect(named(await warning(recipe.id))).toEqual([
        ['Milk', { kind: 'own' }],
        ['Milk', { kind: 'family', label: 'Mia' }],
        ['Milk', { kind: 'member', memberId: anyId, name: 'Ben' }],
      ]);
    });

    it('stays soft when an Allergy is only in an optional line', async () => {
      await bens(PEANUT);
      const recipe = (
        await admin
          .post('', {
            title: `Soft ${stamp}-${++n}`,
            servings: 2,
            lines: [g('flour'), g('peanuts', { optional: true })],
            steps: [{ text: 'Cook' }],
          })
          .expect(201)
      ).body as AdminRecipeDetail;
      const w = await warning(recipe.id);
      expect(w?.severity).toBe('soft');
      expect(named(w)).toEqual([
        ['Peanuts', { kind: 'member', memberId: anyId, name: 'Ben' }],
      ]);
    });

    it("does not leak into another Family's Recipe page", async () => {
      await mine(MILK);
      await add(PEANUT, 'Mia');
      await bens(GLUTEN);
      const recipe = await feast();
      expect(await warning(recipe.id, outsiderRecipes)).toBeNull();
    });
  });
  describe('Catalog Language', () => {
    it('names the Allergen list in the Catalog Language, or the UI Language when it is empty', async () => {
      const email = `fam-allergies-lang-${stamp}@example.com`;
      const cookie = await signUp(app, email, 'Lang');
      const settings = client(app, cookie, '/api/settings');
      const named = async () =>
        (
          (await settings.get('/allergies?locale=en').expect(200)).body as {
            allergens: Array<{ id: string; name: string }>;
          }
        ).allergens.find((a) => a.id === MILK)?.name;

      await settings
        .put('/preferences', { locale: 'en', catalogLanguage: 'ro' })
        .expect(200);
      expect(await named()).toBe('Lapte');
      const familyView = (
        await settings.get('/family-allergies?locale=en').expect(200)
      ).body as FamilyAllergiesView;
      expect(familyView.allergens.find((a) => a.id === MILK)?.name).toBe(
        'Lapte',
      );

      await settings.put('/preferences', { catalogLanguage: null }).expect(200);
      expect(await named()).toBe('Milk');
    });
  });
});
