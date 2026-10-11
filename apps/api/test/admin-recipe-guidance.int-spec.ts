import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  eatingMoments,
  family,
  ingredients,
  recipes,
} from '../src/database/schema';
import { loadCatalogRecipe } from '../src/recipes/recipe-view';
import type { AdminRecipeDetail } from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Recipe guidance (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let catalog: ReturnType<typeof client>;
  let flour: string;
  let familyId: string;
  let familyRecipeId: string;
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const createBase = async () =>
    (
      await admin
        .post('', {
          title: title('Guided'),
          servings: 2,
          lines: [{ ingredientId: flour }],
          steps: [{ text: 'Cook' }],
        })
        .expect(201)
    ).body as AdminRecipeDetail;
  const detail = async (id: string) =>
    (await admin.get(`/${id}`).expect(200)).body as AdminRecipeDetail;
  const moment = async (name: string) =>
    (
      (
        await catalog.post('/eating-moments', {
          name: `${name} ${stamp}-${++n}`,
        })
      ).body as { id: string }
    ).id;
  const pairing = (overrides: Record<string, unknown> = {}) => ({
    kind: 'drink',
    label: 'a glass of dry white wine',
    reason: 'its acidity cuts through the butter',
    ...overrides,
  });

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `guidance-admin-${stamp}@example.com`;
    const cookie = await signUp(app, email, 'Guidance Admin');
    admin = client(app, cookie, '/api/admin/recipes');
    catalog = client(app, cookie, '/api/admin/catalog');
    await promoteToAdmin(database, email);
    [{ id: flour }] = await database
      .select({ id: ingredients.id })
      .from(ingredients)
      .limit(1);
    familyId = crypto.randomUUID();
    await database.insert(family).values({
      id: familyId,
      inviteCode: `g${stamp}`,
      inviteCodeExpiresAt: new Date(),
    });
    familyRecipeId = crypto.randomUUID();
    await database.insert(recipes).values({
      id: familyRecipeId,
      familyId,
      title: title('Family dish'),
      servings: 2,
    });
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    await database.delete(recipes).where(ilike(recipes.title, like));
    await database.delete(family).where(eq(family.id, familyId));
    await database.delete(eatingMoments).where(ilike(eatingMoments.name, like));
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  describe('writing guidance', () => {
    it('stores ordered Pairings, the Nutrition Note and Eating Moment uses', async () => {
      const base = await createBase();
      const dinner = await moment('Dinner');
      const breakfast = await moment('Breakfast');
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: 'Rich in fat; fine as a treat, heavy before sleep.',
          pairings: [
            pairing({ principle: 'acid_cuts_fat', linkedIngredientId: flour }),
            pairing({ kind: 'food', label: 'steamed greens', reason: 'light' }),
          ],
          eatingMoments: [
            { eatingMomentId: dinner, polarity: 'good_for', reason: 'filling' },
            { eatingMomentId: breakfast, polarity: 'avoid' },
          ],
        })
        .expect(200);
      const body = res.body as AdminRecipeDetail;
      expect(body.nutritionNote).toBe(
        'Rich in fat; fine as a treat, heavy before sleep.',
      );
      expect(
        body.pairings.map((p) => [
          p.kind,
          p.label,
          p.principle,
          p.linkedIngredientId,
          p.linkedRecipeId,
        ]),
      ).toEqual([
        ['drink', 'a glass of dry white wine', 'acid_cuts_fat', flour, null],
        ['food', 'steamed greens', null, null, null],
      ]);
      expect(
        body.eatingMoments.map((m) => [m.eatingMomentId, m.polarity, m.reason]),
      ).toEqual([
        [dinner, 'good_for', 'filling'],
        [breakfast, 'avoid', null],
      ]);
      expect(await detail(base.id)).toEqual(body);
    });

    it('keeps Pairing ids that are sent back, reorders, and removes the rest', async () => {
      const base = await createBase();
      const first = (
        await admin
          .put(`/${base.id}/guidance`, {
            nutritionNote: null,
            pairings: [pairing({ label: 'one' }), pairing({ label: 'two' })],
            eatingMoments: [],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      const [one, two] = first.pairings;
      const after = (
        await admin
          .put(`/${base.id}/guidance`, {
            nutritionNote: null,
            pairings: [{ ...pairing({ label: 'two!' }), id: two.id }],
            eatingMoments: [],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(after.pairings.map((p) => [p.id, p.label])).toEqual([
        [two.id, 'two!'],
      ]);
      expect(after.pairings.some((p) => p.id === one.id)).toBe(false);
      const stranger = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [{ ...pairing(), id: crypto.randomUUID() }],
          eatingMoments: [],
        })
        .expect(400);
      expect(code(stranger)).toBe('recipes.item_not_found');
    });

    it('refuses an empty label or reason with the generic validation error', async () => {
      const base = await createBase();
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [pairing({ label: '  ' })],
          eatingMoments: [],
        })
        .expect(400);
    });

    it('returns 404 for an unknown Recipe', async () => {
      await admin
        .put(`/${crypto.randomUUID()}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [],
        })
        .expect(404);
    });
  });

  describe('limits', () => {
    it('refuses more than 10 Pairings', async () => {
      const base = await createBase();
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: Array.from({ length: 11 }, (_, i) =>
            pairing({ label: `p${i}` }),
          ),
          eatingMoments: [],
        })
        .expect(400);
      expect(code(res)).toBe('recipes.pairings_too_many');
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: Array.from({ length: 10 }, (_, i) =>
            pairing({ label: `p${i}` }),
          ),
          eatingMoments: [],
        })
        .expect(200);
    });

    it('refuses more than 10 Eating Moments', async () => {
      const base = await createBase();
      const ids = await Promise.all(
        Array.from({ length: 11 }, (_, i) => moment(`Many${i}`)),
      );
      const uses = (list: string[]) =>
        list.map((eatingMomentId) => ({ eatingMomentId, polarity: 'avoid' }));
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: uses(ids),
        })
        .expect(400);
      expect(code(res)).toBe('recipes.eating_moments_too_many');
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: uses(ids.slice(0, 10)),
        })
        .expect(200);
    });

    it('refuses a Nutrition Note over 500 characters', async () => {
      const base = await createBase();
      const put = (nutritionNote: string) =>
        admin.put(`/${base.id}/guidance`, {
          nutritionNote,
          pairings: [],
          eatingMoments: [],
        });
      const res = await put('x'.repeat(501)).expect(400);
      expect(code(res)).toBe('recipes.nutrition_note_too_long');
      await put('é'.repeat(500)).expect(200);
    });
  });

  describe('Eating Moment uses', () => {
    it('refuses the same Eating Moment twice', async () => {
      const base = await createBase();
      const dinner = await moment('Twice');
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [
            { eatingMomentId: dinner, polarity: 'good_for' },
            { eatingMomentId: dinner, polarity: 'avoid' },
          ],
        })
        .expect(400);
      expect(code(res)).toBe('recipes.eating_moment_duplicate');
    });

    it('refuses an unknown Eating Moment', async () => {
      const base = await createBase();
      const res = await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [
            { eatingMomentId: crypto.randomUUID(), polarity: 'avoid' },
          ],
        })
        .expect(404);
      expect(code(res)).toBe('recipes.eating_moment_not_found');
    });

    it('keeps an archived Eating Moment on the Recipe when guidance is saved again', async () => {
      const base = await createBase();
      const dinner = await moment('Archived');
      const body = {
        nutritionNote: null,
        pairings: [],
        eatingMoments: [{ eatingMomentId: dinner, polarity: 'avoid' }],
      };
      await admin.put(`/${base.id}/guidance`, body).expect(200);
      await catalog.post(`/eating-moments/${dinner}/archive`).expect(200);
      const again = await admin.put(`/${base.id}/guidance`, body).expect(200);
      expect((again.body as AdminRecipeDetail).eatingMoments).toHaveLength(1);
    });
  });

  describe('Pairing link rules', () => {
    const put = (id: string, p: Record<string, unknown>) =>
      admin.put(`/${id}/guidance`, {
        nutritionNote: null,
        pairings: [pairing(p)],
        eatingMoments: [],
      });

    it('links to a Catalog Recipe, including an archived one', async () => {
      const base = await createBase();
      const other = await createBase();
      const res = await put(base.id, { linkedRecipeId: other.id }).expect(200);
      expect((res.body as AdminRecipeDetail).pairings[0].linkedRecipeId).toBe(
        other.id,
      );
      await admin.post(`/${other.id}/archive`).expect(200);
      await put(base.id, { linkedRecipeId: other.id }).expect(200);
    });

    it('refuses a Catalog Recipe linking to Family content', async () => {
      const base = await createBase();
      const res = await put(base.id, {
        linkedRecipeId: familyRecipeId,
      }).expect(409);
      expect(code(res)).toBe('recipes.pairing_link_not_allowed');
    });

    it('refuses linking to both an Ingredient and a Recipe', async () => {
      const base = await createBase();
      const other = await createBase();
      const res = await put(base.id, {
        linkedIngredientId: flour,
        linkedRecipeId: other.id,
      }).expect(400);
      expect(code(res)).toBe('recipes.pairing_link_conflict');
    });

    it('refuses a link to something that does not exist', async () => {
      const base = await createBase();
      for (const key of ['linkedIngredientId', 'linkedRecipeId']) {
        const res = await put(base.id, { [key]: crypto.randomUUID() }).expect(
          404,
        );
        expect(code(res)).toBe('recipes.pairing_link_not_found');
      }
    });

    it('refuses a Recipe linking to itself', async () => {
      const base = await createBase();
      const res = await put(base.id, { linkedRecipeId: base.id }).expect(400);
      expect(code(res)).toBe('recipes.pairing_self_link');
    });
  });

  describe('Admin only', () => {
    it('refuses a Member', async () => {
      const member = client(
        app,
        await signUp(app, `guidance-member-${stamp}@example.com`, 'Member'),
        '/api/admin/recipes',
      );
      await member
        .put(`/${crypto.randomUUID()}/guidance`, {
          nutritionNote: null,
          pairings: [],
          eatingMoments: [],
        })
        .expect(403);
    });
  });
});
