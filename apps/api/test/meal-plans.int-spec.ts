import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { mealPlans, recipes, user } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

type Plan = {
  id: string;
  name: string | null;
  startDate: string;
  days: number;
  servings: number;
};
type Slot = {
  dayIndex: number;
  date: string;
  mealtime: string;
  recipeId: string;
  recipeTitle: string;
  servings: number;
  servingsOverride: number | null;
  unavailable: boolean;
  status: string | null;
  issues: unknown[];
};
type PlanDetail = Plan & { slots: Slot[]; forecast: unknown };

const TODAY = '2030-01-10';
const at = (offset: number) =>
  new Date(Date.parse(`${TODAY}T00:00:00Z`) + offset * 86_400_000)
    .toISOString()
    .slice(0, 10);

describe('Meal Plans (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const stamp = Date.now();
  let n = 0;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
  });
  afterAll(async () => {
    // A slot's Recipe FK has no cascade: plans first, then the Recipes this suite made.
    const owners = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(ilike(user.email, `mp-%-${stamp}-%`));
    for (const { familyId } of owners) {
      await database.delete(mealPlans).where(eq(mealPlans.familyId, familyId));
    }
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await app.close();
  });

  async function member(label: string) {
    const email = `mp-${label}-${stamp}-${++n}@example.com`;
    const cookie = await signUp(app, email, label);
    return { email, cookie, api: client(app, cookie, '/api/meal-plans') };
  }
  type Api = Awaited<ReturnType<typeof member>>['api'];

  async function join(joiner: { cookie: string }, owner: { cookie: string }) {
    const { inviteCode } = (
      await client(app, owner.cookie, '/api/family').get('').expect(200)
    ).body as { inviteCode: string };
    await client(app, joiner.cookie, '/api/family')
      .post('/join', { code: inviteCode })
      .expect(201);
  }

  const q = `?locale=en&today=${TODAY}`;
  const code = (res: { body: unknown }) => (res.body as { code: string }).code;
  const params = (res: { body: unknown }) =>
    (res.body as { params: Record<string, unknown> }).params;

  async function create(api: Api, body: Record<string, unknown> = {}) {
    const res = await api.post(`${q}`, {
      startDate: TODAY,
      days: 3,
      ...body,
    });
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    const { slots, forecast, ...plan } = res.body as PlanDetail;
    expect(slots).toEqual([]);
    expect(forecast).toBeDefined();
    return plan;
  }

  async function catalogRecipe(archived = false) {
    const id = crypto.randomUUID();
    await database.insert(recipes).values({
      id,
      title: `Catalog dish ${stamp}-${++n}`,
      servings: 4,
      archivedAt: archived ? new Date() : null,
    });
    return id;
  }

  describe('create, list, read, update and delete', () => {
    it('lets any Member create, list, read, rename and delete; servings default to the Family size', async () => {
      const ana = await member('ana');
      const bob = await member('bob');
      await join(bob, ana);

      const made = await create(ana.api, { name: '  Normal week  ' });
      expect(made).toMatchObject({
        name: 'Normal week',
        startDate: TODAY,
        days: 3,
        servings: 2,
      });

      const listed = (await bob.api.get(`${q}`).expect(200)).body as {
        mealPlans: Plan[];
      };
      expect(listed.mealPlans).toEqual([made]);

      const read = (await bob.api.get(`/${made.id}${q}`).expect(200))
        .body as PlanDetail;
      expect(read).toMatchObject({ ...made, slots: [] });

      const renamed = (
        await bob.api
          .patch(`/${made.id}${q}`, { name: 'Holiday', servings: 6 })
          .expect(200)
      ).body as PlanDetail;
      expect(renamed).toMatchObject({ name: 'Holiday', servings: 6 });

      const cleared = (
        await ana.api.patch(`/${made.id}${q}`, { name: null }).expect(200)
      ).body as PlanDetail;
      expect(cleared.name).toBeNull();

      await bob.api.del(`/${made.id}${q}`).expect(204);
      await ana.api.get(`/${made.id}${q}`).expect(404);
    });

    it('takes the servings from the request when given, and refuses a long name or out-of-range numbers', async () => {
      const { api } = await member('opts');
      expect((await create(api, { servings: 5 })).servings).toBe(5);
      await api
        .post(`${q}`, { startDate: at(5), days: 1, name: 'x'.repeat(61) })
        .expect(400);
      await api.post(`${q}`, { startDate: at(5), days: 0 }).expect(400);
      await api.post(`${q}`, { startDate: at(5), days: 8 }).expect(400);
      await api
        .post(`${q}`, { startDate: at(5), days: 1, servings: 1001 })
        .expect(400);
      await api
        .post(`${q}`, { startDate: at(5), days: 1, servings: 0 })
        .expect(400);
    });

    it('lists newest start date first', async () => {
      const { api } = await member('order');
      const early = await create(api, { startDate: at(0), days: 2 });
      const late = await create(api, { startDate: at(10), days: 2 });
      const mid = await create(api, { startDate: at(5), days: 2 });
      const listed = (await api.get(`${q}`).expect(200)).body as {
        mealPlans: Plan[];
      };
      expect(listed.mealPlans.map((p) => p.id)).toEqual([
        late.id,
        mid.id,
        early.id,
      ]);
    });

    it("answers 404 for another Family's plan on read, update and delete", async () => {
      const owner = await member('owner');
      const other = await member('other');
      const made = await create(owner.api);
      await other.api.get(`/${made.id}${q}`).expect(404);
      await other.api.patch(`/${made.id}${q}`, { name: 'x' }).expect(404);
      await other.api.del(`/${made.id}${q}`).expect(404);
      expect(
        (
          (await other.api.get(`${q}`).expect(200)).body as {
            mealPlans: Plan[];
          }
        ).mealPlans,
      ).toEqual([]);
    });

    it('refuses an 11th plan with the cap', async () => {
      const { api } = await member('cap');
      for (let i = 0; i < 10; i++) {
        await create(api, { startDate: at(i), days: 1 });
      }
      const refused = await api
        .post(`${q}`, { startDate: at(12), days: 1 })
        .expect(409);
      expect(code(refused)).toBe('meal_plan.cap_reached');
      expect(params(refused)).toEqual({ cap: 10 });
    });
  });

  describe('start date', () => {
    it('allows today up to today + 14 and refuses the past and further ahead', async () => {
      const { api } = await member('start');
      await create(api, { startDate: at(14), days: 1 });
      await create(api, { startDate: at(0), days: 1 });
      expect(
        code(
          await api.post(`${q}`, { startDate: at(-1), days: 1 }).expect(400),
        ),
      ).toBe('meal_plan.start_date_in_past');
      expect(
        code(
          await api.post(`${q}`, { startDate: at(15), days: 1 }).expect(400),
        ),
      ).toBe('meal_plan.start_date_too_far');
    });

    it('falls back to the UTC date when the client sends no today', async () => {
      const { api } = await member('utc');
      const utc = new Date().toISOString().slice(0, 10);
      await api.post('', { startDate: utc, days: 1 }).expect(201);
      const yesterday = new Date(Date.now() - 2 * 86_400_000)
        .toISOString()
        .slice(0, 10);
      await api.post('', { startDate: yesterday, days: 1 }).expect(400);
    });
  });

  describe('no overlap', () => {
    it('refuses overlapping plans on create, naming the other plan, but lets plans touch at the edges', async () => {
      const { api } = await member('overlap');
      const first = await create(api, {
        name: 'First',
        startDate: at(0),
        days: 3,
      });
      const refused = await api
        .post(`${q}`, { startDate: at(2), days: 2 })
        .expect(409);
      expect(code(refused)).toBe('meal_plan.overlap');
      expect(params(refused)).toEqual({
        id: first.id,
        name: 'First',
        startDate: at(0),
        days: 3,
      });
      await api.post(`${q}`, { startDate: at(1), days: 1 }).expect(409);
      await create(api, { startDate: at(3), days: 2 });
    });

    it('checks on moving the start date and on lengthening, and allows a plan to move over itself', async () => {
      const { api } = await member('overlap2');
      const a = await create(api, { startDate: at(0), days: 3 });
      const b = await create(api, { startDate: at(5), days: 2 });

      const lengthen = await api.patch(`/${a.id}${q}`, { days: 6 }).expect(409);
      expect(code(lengthen)).toBe('meal_plan.overlap');
      expect(params(lengthen)).toMatchObject({ id: b.id });
      await api.patch(`/${a.id}${q}`, { days: 5 }).expect(200);

      const move = await api
        .patch(`/${b.id}${q}`, { startDate: at(4) })
        .expect(409);
      expect(code(move)).toBe('meal_plan.overlap');
      await api.patch(`/${b.id}${q}`, { startDate: at(6) }).expect(200);
      await api.patch(`/${a.id}${q}`, { startDate: at(1) }).expect(200);
    });
  });

  it('allows plans of two Families on the same dates', async () => {
    const one = await member('fam-one');
    const two = await member('fam-two');
    await create(one.api, { startDate: at(0), days: 3 });
    await create(two.api, { startDate: at(0), days: 3 });
  });

  it('accepts no name as null on create, and refuses days 8 or servings 0 on update', async () => {
    const { api } = await member('nulls');
    const plan = await create(api, { name: null });
    expect(plan.name).toBeNull();
    await api.patch(`/${plan.id}${q}`, { days: 8 }).expect(400);
    await api.patch(`/${plan.id}${q}`, { servings: 0 }).expect(400);
  });

  describe('moving and resizing', () => {
    it('lets a plan be moved so it only touches another at the edge', async () => {
      const { api } = await member('edge');
      await create(api, { startDate: at(0), days: 3 });
      const b = await create(api, { startDate: at(5), days: 2 });
      await api.patch(`/${b.id}${q}`, { startDate: at(3) }).expect(200);
    });

    it('refuses to move a plan that has already started, so past slots stay put', async () => {
      const { api } = await member('started');
      const plan = await create(api, { startDate: at(0), days: 3 });
      const later = `?locale=en&today=${at(1)}`;
      const refused = await api
        .patch(`/${plan.id}${later}`, { startDate: at(2) })
        .expect(400);
      expect(code(refused)).toBe('meal_plan.already_started');
      // Not yet started (starts today): moving is fine.
      const fresh = await create(api, { startDate: at(8), days: 1 });
      await api
        .patch(`/${fresh.id}?locale=en&today=${at(8)}`, { startDate: at(9) })
        .expect(200);
    });

    it('refuses to shorten away a past day, but drops future slots', async () => {
      const { api } = await member('shorten');
      const recipe = await catalogRecipe();
      const plan = await create(api, { startDate: at(0), days: 4 });
      for (const day of [0, 2, 3]) {
        await api
          .put(`/${plan.id}/slots/${day}/dinner${q}`, { recipeId: recipe })
          .expect(200);
      }
      // Day 2 (at(2)) is past for a client whose today is at(3).
      const late = `?locale=en&today=${at(3)}`;
      const refused = await api
        .patch(`/${plan.id}${late}`, { days: 2 })
        .expect(400);
      expect(code(refused)).toBe('meal_plan.day_in_past');
      expect(
        ((await api.get(`/${plan.id}${q}`).expect(200)).body as PlanDetail)
          .slots,
      ).toHaveLength(3);
      // Dropping only days that are still ahead works.
      const ok = (
        await api.patch(`/${plan.id}${late}`, { days: 3 }).expect(200)
      ).body as PlanDetail;
      expect(ok.slots.map((x) => x.dayIndex)).toEqual([0, 2]);
    });

    it('refuses a start date in the past or too far ahead when moving, but accepts an unchanged one', async () => {
      const { api } = await member('move');
      const plan = await create(api, { startDate: at(0), days: 2 });
      await api.patch(`/${plan.id}${q}`, { startDate: at(15) }).expect(400);
      await api.patch(`/${plan.id}${q}`, { startDate: at(-1) }).expect(400);
      // The plan is now in the past for a later client; keeping its date is not a move.
      const later = `?locale=en&today=${at(5)}`;
      await api
        .patch(`/${plan.id}${later}`, { startDate: at(0), name: 'Kept' })
        .expect(200);
    });
  });

  describe('Plan Slots', () => {
    const slotPath = (planId: string, day: number, mealtime: string) =>
      `/${planId}/slots/${day}/${mealtime}${q}`;

    async function familyRecipe(who: { cookie: string }, title: string) {
      const res = await client(app, who.cookie, '/api/recipes').post('', {
        title: `${title} ${stamp}-${++n}`,
        servings: 2,
        locale: 'en',
        parentId: null,
        lines: [
          {
            ingredientId: seedId.ingredient('milk'),
            quantity: 100,
            unit: 'ml',
          },
        ],
        steps: [{ text: 'Mix' }],
      });
      expect([res.status, res.body]).toEqual([201, expect.anything()]);
      return res.body as { id: string; title: string };
    }

    const read = async (api: Api, id: string, query = q) =>
      (await api.get(`/${id}${query}`).expect(200)).body as PlanDetail;

    it('sets, replaces and clears slots; the read gives date, title and effective servings', async () => {
      const ana = await member('slots');
      const own = await familyRecipe(ana, 'Omelette');
      const catalog = await catalogRecipe();
      const plan = await create(ana.api, { startDate: at(2), days: 3 });

      await ana.api
        .put(slotPath(plan.id, 1, 'dinner'), { recipeId: own.id })
        .expect(200);
      await ana.api
        .put(slotPath(plan.id, 0, 'lunch'), {
          recipeId: catalog,
          servings: 6,
        })
        .expect(200);

      expect((await read(ana.api, plan.id)).slots).toEqual([
        expect.objectContaining({
          dayIndex: 0,
          date: at(2),
          mealtime: 'lunch',
          recipeId: catalog,
          servings: 6,
          servingsOverride: 6,
          unavailable: false,
        }),
        {
          dayIndex: 1,
          date: at(3),
          mealtime: 'dinner',
          recipeId: own.id,
          recipeTitle: own.title,
          servings: plan.servings,
          servingsOverride: null,
          unavailable: false,
          status: 'short',
          issues: expect.any(Array) as unknown[],
        },
      ]);

      // One Recipe per Mealtime per day: setting again replaces it.
      await ana.api
        .put(slotPath(plan.id, 1, 'dinner'), { recipeId: catalog })
        .expect(200);
      const replaced = (await read(ana.api, plan.id)).slots.filter(
        (s) => s.dayIndex === 1,
      );
      expect(replaced).toHaveLength(1);
      expect(replaced[0].recipeId).toBe(catalog);

      await ana.api.del(slotPath(plan.id, 1, 'dinner')).expect(204);
      await ana.api.del(slotPath(plan.id, 1, 'dinner')).expect(204);
      expect((await read(ana.api, plan.id)).slots).toHaveLength(1);
    });

    it('refuses a day outside the plan, and past days (set and clear)', async () => {
      const { api, cookie } = await member('days');
      const recipe = await familyRecipe({ cookie }, 'Soup');
      const plan = await create(api, { startDate: at(0), days: 2 });
      const refused = await api
        .put(slotPath(plan.id, 2, 'lunch'), { recipeId: recipe.id })
        .expect(400);
      expect(code(refused)).toBe('meal_plan.day_out_of_range');

      await api
        .put(slotPath(plan.id, 0, 'lunch'), { recipeId: recipe.id })
        .expect(200);
      // A day counts as past only once its date is before the client's today.
      const tomorrow = `?locale=en&today=${at(1)}`;
      const past = await api
        .put(`/${plan.id}/slots/0/dinner${tomorrow}`, { recipeId: recipe.id })
        .expect(400);
      expect(code(past)).toBe('meal_plan.day_in_past');
      await api.del(`/${plan.id}/slots/0/lunch${tomorrow}`).expect(400);
      await api
        .put(`/${plan.id}/slots/1/dinner${tomorrow}`, { recipeId: recipe.id })
        .expect(200);
      // Past days stay visible.
      expect((await read(api, plan.id, tomorrow)).slots).toHaveLength(2);
    });

    it('refuses archived Recipes and Recipes the Family cannot see', async () => {
      const ana = await member('vis-a');
      const bob = await member('vis-b');
      const theirs = await familyRecipe(bob, 'Secret');
      const archivedCatalog = await catalogRecipe(true);
      const archivedOwn = await familyRecipe(ana, 'Old');
      await client(app, ana.cookie, '/api/recipes')
        .post(`/${archivedOwn.id}/archive`)
        .expect(200);
      const plan = await create(ana.api);
      for (const recipeId of [
        theirs.id,
        archivedCatalog,
        archivedOwn.id,
        crypto.randomUUID(),
      ]) {
        const res = await ana.api
          .put(slotPath(plan.id, 0, 'dinner'), { recipeId })
          .expect(404);
        expect(code(res)).toBe('meal_plan.recipe_not_found');
      }
      await ana.api
        .put(slotPath(plan.id, 0, 'dinner'), {
          recipeId: await catalogRecipe(),
          servings: 1001,
        })
        .expect(400);
      expect((await read(ana.api, plan.id)).slots).toEqual([]);
    });

    it("answers 404 for another Family's plan", async () => {
      const ana = await member('slot-own');
      const bob = await member('slot-other');
      const recipe = await familyRecipe(bob, 'Mine');
      const plan = await create(ana.api);
      await bob.api
        .put(slotPath(plan.id, 0, 'dinner'), { recipeId: recipe.id })
        .expect(404);
      await bob.api.del(slotPath(plan.id, 0, 'dinner')).expect(404);
    });

    it('lets a slot without its own servings follow the plan, and an overridden one keep its own', async () => {
      const { api } = await member('follow');
      const recipe = await catalogRecipe();
      const plan = await create(api, { servings: 2 });
      await api
        .put(slotPath(plan.id, 0, 'breakfast'), { recipeId: recipe })
        .expect(200);
      await api
        .put(slotPath(plan.id, 0, 'dinner'), { recipeId: recipe, servings: 8 })
        .expect(200);
      await api.patch(`/${plan.id}${q}`, { servings: 5 }).expect(200);
      const slots = (await read(api, plan.id)).slots;
      expect(slots.map((s) => [s.mealtime, s.servings])).toEqual([
        ['breakfast', 5],
        ['dinner', 8],
      ]);
      // Setting a slot again without servings goes back to following the plan.
      await api
        .put(slotPath(plan.id, 0, 'dinner'), { recipeId: recipe })
        .expect(200);
      expect((await read(api, plan.id)).slots[1].servings).toBe(5);
    });

    it('marks slots unavailable once their Recipe is archived', async () => {
      const ana = await member('archive');
      const recipe = await familyRecipe(ana, 'Pie');
      const plan = await create(ana.api);
      await ana.api
        .put(slotPath(plan.id, 0, 'dinner'), { recipeId: recipe.id })
        .expect(200);
      await client(app, ana.cookie, '/api/recipes')
        .post(`/${recipe.id}/archive`)
        .expect(200);
      expect((await read(ana.api, plan.id)).slots).toEqual([
        expect.objectContaining({
          recipeId: recipe.id,
          recipeTitle: recipe.title,
          unavailable: true,
        }),
      ]);
    });

    it('moves every slot with the plan, drops slots past a shorter end, and adds empty days when lengthened', async () => {
      const { api } = await member('resize');
      const recipe = await catalogRecipe();
      const plan = await create(api, { startDate: at(0), days: 4 });
      for (const day of [0, 2, 3]) {
        await api
          .put(slotPath(plan.id, day, 'dinner'), { recipeId: recipe })
          .expect(200);
      }

      const moved = (
        await api.patch(`/${plan.id}${q}`, { startDate: at(3) }).expect(200)
      ).body as PlanDetail;
      expect(moved.slots.map((s) => [s.dayIndex, s.date])).toEqual([
        [0, at(3)],
        [2, at(5)],
        [3, at(6)],
      ]);

      const shorter = (
        await api.patch(`/${plan.id}${q}`, { days: 3 }).expect(200)
      ).body as PlanDetail;
      expect(shorter.slots.map((s) => s.dayIndex)).toEqual([0, 2]);

      const longer = (
        await api.patch(`/${plan.id}${q}`, { days: 6 }).expect(200)
      ).body as PlanDetail;
      expect(longer.days).toBe(6);
      expect(longer.slots.map((s) => s.dayIndex)).toEqual([0, 2]);
      await api
        .put(slotPath(plan.id, 5, 'lunch'), { recipeId: recipe })
        .expect(200);
    });

    it('removes the slots with the plan but keeps the Recipe', async () => {
      const { api } = await member('delete');
      const recipe = await catalogRecipe();
      const plan = await create(api);
      await api
        .put(slotPath(plan.id, 0, 'lunch'), { recipeId: recipe })
        .expect(200);
      await api.del(`/${plan.id}${q}`).expect(204);
      const [row] = await database
        .select({ id: recipes.id })
        .from(recipes)
        .where(eq(recipes.id, recipe));
      expect(row).toBeDefined();
    });
  });
});
