import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, inArray } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  eatingMoments,
  family,
  ingredients,
  recipeIngredientLines,
  recipes,
  unmatchedEntries,
  user,
} from '../src/database/schema';
import type {
  AdminRecipeDetail,
  FamilyRecipeDraft,
  FamilyRecipeEdit,
  RecipeDetail,
  RecipeListItem,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Family Recipes (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let adminRecipes: ReturnType<typeof client>;
  let a1: ReturnType<typeof client>;
  let a2: ReturnType<typeof client>;
  let b: ReturnType<typeof client>;
  let adminCookie: string;
  let cookieOf: Record<string, string>;
  let familyA: string;
  let momentId: string;
  let ing: string[];
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const line = (i: number, quantity = 100) => ({
    ingredientId: ing[i],
    quantity,
    unit: 'g',
  });

  async function catalogBase(overrides: Record<string, unknown> = {}) {
    const res = await admin.post('', {
      title: title('Cat base'),
      servings: 4,
      lines: [line(0), line(1)],
      steps: [{ text: 'Mix' }, { text: 'Bake' }],
      ...overrides,
    });
    expect(res.status).toBe(201);
    return res.body as AdminRecipeDetail;
  }

  const doc = (parentId: string | null, overrides = {}) => ({
    title: title('Fam'),
    servings: 2,
    locale: 'en',
    parentId,
    lines: [line(0, 50)],
    steps: [{ text: 'Whisk' }],
    ...overrides,
  });

  async function familyRecipe(
    who: ReturnType<typeof client>,
    parentId: string | null,
    overrides = {},
  ) {
    const res = await who.post('', doc(parentId, overrides));
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    return res.body as FamilyRecipeEdit;
  }

  const unmatchedFor = (lineId: string) =>
    database
      .select()
      .from(unmatchedEntries)
      .where(eq(unmatchedEntries.ingredientLineId, lineId));

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `fam-recipes-admin-${stamp}@example.com`;
    adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, adminCookie, '/api/admin/recipes');
    adminRecipes = client(app, adminCookie, '/api/recipes');
    const emails = {
      a1: `fam-recipes-a1-${stamp}@example.com`,
      a2: `fam-recipes-a2-${stamp}@example.com`,
      b: `fam-recipes-b-${stamp}@example.com`,
    };
    cookieOf = {
      a1: await signUp(app, emails.a1, 'A1'),
      a2: await signUp(app, emails.a2, 'A2'),
      b: await signUp(app, emails.b, 'B'),
    };
    a1 = client(app, cookieOf.a1, '/api/recipes');
    a2 = client(app, cookieOf.a2, '/api/recipes');
    b = client(app, cookieOf.b, '/api/recipes');
    // a2 joins a1's Family.
    const invite = (
      await client(app, cookieOf.a1, '/api/family').get('').expect(200)
    ).body as { inviteCode: string };
    await client(app, cookieOf.a2, '/api/family')
      .post('/join', { code: invite.inviteCode })
      .expect(201);
    const [row] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, emails.a1));
    familyA = row.familyId;
    momentId = crypto.randomUUID();
    await database.insert(eatingMoments).values({
      id: momentId,
      name: `Moment ${stamp}`,
      normalizedName: `moment ${stamp}`,
      sortOrder: 1000,
    });
    ing = (
      await database.select({ id: ingredients.id }).from(ingredients).limit(5)
    ).map((r) => r.id);
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    const all = await database
      .select({ id: recipes.id, parentId: recipes.parentId })
      .from(recipes)
      .where(ilike(recipes.title, like));
    for (const row of all.filter((r) => r.parentId)) {
      await database.delete(recipes).where(eq(recipes.id, row.id));
    }
    await database.delete(recipes).where(ilike(recipes.title, like));
    await database.delete(eatingMoments).where(eq(eatingMoments.id, momentId));
    await app.close();
  });

  describe('variant draft', () => {
    it('copies a Catalog base as a draft without ids, under that base', async () => {
      const base = await catalogBase({
        prepMinutes: 5,
        difficulty: 'easy',
        lines: [line(0), { note: 'diced', optional: true, ...line(1, 2) }],
        steps: [{ text: 'Mix', timerSeconds: 30 }, { text: 'Bake' }],
      });
      await admin
        .post(`/${base.id}/tips`, {
          text: 'Base tip',
          stepId: base.steps[0].id,
        })
        .expect(201);
      const draft = (await a1.get(`/${base.id}/variant-draft`).expect(200))
        .body as FamilyRecipeDraft;
      expect(draft).toMatchObject({
        parentId: base.id,
        title: base.title,
        servings: 4,
        prepMinutes: 5,
        difficulty: 'easy',
        steps: [
          { text: 'Mix', timerSeconds: 30 },
          { text: 'Bake', timerSeconds: null },
        ],
      });
      expect(draft.lines[1]).toMatchObject({
        ingredientId: ing[1],
        rawName: null,
        quantity: 2,
        optional: true,
        note: 'diced',
      });
      expect(draft.lines[1].ingredientName).toBeTruthy();
      expect(JSON.stringify(draft)).not.toContain(base.steps[0].id);
      expect(JSON.stringify(draft)).not.toContain('Base tip');
    });

    it('from a Variant copies the Variant content but points at its base', async () => {
      const base = await catalogBase();
      const cv = (
        await admin.post(`/${base.id}/variants`, { title: title('Cat var') })
      ).body as AdminRecipeDetail;
      await admin
        .put(`/${cv.id}`, {
          title: cv.title,
          servings: 7,
          lines: [line(2, 9)],
          steps: [{ text: 'Variant step' }],
        })
        .expect(200);
      const draft = (await a1.get(`/${cv.id}/variant-draft`).expect(200))
        .body as FamilyRecipeDraft;
      expect(draft).toMatchObject({
        parentId: base.id,
        servings: 7,
        steps: [{ text: 'Variant step' }],
      });
      expect(draft.lines).toHaveLength(1);
      expect(draft.lines[0].ingredientId).toBe(ing[2]);
    });

    it("is hidden for another Family's Recipe and unknown ids", async () => {
      const mine = await familyRecipe(a1, null);
      await b.get(`/${mine.id}/variant-draft`).expect(404);
      expect(code(await b.get(`/${mine.id}/variant-draft`).expect(404))).toBe(
        'recipes.not_found',
      );
      await b.get(`/${crypto.randomUUID()}/variant-draft`).expect(404);
    });
  });

  describe('create, edit and archive', () => {
    it('lets any Member of the Family create, edit and archive a Variant', async () => {
      const base = await catalogBase();
      const created = await familyRecipe(a1, base.id, {
        cuisineId: null,
        lines: [line(0, 50), { rawName: `Zq grandma spice ${stamp}` }],
      });
      expect(created).toMatchObject({
        parentId: base.id,
        archived: false,
        servings: 2,
      });
      expect(created.lines[1]).toMatchObject({
        ingredientId: null,
        rawName: `Zq grandma spice ${stamp}`,
        ingredientName: `Zq grandma spice ${stamp}`,
      });

      const edit = (await a2.get(`/${created.id}/edit`).expect(200))
        .body as FamilyRecipeEdit;
      expect(edit.id).toBe(created.id);
      expect(edit.lines[0].ingredientName).toBeTruthy();

      const updated = (
        await a2
          .put(`/${created.id}`, {
            title: `${created.title} v2`,
            servings: 3,
            locale: 'en',
            lines: [
              {
                id: edit.lines[0].id,
                ingredientId: edit.lines[0].ingredientId,
                quantity: 75,
                unit: 'g',
              },
              { id: edit.lines[1].id, rawName: `Zq grandma spice ${stamp}` },
              line(1),
            ],
            steps: [{ id: edit.steps[0].id, text: 'Whisk hard' }],
          })
          .expect(200)
      ).body as FamilyRecipeEdit;
      expect(updated.title).toBe(`${created.title} v2`);
      expect(updated.lines.map((l) => l.id).slice(0, 2)).toEqual([
        edit.lines[0].id,
        edit.lines[1].id,
      ]);
      expect(updated.lines[0].quantity).toBe(75);
      expect(updated.lines).toHaveLength(3);
      expect(updated.steps[0]).toMatchObject({
        id: edit.steps[0].id,
        text: 'Whisk hard',
      });

      const archived = (await a1.post(`/${created.id}/archive`).expect(200))
        .body as FamilyRecipeEdit;
      expect(archived.archived).toBe(true);
      // Archived, never removed.
      const [row] = await database
        .select()
        .from(recipes)
        .where(eq(recipes.id, created.id));
      expect(row.archivedAt).not.toBeNull();
    });

    it('creates a standalone Family Base Recipe', async () => {
      const created = await familyRecipe(a1, null);
      expect(created.parentId).toBeNull();
      const res = (await a1.get(`/${created.id}`).expect(200))
        .body as RecipeDetail;
      expect(res).toMatchObject({ owner: 'family', parentId: null });
    });

    it('refuses a Variant of a Variant, and parents the Family cannot use', async () => {
      const base = await catalogBase();
      const fv = await familyRecipe(a1, base.id);
      const res = await a1.post('', doc(fv.id)).expect(409);
      expect(code(res)).toBe('recipes.variant_of_variant');
      const cv = (
        await admin.post(`/${base.id}/variants`, { title: title('Cat var') })
      ).body as AdminRecipeDetail;
      expect(code(await a1.post('', doc(cv.id)).expect(409))).toBe(
        'recipes.variant_of_variant',
      );
      const otherBase = await familyRecipe(b, null);
      expect(code(await a1.post('', doc(otherBase.id)).expect(404))).toBe(
        'recipes.parent_not_found',
      );
      await a1.post('', doc(crypto.randomUUID())).expect(404);
    });

    it('validates lines: ingredient xor raw name, quantity with unit', async () => {
      const bad = async (lines: object[], expected: string) =>
        expect(code(await a1.post('', doc(null, { lines })).expect(400))).toBe(
          expected,
        );
      await bad([{}], 'recipes.ingredient_required');
      await bad(
        [{ ingredientId: ing[0], rawName: 'x' }],
        'recipes.line_name_conflict',
      );
      await bad(
        [{ rawName: 'salt', quantity: 1 }],
        'recipes.quantity_unit_mismatch',
      );
      await bad([{ rawName: '!!!' }], 'recipes.ingredient_required');
    });

    it('keeps Family Variants readable and editable after the Catalog base is archived', async () => {
      const base = await catalogBase();
      const fv = await familyRecipe(a1, base.id);
      await admin.post(`/${base.id}/archive`, {}).expect(200);
      const read = (await a1.get(`/${fv.id}`).expect(200)).body as RecipeDetail;
      expect(read.base).toMatchObject({ id: base.id, archived: true });
      await a1
        .put(`/${fv.id}`, {
          title: `${fv.title} edited`,
          servings: 2,
          locale: 'en',
          lines: [],
          steps: [],
        })
        .expect(200);
      expect(code(await a1.post('', doc(base.id)).expect(409))).toBe(
        'recipes.parent_archived',
      );
    });
  });

  describe('visibility', () => {
    it('shows a Family Variant under its base and in filtered lists to its Family only', async () => {
      const base = await catalogBase();
      const fv = await familyRecipe(a1, base.id);

      const detail = (await a2.get(`/${base.id}`).expect(200))
        .body as RecipeDetail;
      expect(detail.variants).toEqual([
        expect.objectContaining({ id: fv.id, owner: 'family' }),
      ]);
      const search = async (who: typeof a1) =>
        (
          (await who.get(`?search=${encodeURIComponent(fv.title)}`).expect(200))
            .body as { recipes: RecipeListItem[] }
        ).recipes;
      expect(await search(a2)).toEqual([
        expect.objectContaining({ id: fv.id, owner: 'family' }),
      ]);
      expect(await search(b)).toEqual([]);
      const otherDetail = (await b.get(`/${base.id}`).expect(200))
        .body as RecipeDetail;
      expect(otherDetail.variants).toEqual([]);
    });

    it('is invisible to another Family for read, edit, update, archive and tips', async () => {
      const base = await catalogBase();
      const fv = await familyRecipe(a1, base.id);
      await b.get(`/${fv.id}`).expect(404);
      await b.get(`/${fv.id}/edit`).expect(404);
      await b
        .put(`/${fv.id}`, {
          title: 'x',
          servings: 1,
          locale: 'en',
          lines: [],
          steps: [],
        })
        .expect(404);
      await b.post(`/${fv.id}/archive`).expect(404);
      await b.post(`/${fv.id}/tips`, { text: 'x' }).expect(404);
      await b.put(`/${fv.id}/hidden-tips`, { tipIds: [] }).expect(404);
    });

    it('cannot edit Catalog Recipes through the Member endpoints', async () => {
      const base = await catalogBase();
      await a1.get(`/${base.id}/edit`).expect(404);
      await a1
        .put(`/${base.id}`, {
          title: 'x',
          servings: 1,
          locale: 'en',
          lines: [],
          steps: [],
        })
        .expect(404);
      await a1.post(`/${base.id}/archive`).expect(404);
      await a1.post(`/${base.id}/tips`, { text: 'x' }).expect(404);
    });

    it('is invisible to the Admin endpoints, even for an Admin of that Family', async () => {
      const base = await catalogBase();
      const fv = await familyRecipe(adminRecipes, base.id);
      const listed = (await admin.get('').expect(200)).body as { id: string }[];
      expect(listed.map((r) => r.id)).not.toContain(fv.id);
      await admin.get(`/${fv.id}`).expect(404);
      await admin
        .put(`/${fv.id}`, { title: 'x', servings: 1, lines: [], steps: [] })
        .expect(404);
      await admin.post(`/${fv.id}/archive`, {}).expect(404);
      await admin.post(`/${fv.id}/variants`, { title: 'x' }).expect(404);
      await admin.post(`/${fv.id}/tips`, { text: 'x' }).expect(404);
      await admin.put(`/${fv.id}/hidden-tips`, { tipIds: [] }).expect(404);
      await admin.put(`/${fv.id}/translations/ro`, { title: 'x' }).expect(404);
    });
  });

  describe('Tips', () => {
    it('manages Family Tips and hides inherited base Tips', async () => {
      const base = await catalogBase();
      const baseTip = (
        await admin.post(`/${base.id}/tips`, { text: 'Base-wide tip' })
      ).body as AdminRecipeDetail;
      const fv = await familyRecipe(a1, base.id);

      let view = (
        await a2.post(`/${fv.id}/tips`, { text: 'Own one' }).expect(201)
      ).body as FamilyRecipeEdit;
      view = (
        await a2
          .post(`/${fv.id}/tips`, {
            text: 'Step tip',
            stepId: view.steps[0].id,
          })
          .expect(201)
      ).body as FamilyRecipeEdit;
      expect(view.tips.map((t) => t.text)).toEqual(['Own one', 'Step tip']);
      expect(view.parentTips).toEqual([
        expect.objectContaining({ id: baseTip.tips[0].id, hidden: false }),
      ]);

      view = (
        await a1
          .put(`/${fv.id}/tips/order`, {
            ids: [view.tips[1].id, view.tips[0].id],
          })
          .expect(200)
      ).body as FamilyRecipeEdit;
      expect(view.tips.map((t) => t.text)).toEqual(['Step tip', 'Own one']);
      view = (
        await a1
          .patch(`/${fv.id}/tips/${view.tips[1].id}`, { text: 'Renamed' })
          .expect(200)
      ).body as FamilyRecipeEdit;
      expect(view.tips[1].text).toBe('Renamed');

      await a1
        .put(`/${fv.id}/hidden-tips`, { tipIds: [baseTip.tips[0].id] })
        .expect(200);
      const read = (await a1.get(`/${fv.id}`).expect(200)).body as RecipeDetail;
      expect(read.tips.map((t) => t.text)).not.toContain('Base-wide tip');
      // The base is untouched.
      const baseRead = (await a1.get(`/${base.id}`).expect(200))
        .body as RecipeDetail;
      expect(baseRead.tips.map((t) => t.text)).toContain('Base-wide tip');

      await a2.del(`/${fv.id}/tips/${view.tips[0].id}`).expect(204);
      await b.del(`/${fv.id}/tips/${view.tips[1].id}`).expect(404);
    });
  });

  describe('Unmatched names', () => {
    it('queues raw lines, replaces the entry on rename and drops it when matched or deleted', async () => {
      const raw = `Zq rare herb ${stamp}`;
      const created = await familyRecipe(a1, null, {
        locale: 'ro',
        lines: [{ rawName: raw, quantity: 1, unit: 'pcs' }, line(0)],
      });
      const first = await unmatchedFor(created.lines[0].id);
      expect(first).toHaveLength(1);
      expect(first[0]).toMatchObject({
        source: 'recipe',
        rawName: raw,
        locale: 'ro',
      });
      expect(await unmatchedFor(created.lines[1].id)).toHaveLength(0);

      const put = async (lines: object[]) =>
        (
          await a1
            .put(`/${created.id}`, {
              title: created.title,
              servings: 2,
              locale: 'ro',
              lines,
              steps: [],
            })
            .expect(200)
        ).body as FamilyRecipeEdit;

      // Unchanged name keeps its entry.
      await put([{ id: created.lines[0].id, rawName: raw }]);
      expect((await unmatchedFor(created.lines[0].id))[0].id).toBe(first[0].id);

      // Renamed: replaced.
      const renamed = `${raw} fresh`;
      await put([{ id: created.lines[0].id, rawName: renamed }]);
      const second = await unmatchedFor(created.lines[0].id);
      expect(second).toHaveLength(1);
      expect(second[0]).toMatchObject({ rawName: renamed });
      expect(second[0].id).not.toBe(first[0].id);

      // Now matched: gone.
      await put([{ id: created.lines[0].id, ingredientId: ing[3] }]);
      expect(await unmatchedFor(created.lines[0].id)).toHaveLength(0);

      // Raw again, then deleted: gone.
      const again = await put([{ rawName: `${raw} again` }]);
      expect(await unmatchedFor(again.lines[0].id)).toHaveLength(1);
      await put([]);
      expect(await unmatchedFor(again.lines[0].id)).toHaveLength(0);
    });

    it('is relinked by the Admin queue, keeping quantity and unit', async () => {
      const raw = `Zq relink me ${stamp}`;
      const created = await familyRecipe(a1, null, {
        lines: [{ rawName: raw, quantity: 3, unit: 'pcs' }],
      });
      const { normalizedName } = (
        await database
          .select()
          .from(recipeIngredientLines)
          .where(eq(recipeIngredientLines.id, created.lines[0].id))
      )[0];
      const res = await client(app, adminCookie, '/api/admin/unmatched').post(
        '/resolve',
        { normalizedName, ingredientId: ing[4] },
      );
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ relinkedRecipeLines: 1 });
      const view = (await a1.get(`/${created.id}/edit`).expect(200))
        .body as FamilyRecipeEdit;
      expect(view.lines[0]).toMatchObject({
        ingredientId: ing[4],
        rawName: null,
        quantity: 3,
        unit: 'pcs',
      });
      expect(await unmatchedFor(created.lines[0].id)).toHaveLength(0);
    });
  });

  describe('review rules', () => {
    it('only takes Catalog bases as parents and drafts', async () => {
      const base = await catalogBase();
      const standalone = await familyRecipe(a1, null);
      expect(code(await a1.post('', doc(standalone.id)).expect(404))).toBe(
        'recipes.parent_not_found',
      );
      expect(
        code(await a1.get(`/${standalone.id}/variant-draft`).expect(404)),
      ).toBe('recipes.parent_not_found');
      const fv = await familyRecipe(a1, base.id);
      const draft = (await a1.get(`/${fv.id}/variant-draft`).expect(200))
        .body as FamilyRecipeDraft;
      expect(draft.parentId).toBe(base.id);
    });

    it('refuses a draft under an archived base', async () => {
      const base = await catalogBase();
      const fv = await familyRecipe(a1, base.id);
      await admin.post(`/${base.id}/archive`, {}).expect(200);
      for (const id of [base.id, fv.id]) {
        expect(code(await a1.get(`/${id}/variant-draft`).expect(409))).toBe(
          'recipes.parent_archived',
        );
      }
    });

    it('keeps the first archive time', async () => {
      const created = await familyRecipe(a1, null);
      const first = (await a1.post(`/${created.id}/archive`).expect(200))
        .body as FamilyRecipeEdit;
      const second = (await a2.post(`/${created.id}/archive`).expect(200))
        .body as FamilyRecipeEdit;
      expect(second.archivedAt).toBe(first.archivedAt);
    });

    it('requires the locale in Family bodies', async () => {
      const { locale, ...noLocale } = doc(null);
      void locale;
      await a1.post('', noLocale).expect(400);
    });

    it('refuses bad hidden Tips and foreign Tips with coded errors', async () => {
      const base = await catalogBase();
      const baseStepTip = (
        await admin.post(`/${base.id}/tips`, {
          text: 'Step',
          stepId: base.steps[0].id,
        })
      ).body as AdminRecipeDetail;
      const fv = await familyRecipe(a1, base.id);
      const own = (await a1.post(`/${fv.id}/tips`, { text: 'Own' }).expect(201))
        .body as FamilyRecipeEdit;
      const sibling = await familyRecipe(a1, base.id);
      const siblingTip = (
        await a1.post(`/${sibling.id}/tips`, { text: 'Other' }).expect(201)
      ).body as FamilyRecipeEdit;

      for (const tipId of [
        baseStepTip.tips[0].id,
        own.tips[0].id,
        siblingTip.tips[0].id,
      ]) {
        expect(
          code(
            await a1
              .put(`/${fv.id}/hidden-tips`, { tipIds: [tipId] })
              .expect(400),
          ),
        ).toBe('recipes.bad_hidden_tip');
      }
      expect(
        code(
          await a1
            .patch(`/${fv.id}/tips/${siblingTip.tips[0].id}`, { text: 'x' })
            .expect(404),
        ),
      ).toBe('recipes.tip_not_found');
      await a1.del(`/${fv.id}/tips/${siblingTip.tips[0].id}`).expect(404);
      expect(
        code(
          await a1
            .put(`/${fv.id}/tips/order`, {
              ids: [own.tips[0].id, siblingTip.tips[0].id],
            })
            .expect(409),
        ),
      ).toBe('recipes.tip_order_stale');
    });
  });

  describe('Pantry matching', () => {
    it('matches a Family line saved by name against the Family Pantry only', async () => {
      const raw = `Zq pantry sumac ${stamp}`;
      const created = await familyRecipe(a1, null, {
        lines: [{ rawName: raw, quantity: 1, unit: 'pcs' }, line(0)],
      });
      const [{ leaf }] = await database
        .select({ leaf: ingredients.leafCategoryId })
        .from(ingredients)
        .where(eq(ingredients.id, ing[0]));
      await database.insert(batches).values({
        familyId: familyA,
        ingredientId: null,
        unmatched: true,
        rawName: ` ${raw.toUpperCase()} `,
        leafCategoryId: leaf,
        location: 'fridge',
        quantity: 2,
        unit: 'pcs',
      });
      const matchFor = async (who: typeof a1) =>
        who.get(`/${created.id}/pantry-match?today=2026-10-12`);
      const mine = await matchFor(a2);
      expect(mine.status).toBe(200);
      const lines = (
        mine.body as { lines: { lineId: string; status: string }[] }
      ).lines;
      expect(lines.find((l) => l.lineId === created.lines[0].id)?.status).toBe(
        'covered',
      );
      expect((await matchFor(b)).status).toBe(404);
      await b
        .post(`/${created.id}/add-missing?locale=en`, { today: '2026-10-12' })
        .expect(404);
    });
  });

  describe('guidance', () => {
    const guidance = (extra: object[] = []) => ({
      nutritionNote: 'Rich in protein; go easy on salt.',
      pairings: [
        {
          kind: 'drink',
          label: 'Dry white',
          reason: 'Acid cuts the fat',
          principle: 'acid_cuts_fat',
        },
        ...extra,
      ],
      eatingMoments: [
        { eatingMomentId: momentId, polarity: 'good_for', reason: 'Brunch' },
      ],
    });

    it('writes and reads Family guidance through its own endpoint', async () => {
      const created = await familyRecipe(a1, null);
      const view = (
        await a2
          .put(`/${created.id}/guidance?locale=en`, guidance())
          .expect(200)
      ).body as FamilyRecipeEdit;
      expect(view).toMatchObject({
        nutritionNote: 'Rich in protein; go easy on salt.',
        pairings: [{ label: 'Dry white', kind: 'drink' }],
        eatingMoments: [{ eatingMomentId: momentId, polarity: 'good_for' }],
      });
      const read = (await a1.get(`/${created.id}`).expect(200))
        .body as RecipeDetail;
      expect(read.guidance.nutritionNote).toBe(view.nutritionNote);
      expect(read.guidance.eatingMoments[0]).toMatchObject({
        reason: 'Brunch',
      });
      // A PUT of the document leaves the guidance alone.
      await a1
        .put(`/${created.id}`, {
          title: created.title,
          servings: 2,
          locale: 'en',
          lines: [],
          steps: [],
        })
        .expect(200);
      expect(
        (
          (await a1.get(`/${created.id}/edit`).expect(200))
            .body as FamilyRecipeEdit
        ).pairings,
      ).toHaveLength(1);
    });

    it("links Catalog Recipes and own Recipes, never another Family's", async () => {
      const base = await catalogBase();
      const mine = await familyRecipe(a1, null);
      const theirs = await familyRecipe(b, null);
      const target = await familyRecipe(a1, null);
      const link = (linkedRecipeId: string) =>
        a1.put(`/${target.id}/guidance`, {
          nutritionNote: null,
          eatingMoments: [],
          pairings: [
            {
              kind: 'food',
              label: 'Side',
              reason: 'Goes well',
              linkedRecipeId,
            },
          ],
        });
      await link(base.id).expect(200);
      await link(mine.id).expect(200);
      const refused = await link(theirs.id).expect(409);
      expect(code(refused)).toBe('recipes.pairing_link_not_allowed');
    });

    it('copies guidance into the draft and saves it with the Variant', async () => {
      const base = await catalogBase();
      await admin
        .put(`/${base.id}/guidance`, {
          nutritionNote: 'Base note',
          pairings: [
            {
              kind: 'food',
              label: 'Salad',
              reason: 'Fresh',
              linkedIngredientId: ing[1],
            },
          ],
          eatingMoments: [
            { eatingMomentId: momentId, polarity: 'avoid', reason: null },
          ],
        })
        .expect(200);
      const draft = (await a1.get(`/${base.id}/variant-draft`).expect(200))
        .body as FamilyRecipeDraft;
      expect(draft.guidance).toEqual({
        nutritionNote: 'Base note',
        pairings: [
          {
            kind: 'food',
            label: 'Salad',
            reason: 'Fresh',
            principle: null,
            linkedIngredientId: ing[1],
            linkedRecipeId: null,
          },
        ],
        eatingMoments: [
          { eatingMomentId: momentId, polarity: 'avoid', reason: null },
        ],
      });
      const { guidance: draftGuidance, ...rest } = draft;
      const saved = (
        await a1
          .post('', {
            ...rest,
            guidance: draftGuidance,
            locale: 'en',
            lines: [],
            steps: [],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;
      expect(saved.nutritionNote).toBe('Base note');
      expect(saved.pairings).toHaveLength(1);
      expect(saved.eatingMoments).toHaveLength(1);
    });

    it('is invisible to other Families and to the Admin endpoint', async () => {
      const created = await familyRecipe(a1, null);
      const body = { nutritionNote: null, pairings: [], eatingMoments: [] };
      await b.put(`/${created.id}/guidance`, body).expect(404);
      await admin.put(`/${created.id}/guidance`, body).expect(404);
      const base = await catalogBase();
      await a1.put(`/${base.id}/guidance`, body).expect(404);
    });
  });

  describe('Family deletion', () => {
    it('cascades to Recipes, lines, Tips and Unmatched entries', async () => {
      const email = `fam-recipes-c-${stamp}@example.com`;
      const cookie = await signUp(app, email, 'C');
      const c = client(app, cookie, '/api/recipes');
      const [{ familyId: abandoned }] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, email));
      const base = await catalogBase();
      const fv = await familyRecipe(c, base.id, {
        lines: [{ rawName: `Zq cascade ${stamp}` }, line(0)],
      });
      await c.post(`/${fv.id}/tips`, { text: 'tip' }).expect(201);
      expect(await unmatchedFor(fv.lines[0].id)).toHaveLength(1);

      const invite = (
        await client(app, cookieOf.a1, '/api/family').get('').expect(200)
      ).body as { inviteCode: string };
      await client(app, cookie, '/api/family')
        .post('/join', { code: invite.inviteCode })
        .expect(201);

      expect(
        await database.select().from(family).where(eq(family.id, abandoned)),
      ).toEqual([]);
      expect(
        await database.select().from(recipes).where(eq(recipes.id, fv.id)),
      ).toEqual([]);
      expect(
        await database
          .select()
          .from(recipeIngredientLines)
          .where(
            inArray(
              recipeIngredientLines.id,
              fv.lines.map((l) => l.id),
            ),
          ),
      ).toEqual([]);
      expect(await unmatchedFor(fv.lines[0].id)).toEqual([]);
      // The Catalog base is untouched, and the Family still exists for A.
      await a1.get(`/${base.id}`).expect(200);
      expect(familyA).toBeDefined();
    });
  });
});
