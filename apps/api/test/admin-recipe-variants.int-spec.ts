import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  ingredients,
  recipeStepTranslations,
  recipes,
} from '../src/database/schema';
import { loadCatalogRecipe } from '../src/recipes/recipe-view';
import type { AdminRecipeDetail } from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Recipe Variants, Tips and translations (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let flour: string;
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const detail = async (id: string) =>
    (await admin.get(`/${id}`).expect(200)).body as AdminRecipeDetail;

  /** A Base Recipe with two Steps, a Step Tip on the first and two Recipe-level Tips. */
  async function baseWithTips() {
    const created = (
      await admin
        .post('', {
          title: title('Base'),
          servings: 4,
          difficulty: 'medium',
          lines: [
            { ingredientId: flour, quantity: 100, unit: 'g', note: 'sifted' },
          ],
          steps: [{ text: 'Mix' }, { text: 'Bake', timerSeconds: 60 }],
        })
        .expect(201)
    ).body as AdminRecipeDetail;
    await admin
      .post(`/${created.id}/tips`, { text: 'Use cold butter' })
      .expect(201);
    await admin
      .post(`/${created.id}/tips`, { text: 'Rest the dough' })
      .expect(201);
    await admin
      .post(`/${created.id}/tips`, {
        text: 'Do not overmix',
        stepId: created.steps[0].id,
      })
      .expect(201);
    return detail(created.id);
  }

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `variants-admin-${stamp}@example.com`;
    admin = client(
      app,
      await signUp(app, email, 'Variants Admin'),
      '/api/admin/recipes',
    );
    await promoteToAdmin(database, email);
    [{ id: flour }] = await database
      .select({ id: ingredients.id })
      .from(ingredients)
      .limit(1);
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    const rows = await database
      .select({ id: recipes.id, parentId: recipes.parentId })
      .from(recipes)
      .where(ilike(recipes.title, like));
    for (const row of rows.filter((r) => r.parentId)) {
      await database.delete(recipes).where(eq(recipes.id, row.id));
    }
    await database.delete(recipes).where(ilike(recipes.title, like));
    await app.close();
  });

  describe('making a Variant', () => {
    it('copies metadata, lines, Steps with new ids and Step Tips re-anchored, but not Recipe-level Tips', async () => {
      const base = await baseWithTips();
      const res = await admin
        .post(`/${base.id}/variants`, { title: title('Variant') })
        .expect(201);
      const variant = res.body as AdminRecipeDetail;

      expect(variant).toMatchObject({
        parentId: base.id,
        servings: 4,
        difficulty: 'medium',
        archived: false,
      });
      expect(
        variant.lines.map((l) => [l.ingredientId, l.quantity, l.unit, l.note]),
      ).toEqual([[flour, 100, 'g', 'sifted']]);
      expect(variant.lines[0].id).not.toBe(base.lines[0].id);
      expect(variant.steps.map((s) => [s.text, s.timerSeconds])).toEqual([
        ['Mix', null],
        ['Bake', 60],
      ]);
      const baseStepIds = new Set(base.steps.map((s) => s.id));
      expect(variant.steps.every((s) => !baseStepIds.has(s.id))).toBe(true);
      // Only the Step Tip is copied, anchored to the new first Step.
      expect(variant.tips.map((t) => [t.text, t.stepId])).toEqual([
        ['Do not overmix', variant.steps[0].id],
      ]);
      expect(variant.parentTips?.map((t) => [t.text, t.hidden])).toEqual([
        ['Use cold butter', false],
        ['Rest the dough', false],
      ]);
    });

    it('is independent of the base afterwards', async () => {
      const base = await baseWithTips();
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      await admin
        .put(`/${base.id}`, {
          title: base.title,
          servings: 8,
          steps: [{ text: 'Changed' }],
          lines: [],
        })
        .expect(200);
      const after = await detail(variant.id);
      expect(after.servings).toBe(4);
      expect(after.steps.map((s) => s.text)).toEqual(['Mix', 'Bake']);
      expect(after.lines).toHaveLength(1);
    });

    it('copies the translations of copied Steps, line notes and Step Tips', async () => {
      const base = await baseWithTips();
      await admin
        .put(`/${base.id}/translations/ro`, {
          title: 'Baza',
          steps: { [base.steps[0].id]: 'Amesteca' },
          lines: { [base.lines[0].id]: 'cernuta' },
          tips: {
            [base.tips.find((t) => t.stepId)!.id]: 'Nu amesteca prea mult',
          },
        })
        .expect(200);
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      expect(variant.translations.ro).toEqual({
        // The Variant has its own title: it is not translated yet.
        title: null,
        steps: { [variant.steps[0].id]: 'Amesteca' },
        lines: { [variant.lines[0].id]: 'cernuta' },
        tips: { [variant.tips[0].id]: 'Nu amesteca prea mult' },
      });
    });

    it('refuses a Variant of a Variant, of an archived base and of nothing, with coded errors', async () => {
      const base = await baseWithTips();
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      const nested = await admin
        .post(`/${variant.id}/variants`, { title: title('Nested') })
        .expect(409);
      expect(code(nested)).toBe('recipes.variant_of_variant');

      const other = await baseWithTips();
      await admin.post(`/${other.id}/archive`).expect(200);
      const archived = await admin
        .post(`/${other.id}/variants`, { title: title('Late') })
        .expect(409);
      expect(code(archived)).toBe('recipes.parent_archived');

      const missing = await admin
        .post(`/${crypto.randomUUID()}/variants`, { title: title('Ghost') })
        .expect(404);
      expect(code(missing)).toBe('recipes.parent_not_found');
    });

    it('keeps the Variant working when its base is archived', async () => {
      const base = await baseWithTips();
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      await admin.post(`/${base.id}/archive`).expect(200);
      const after = await detail(variant.id);
      expect(after.archived).toBe(false);
      expect(after.parentId).toBe(base.id);
      await admin
        .put(`/${variant.id}`, {
          title: variant.title,
          servings: 2,
          steps: [],
          lines: [],
        })
        .expect(200);
    });

    it('never changes the parent: the document refuses parentId', async () => {
      const base = await baseWithTips();
      const other = await baseWithTips();
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      await admin
        .put(`/${variant.id}`, {
          title: variant.title,
          servings: 2,
          parentId: other.id,
        })
        .expect(400);
      expect((await detail(variant.id)).parentId).toBe(base.id);
    });
  });

  describe('Steps and Tips', () => {
    it('keeps Step Tips on their Step when Steps are reordered, and drops them with a deleted Step', async () => {
      const base = await baseWithTips();
      const [mix, bake] = base.steps;
      const reordered = (
        await admin
          .put(`/${base.id}`, {
            title: base.title,
            servings: 4,
            lines: [],
            steps: [
              { id: bake.id, text: bake.text },
              { id: mix.id, text: mix.text },
            ],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(reordered.steps.map((s) => s.id)).toEqual([bake.id, mix.id]);
      expect(reordered.tips.find((t) => t.stepId)?.stepId).toBe(mix.id);

      const dropped = (
        await admin
          .put(`/${base.id}`, {
            title: base.title,
            servings: 4,
            lines: [],
            steps: [{ id: bake.id, text: bake.text }],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(dropped.tips.map((t) => t.text)).toEqual([
        'Use cold butter',
        'Rest the dough',
      ]);
    });

    it('refuses a Tip anchored to a Step of another Recipe', async () => {
      const a = await baseWithTips();
      const b = await baseWithTips();
      const res = await admin
        .post(`/${a.id}/tips`, { text: 'x', stepId: b.steps[0].id })
        .expect(400);
      expect(code(res)).toBe('recipes.bad_step_anchor');
      const tip = a.tips[0];
      const move = await admin
        .patch(`/${a.id}/tips/${tip.id}`, { stepId: b.steps[0].id })
        .expect(400);
      expect(code(move)).toBe('recipes.bad_step_anchor');
    });

    it('updates, moves, reorders and deletes Tips', async () => {
      const base = await baseWithTips();
      const [first, second, stepTip] = base.tips;
      const edited = (
        await admin
          .patch(`/${base.id}/tips/${first.id}`, { text: 'Colder butter' })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(edited.tips[0].text).toBe('Colder butter');

      const reordered = (
        await admin
          .put(`/${base.id}/tips/order`, {
            ids: [stepTip.id, second.id, first.id],
          })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(reordered.tips.map((t) => t.id)).toEqual([
        stepTip.id,
        second.id,
        first.id,
      ]);
      const stale = await admin
        .put(`/${base.id}/tips/order`, { ids: [first.id] })
        .expect(409);
      expect(code(stale)).toBe('recipes.tip_order_stale');

      const moved = (
        await admin
          .patch(`/${base.id}/tips/${second.id}`, { stepId: base.steps[1].id })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(moved.tips.find((t) => t.id === second.id)?.stepId).toBe(
        base.steps[1].id,
      );
      const unanchored = (
        await admin
          .patch(`/${base.id}/tips/${second.id}`, { stepId: null })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(
        unanchored.tips.find((t) => t.id === second.id)?.stepId,
      ).toBeNull();

      await admin.del(`/${base.id}/tips/${first.id}`).expect(204);
      expect((await detail(base.id)).tips.map((t) => t.id)).not.toContain(
        first.id,
      );
      await admin.del(`/${base.id}/tips/${first.id}`).expect(404);
    });
  });

  describe('inherited Tips', () => {
    it('hides and unhides base Recipe-level Tips on a Variant, live', async () => {
      const base = await baseWithTips();
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      const [butter, rest] = base.tips;

      const hidden = (
        await admin
          .put(`/${variant.id}/hidden-tips`, { tipIds: [butter.id] })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(hidden.parentTips?.map((t) => [t.text, t.hidden])).toEqual([
        ['Use cold butter', true],
        ['Rest the dough', false],
      ]);
      const resolved = await loadCatalogRecipe(database, variant.id, 'en');
      expect(resolved?.tips.map((t) => [t.text, t.inherited])).toEqual([
        ['Rest the dough', true],
        ['Do not overmix', false],
      ]);

      // A Tip added to the base later is inherited live.
      await admin.post(`/${base.id}/tips`, { text: 'Chill first' }).expect(201);
      const live = await loadCatalogRecipe(database, variant.id, 'en');
      expect(live?.tips.map((t) => t.text)).toEqual([
        'Rest the dough',
        'Chill first',
        'Do not overmix',
      ]);

      const cleared = (
        await admin
          .put(`/${variant.id}/hidden-tips`, { tipIds: [] })
          .expect(200)
      ).body as AdminRecipeDetail;
      expect(cleared.parentTips?.every((t) => !t.hidden)).toBe(true);
      expect(rest.id).toBeDefined();
    });

    it('refuses hiding a Step Tip, a Tip of another Recipe, or hiding on a Base Recipe', async () => {
      const base = await baseWithTips();
      const other = await baseWithTips();
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Variant') })
          .expect(201)
      ).body as AdminRecipeDetail;
      const stepTip = base.tips.find((t) => t.stepId)!;
      for (const tipIds of [
        [stepTip.id],
        [other.tips[0].id],
        [variant.tips[0].id],
      ]) {
        const res = await admin
          .put(`/${variant.id}/hidden-tips`, { tipIds })
          .expect(400);
        expect(code(res)).toBe('recipes.bad_hidden_tip');
      }
      const onBase = await admin
        .put(`/${base.id}/hidden-tips`, { tipIds: [] })
        .expect(400);
      expect(code(onBase)).toBe('recipes.bad_hidden_tip');
    });
  });

  describe('translations', () => {
    it('stores per-locale text, resolves with fallback to the source and deletes on null', async () => {
      const base = await baseWithTips();
      const stepTip = base.tips.find((t) => t.stepId)!;
      const res = await admin
        .put(`/${base.id}/translations/ro`, {
          title: 'Supa',
          steps: { [base.steps[0].id]: 'Amesteca' },
          tips: { [base.tips[0].id]: 'Foloseste unt rece' },
        })
        .expect(200);
      expect((res.body as AdminRecipeDetail).translations.ro.title).toBe(
        'Supa',
      );

      const ro = await loadCatalogRecipe(database, base.id, 'ro');
      expect(ro?.title).toBe('Supa');
      // Translated where there is a translation, source text elsewhere.
      expect(ro?.steps.map((s) => s.text)).toEqual(['Amesteca', 'Bake']);
      expect(ro?.lines[0].note).toBe('sifted');
      expect(ro?.tips.map((t) => t.text)).toEqual([
        'Foloseste unt rece',
        'Rest the dough',
        stepTip.text,
      ]);
      const da = await loadCatalogRecipe(database, base.id, 'da');
      expect(da?.title).toBe(base.title);
      expect(da?.steps.map((s) => s.text)).toEqual(['Mix', 'Bake']);
      expect(da?.lines[0].ingredientName).toBeTruthy();

      await admin
        .put(`/${base.id}/translations/ro`, {
          title: null,
          steps: { [base.steps[0].id]: null },
        })
        .expect(200);
      const cleared = await loadCatalogRecipe(database, base.id, 'ro');
      expect(cleared?.title).toBe(base.title);
      expect(cleared?.steps[0].text).toBe('Mix');
    });

    it('refuses the source locale, unknown locales and ids of another Recipe', async () => {
      const a = await baseWithTips();
      const b = await baseWithTips();
      const en = await admin
        .put(`/${a.id}/translations/en`, { title: 'x' })
        .expect(400);
      expect(code(en)).toBe('recipes.source_locale');
      await admin.put(`/${a.id}/translations/fr`, { title: 'x' }).expect(400);
      const foreign = await admin
        .put(`/${a.id}/translations/ro`, { steps: { [b.steps[0].id]: 'x' } })
        .expect(400);
      expect(code(foreign)).toBe('recipes.item_not_found');
      const rows = await database
        .select()
        .from(recipeStepTranslations)
        .where(eq(recipeStepTranslations.stepId, b.steps[0].id));
      expect(rows).toEqual([]);
    });

    it('returns null for an unknown Recipe', async () => {
      expect(
        await loadCatalogRecipe(database, crypto.randomUUID(), 'en'),
      ).toBeNull();
    });
  });
});
