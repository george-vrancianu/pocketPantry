import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { restorePre0051Shape } from './support/pre-0051-shape';
import { seedId } from '../src/catalog/seed/seed-catalog';

// Migration 0046 copies every Catalog Recipe a Meal Plan slot uses into its Family and
// repoints the slot. Each test plays it inside a transaction that is rolled back.
const statements = readFileSync(
  resolve(process.cwd(), 'drizzle/0046_meal_plan_slots_family_recipes.sql'),
  'utf8',
)
  .split('--> statement-breakpoint')
  .map((statement) => statement.trim())
  .filter((statement) => statement !== '');

const id = (n: number) =>
  `00000000-0000-4000-8000-0000000046${String(n).padStart(2, '0')}`;
const ids = {
  family: id(1),
  owner: 'mig0046-owner',
  base: id(2),
  variant: id(3),
  line: id(4),
  step: id(5),
  stepTip: id(6),
  baseTip: id(7),
  pairing: id(8),
  moment: id(9),
  useOf: id(10),
  plan: id(11),
  archivedMoment: id(12),
  plain: id(13),
  oldCopy: id(14),
  otherFamily: id(15),
  otherOwner: 'mig0046-other',
  otherPlan: id(16),
};

describe('Migration 0046: Meal Plan slots use Family Recipes (integration)', () => {
  let client: pg.Client;

  beforeAll(async () => {
    client = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  });
  afterAll(async () => {
    await client.end();
  });
  beforeEach(async () => {
    await client.query('BEGIN');
    // The migration copies the Recipe's Cuisine and Method columns, dropped later by 0051.
    await restorePre0051Shape(client);
  });
  afterEach(() => client.query('ROLLBACK'));

  const run = (sql: string, params: unknown[] = []) =>
    client.query(sql, params);
  const migrate = async () => {
    for (const statement of statements) await client.query(statement);
  };
  const rows = async <T extends pg.QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ) => (await client.query<T>(sql, params)).rows;

  async function seedFamily(
    familyId: string,
    userId: string,
    planId: string,
    catalogLanguage: string | null,
  ) {
    await run(
      `insert into family (id, invite_code, invite_code_expires_at) values ($1, $2, now())`,
      [familyId, `mig-${familyId}`],
    );
    await run(
      `insert into "user" (id, name, email, family_id, family_role, catalog_language, locale)
       values ($1, 'Owner', $2, $3, 'owner', $4, 'en')`,
      [userId, `${userId}@example.com`, familyId, catalogLanguage],
    );
    await run(
      `insert into meal_plans (id, family_id, start_date, days, servings) values ($1, $2, '2030-01-10', 3, 2)`,
      [planId, familyId],
    );
  }
  const slot = (planId: string, day: number, recipeId: string) =>
    run(
      `insert into meal_plan_slots (meal_plan_id, day_index, mealtime, recipe_id) values ($1, $2, 'dinner', $3)`,
      [planId, day, recipeId],
    );

  async function seedCatalog() {
    const milk = seedId.ingredient('milk');
    await run(
      `insert into recipes (id, title, servings, prep_minutes, cook_minutes, difficulty, nutrition_note)
       values ($1, 'Soup', 4, 10, 20, 'easy', 'Light'), ($2, 'Soup, spicy', 4, null, null, null, null)`,
      [ids.base, ids.variant],
    );
    await run(`update recipes set parent_id = $1 where id = $2`, [
      ids.base,
      ids.variant,
    ]);
    await run(
      `insert into recipe_translations (recipe_id, locale, title) values ($1, 'ro', 'Supă')`,
      [ids.base],
    );
    await run(
      `insert into recipe_nutrition_note_translations (recipe_id, locale, nutrition_note) values ($1, 'ro', 'Ușoară')`,
      [ids.base],
    );
    await run(
      `insert into recipe_ingredient_lines (id, recipe_id, position, ingredient_id, quantity, unit, optional, note)
       values ($1, $2, 3, $3, 100, 'ml', true, 'warm')`,
      [ids.line, ids.base, milk],
    );
    await run(
      `insert into recipe_ingredient_line_translations (line_id, locale, note) values ($1, 'ro', 'caldă')`,
      [ids.line],
    );
    await run(
      `insert into recipe_steps (id, recipe_id, position, text, timer_seconds) values ($1, $2, 0, 'Stir', 60)`,
      [ids.step, ids.base],
    );
    await run(
      `insert into recipe_step_translations (step_id, locale, text) values ($1, 'ro', 'Amestecă')`,
      [ids.step],
    );
    await run(
      `insert into recipe_tips (id, recipe_id, step_id, position, text) values ($1, $2, $3, 0, 'Slowly'), ($4, $2, null, 1, 'Salt')`,
      [ids.stepTip, ids.base, ids.step, ids.baseTip],
    );
    await run(
      `insert into recipe_hidden_tips (recipe_id, tip_id) values ($1, $2)`,
      [ids.variant, ids.baseTip],
    );
    await run(
      `insert into recipe_pairings (id, recipe_id, position, kind, label, reason, linked_recipe_id)
       values ($1, $2, 0, 'food', 'Bread', 'Dunks', $3)`,
      [ids.pairing, ids.base, ids.variant],
    );
    await run(
      `insert into recipe_pairing_translations (pairing_id, locale, label, reason) values ($1, 'ro', 'Pâine', 'Se înmoaie')`,
      [ids.pairing],
    );
    await run(
      `insert into eating_moments (id, name, normalized_name, sort_order, archived_at)
       values ($1, 'Mig lunch', 'mig lunch 0046', 9990, null), ($2, 'Mig gone', 'mig gone 0046', 9991, now())`,
      [ids.moment, ids.archivedMoment],
    );
    await run(
      `insert into recipe_eating_moments (id, recipe_id, eating_moment_id, position, polarity, reason)
       values ($1, $2, $3, 0, 'good_for', 'Warming'), ($4, $2, $5, 1, 'avoid', null)`,
      [ids.useOf, ids.base, ids.moment, id(17), ids.archivedMoment],
    );
    await run(
      `insert into recipe_eating_moment_translations (recipe_eating_moment_id, locale, reason) values ($1, 'ro', 'Încălzitoare')`,
      [ids.useOf],
    );
  }

  type Copy = {
    id: string;
    parent_id: string | null;
    title: string;
    servings: number;
    copied_from_id: string;
  };
  const copiesOf = (familyId: string) =>
    rows<Copy>(`select * from recipes where family_id = $1 order by title`, [
      familyId,
    ]);
  const slotRecipe = async (planId: string, day: number) =>
    (
      await rows<{ recipe_id: string }>(
        `select recipe_id from meal_plan_slots where meal_plan_id = $1 and day_index = $2`,
        [planId, day],
      )
    )[0].recipe_id;

  it("copies the Recipe in the owner's Catalog Language with all its parts, and repoints the slot", async () => {
    await seedCatalog();
    await seedFamily(ids.family, ids.owner, ids.plan, 'ro');
    await slot(ids.plan, 0, ids.base);
    await slot(ids.plan, 1, ids.base);

    await migrate();

    const copies = await copiesOf(ids.family);
    expect(copies).toHaveLength(1);
    const copy = copies[0];
    expect(copy).toMatchObject({
      title: 'Supă',
      servings: 4,
      prep_minutes: 10,
      cook_minutes: 20,
      difficulty: 'easy',
      nutrition_note: 'Ușoară',
      copied_from_id: ids.base,
      parent_id: null,
      archived_at: null,
    });
    expect(await slotRecipe(ids.plan, 0)).toBe(copy.id);
    expect(await slotRecipe(ids.plan, 1)).toBe(copy.id);

    expect(
      await rows(
        `select position, quantity::float, unit, optional, note, ingredient_id from recipe_ingredient_lines where recipe_id = $1`,
        [copy.id],
      ),
    ).toEqual([
      {
        position: 0,
        quantity: 100,
        unit: 'ml',
        optional: true,
        note: 'caldă',
        ingredient_id: seedId.ingredient('milk'),
      },
    ]);
    const steps = await rows<{
      id: string;
      text: string;
      timer_seconds: number;
    }>(
      `select id, text, timer_seconds from recipe_steps where recipe_id = $1`,
      [copy.id],
    );
    expect(steps).toEqual([
      { id: expect.any(String) as string, text: 'Amestecă', timer_seconds: 60 },
    ]);
    expect(steps[0].id).not.toBe(ids.step);
    expect(
      await rows(
        `select step_id, position, text from recipe_tips where recipe_id = $1 order by position`,
        [copy.id],
      ),
    ).toEqual([
      { step_id: steps[0].id, position: 0, text: 'Slowly' },
      { step_id: null, position: 1, text: 'Salt' },
    ]);
    // The Pairing's link to the live Catalog Variant survives; its text is in Romanian.
    expect(
      await rows(
        `select label, reason, linked_recipe_id from recipe_pairings where recipe_id = $1`,
        [copy.id],
      ),
    ).toEqual([
      { label: 'Pâine', reason: 'Se înmoaie', linked_recipe_id: ids.variant },
    ]);
    // The archived Eating Moment is left out, as the TypeScript copy does.
    expect(
      await rows(
        `select eating_moment_id, position, polarity, reason from recipe_eating_moments where recipe_id = $1`,
        [copy.id],
      ),
    ).toEqual([
      {
        eating_moment_id: ids.moment,
        position: 0,
        polarity: 'good_for',
        reason: 'Încălzitoare',
      },
    ]);
    // The Catalog Recipe itself is untouched.
    expect(
      await rows(`select id from recipe_steps where recipe_id = $1`, [
        ids.base,
      ]),
    ).toHaveLength(1);
  });

  it('keeps a copied Variant under the Catalog Base, copies hidden Tips, and falls back to English', async () => {
    await seedCatalog();
    await seedFamily(ids.family, ids.owner, ids.plan, null);
    await slot(ids.plan, 0, ids.variant);

    await migrate();

    const [copy] = await copiesOf(ids.family);
    expect(copy).toMatchObject({
      parent_id: ids.base,
      copied_from_id: ids.variant,
      title: 'Soup, spicy',
    });
    expect(
      await rows(`select tip_id from recipe_hidden_tips where recipe_id = $1`, [
        copy.id,
      ]),
    ).toEqual([{ tip_id: ids.baseTip }]);
  });

  it('reuses a live copy, ignores an archived one, and keeps Families apart', async () => {
    await seedCatalog();
    await seedFamily(ids.family, ids.owner, ids.plan, 'en');
    await seedFamily(ids.otherFamily, ids.otherOwner, ids.otherPlan, 'ro');
    // A live copy of the base, an archived copy of the variant.
    await run(
      `insert into recipes (id, family_id, copied_from_id, title, servings) values ($1, $2, $3, 'My soup', 2)`,
      [ids.oldCopy, ids.family, ids.base],
    );
    await run(
      `insert into recipes (id, family_id, copied_from_id, title, servings, archived_at) values ($1, $2, $3, 'Old', 2, now())`,
      [ids.plain, ids.family, ids.variant],
    );
    await slot(ids.plan, 0, ids.base);
    await slot(ids.plan, 1, ids.variant);
    await slot(ids.otherPlan, 0, ids.base);

    await migrate();

    expect(await slotRecipe(ids.plan, 0)).toBe(ids.oldCopy);
    const fresh = await slotRecipe(ids.plan, 1);
    expect(fresh).not.toBe(ids.plain);
    expect(
      await rows(
        `select title from recipes where family_id = $1 order by title`,
        [ids.family],
      ),
    ).toEqual([
      { title: 'My soup' },
      { title: 'Old' },
      { title: 'Soup, spicy' },
    ]);
    const other = await copiesOf(ids.otherFamily);
    expect(other.map((r) => r.title)).toEqual(['Supă']);
    expect(await slotRecipe(ids.otherPlan, 0)).toBe(other[0].id);
  });

  it("gives each of two Families exactly one Step Tip per fresh copy, on that copy's own step", async () => {
    await seedCatalog();
    await seedFamily(ids.family, ids.owner, ids.plan, 'en');
    await seedFamily(ids.otherFamily, ids.otherOwner, ids.otherPlan, 'en');
    await slot(ids.plan, 0, ids.base);
    await slot(ids.otherPlan, 0, ids.base);

    await migrate();

    for (const familyId of [ids.family, ids.otherFamily]) {
      const [copy] = await copiesOf(familyId);
      const tips = await rows<{
        step_id: string | null;
        text: string;
        position: number;
      }>(
        `select step_id, text, position from recipe_tips where recipe_id = $1 order by position`,
        [copy.id],
      );
      expect(tips.map((t) => [t.text, t.position])).toEqual([
        ['Slowly', 0],
        ['Salt', 1],
      ]);
      const own = await rows<{ id: string }>(
        `select id from recipe_steps where recipe_id = $1`,
        [copy.id],
      );
      expect(own).toHaveLength(1);
      expect(tips[0].step_id).toBe(own[0].id);
    }
  });

  it('is safe to run again: no new copies, slots stay put', async () => {
    await seedCatalog();
    await seedFamily(ids.family, ids.owner, ids.plan, 'ro');
    await slot(ids.plan, 0, ids.base);
    await run(
      `insert into recipes (id, family_id, title, servings) values ($1, $2, 'Own', 2)`,
      [id(18), ids.family],
    );
    await slot(ids.plan, 2, id(18));

    await migrate();
    const first = await slotRecipe(ids.plan, 0);
    const count = (await copiesOf(ids.family)).length;
    await migrate();

    expect(await slotRecipe(ids.plan, 0)).toBe(first);
    expect(await slotRecipe(ids.plan, 2)).toBe(id(18));
    expect(await copiesOf(ids.family)).toHaveLength(count);
  });
});
