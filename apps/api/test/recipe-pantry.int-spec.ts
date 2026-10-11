import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  ingredients,
  recipeIngredientLines,
  recipes,
  user,
} from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

type Unit = 'g' | 'kg' | 'ml' | 'l' | 'pcs';
type LineSpec = {
  ingredientId?: string;
  name?: string;
  quantity?: number;
  unit?: Unit;
  optional?: boolean;
};
type MatchLine = {
  lineId: string;
  status: 'covered' | 'short' | 'missing';
  optional: boolean;
  pantryBasic: boolean;
  quantity: number | null;
  unit: string | null;
  shortfall: { quantity: number; unit: string } | null;
  usesExpiringSoon: boolean;
  onShoppingList: boolean;
};
type Match = {
  servings: number;
  canMake: boolean;
  shortOrMissingCount: number;
  expiringCoveredCount: number;
  coverageRatio: number;
  lines: MatchLine[];
};
type ListView = {
  groups: {
    items: {
      id: string;
      name: string;
      quantity: number | null;
      unit: string | null;
      checked: boolean;
      unmatched: boolean;
    }[];
  }[];
};
const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Recipe Pantry matching (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let ana: ReturnType<typeof client>;
  let anaList: ReturnType<typeof client>;
  let ben: ReturnType<typeof client>;
  let anaFamily: string;
  let benFamily: string;
  const stamp = Date.now();
  let n = 0;
  const today = '2026-10-11';

  const feta = seedId.ingredient('feta');
  const butter = seedId.ingredient('butter');
  const milk = seedId.ingredient('milk');
  const parmesan = seedId.ingredient('parmesan');
  const buttermilk = seedId.ingredient('buttermilk');
  const carrot = seedId.ingredient('carrot');

  async function makeRecipe(
    lines: LineSpec[],
    opts: { familyId?: string | null; servings?: number } = {},
  ) {
    const id = crypto.randomUUID();
    await database.insert(recipes).values({
      id,
      familyId: opts.familyId ?? null,
      title: `Pantry ${stamp}-${++n}`,
      servings: opts.servings ?? 2,
    });
    const rows = lines.map((line, position) => ({
      id: crypto.randomUUID(),
      recipeId: id,
      position,
      ingredientId: line.ingredientId ?? null,
      rawName: line.name ?? null,
      normalizedName: line.name?.trim().toLowerCase() ?? null,
      quantity: line.quantity ?? null,
      unit: line.unit ?? null,
      optional: line.optional ?? false,
    }));
    await database.insert(recipeIngredientLines).values(rows);
    return { id, lineIds: rows.map((r) => r.id) };
  }

  async function stock(
    familyId: string,
    ingredientId: string | null,
    extra: {
      quantity?: number;
      unit?: Unit;
      expiryDate?: string | null;
      rawName?: string;
    } = {},
  ) {
    const [{ leaf }] = await database
      .select({ leaf: ingredients.leafCategoryId })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId ?? milk));
    await database.insert(batches).values({
      familyId,
      ingredientId,
      unmatched: ingredientId === null,
      rawName: extra.rawName ?? null,
      leafCategoryId: leaf,
      location: 'fridge',
      quantity: extra.quantity ?? null,
      unit: extra.unit ?? null,
      expiryDate: extra.expiryDate ?? null,
    });
  }

  const matchOf = async (
    as: typeof ana,
    id: string,
    query = `today=${today}`,
  ) => (await as.get(`/${id}/pantry-match?${query}`).expect(200)).body as Match;
  const byLine = (match: Match, lineId: string) =>
    match.lines.find((l) => l.lineId === lineId) as MatchLine;
  const listItems = async () =>
    (
      (await anaList.get('?locale=en').expect(200)).body as ListView
    ).groups.flatMap((g) => g.items);

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const anaEmail = `pantry-ana-${stamp}@example.com`;
    const cookie = await signUp(app, anaEmail, 'Ana');
    ana = client(app, cookie, '/api/recipes');
    anaList = client(app, cookie, '/api/shopping-list');
    const benEmail = `pantry-ben-${stamp}@example.com`;
    ben = client(app, await signUp(app, benEmail, 'Ben'), '/api/recipes');
    [{ familyId: anaFamily }] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, anaEmail));
    [{ familyId: benFamily }] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, benEmail));
    await database
      .update(ingredients)
      .set({ pantryBasic: true })
      .where(eq(ingredients.id, buttermilk));
  });

  afterAll(async () => {
    await database
      .update(ingredients)
      .set({ pantryBasic: false })
      .where(eq(ingredients.id, buttermilk));
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await app.close();
  });

  describe('GET /api/recipes/:id/pantry-match', () => {
    it('reports covered, short and missing lines with the shortfall', async () => {
      const r = await makeRecipe([
        { ingredientId: feta, quantity: 200, unit: 'g' },
        { ingredientId: butter, quantity: 50, unit: 'g' },
        { ingredientId: milk, quantity: 500, unit: 'ml' },
        { ingredientId: parmesan },
      ]);
      // Feta: two Batches add up (60 + 40 g), the expired one does not count.
      await stock(anaFamily, feta, { quantity: 60, unit: 'g' });
      await stock(anaFamily, feta, {
        quantity: 40,
        unit: 'g',
        expiryDate: today,
      });
      await stock(anaFamily, feta, {
        quantity: 500,
        unit: 'g',
        expiryDate: '2026-10-10',
      });
      await stock(anaFamily, butter, { quantity: 1, unit: 'kg' });
      await stock(anaFamily, milk, {
        quantity: 2,
        unit: 'l',
        expiryDate: '2026-10-01',
      });
      await stock(anaFamily, parmesan);

      const match = await matchOf(ana, r.id);
      const [fetaLine, butterLine, milkLine, parmesanLine] = r.lineIds.map(
        (id) => byLine(match, id),
      );
      expect(fetaLine).toMatchObject({
        status: 'short',
        quantity: 200,
        unit: 'g',
        shortfall: { quantity: 100, unit: 'g' },
        onShoppingList: false,
      });
      expect(butterLine).toMatchObject({ status: 'covered', shortfall: null });
      expect(milkLine).toMatchObject({ status: 'missing', shortfall: null });
      expect(parmesanLine).toMatchObject({ status: 'covered', quantity: null });
      expect(match).toMatchObject({
        servings: 2,
        canMake: false,
        shortOrMissingCount: 2,
        coverageRatio: 0.5,
      });
    });

    it('scales quantities to the requested Servings', async () => {
      const r = await makeRecipe([
        { ingredientId: butter, quantity: 100, unit: 'g' },
      ]);
      await stock(benFamily, butter, { quantity: 250, unit: 'g' });
      const same = await matchOf(ben, r.id);
      expect(same.canMake).toBe(true);
      const scaled = await matchOf(ben, r.id, `today=${today}&servings=6`);
      expect(scaled.servings).toBe(6);
      expect(scaled.lines[0]).toMatchObject({
        status: 'short',
        quantity: 300,
        shortfall: { quantity: 50, unit: 'g' },
      });
    });

    it('treats Pantry Basics as covered and optional lines as outside the score', async () => {
      const r = await makeRecipe([
        { ingredientId: buttermilk, quantity: 1, unit: 'l' },
        { ingredientId: carrot, quantity: 2, unit: 'pcs', optional: true },
      ]);
      const match = await matchOf(ana, r.id);
      expect(match.lines[0]).toMatchObject({
        status: 'covered',
        pantryBasic: true,
      });
      expect(match.lines[1]).toMatchObject({
        status: 'missing',
        optional: true,
      });
      expect(match).toMatchObject({
        canMake: true,
        shortOrMissingCount: 0,
        coverageRatio: 1,
      });
    });

    it('flags covered lines that use an Expiring Soon Batch', async () => {
      const r = await makeRecipe([
        { ingredientId: parmesan },
        { ingredientId: carrot, quantity: 1, unit: 'pcs' },
      ]);
      // Default stale threshold is 3 days: 2026-10-13 is soon.
      await stock(anaFamily, parmesan, { expiryDate: '2026-10-13' });
      const match = await matchOf(ana, r.id);
      expect(match.lines[0].usesExpiringSoon).toBe(true);
      expect(match.expiringCoveredCount).toBe(1);
    });

    it('matches Unmatched lines of a Family Recipe by normalised name', async () => {
      const r = await makeRecipe(
        [{ name: `Zzq Sumac ${stamp}` }, { name: `Zzq Nope ${stamp}` }],
        { familyId: anaFamily },
      );
      await stock(anaFamily, null, { rawName: `  zzq SUMAC ${stamp} ` });
      const match = await matchOf(ana, r.id);
      expect(match.lines.map((l) => l.status)).toEqual(['covered', 'missing']);
    });

    it('shows an unchecked Shopping Item as a hint without changing the status', async () => {
      const r = await makeRecipe(
        [
          { ingredientId: carrot, quantity: 1, unit: 'pcs' },
          { name: `Zzq Hint ${stamp}` },
        ],
        { familyId: anaFamily },
      );
      expect(
        (await matchOf(ana, r.id)).lines.map((l) => l.onShoppingList),
      ).toEqual([false, false]);
      await anaList
        .post('/items?locale=en', { ingredientId: carrot })
        .expect(200);
      await anaList
        .post('/items?locale=en', { name: `ZZQ hint ${stamp}` })
        .expect(200);
      const hinted = await matchOf(ana, r.id);
      expect(hinted.lines.map((l) => [l.status, l.onShoppingList])).toEqual([
        ['missing', true],
        ['missing', true],
      ]);
      // Checked items are not "on the list" any more.
      for (const item of await listItems()) {
        await anaList.patch(`/items/${item.id}`, { checked: true }).expect(200);
      }
      expect(
        (await matchOf(ana, r.id)).lines.map((l) => l.onShoppingList),
      ).toEqual([false, false]);
    });

    it('serves Catalog Recipes and the own Family Recipes only', async () => {
      const catalog = await makeRecipe([{ ingredientId: butter }]);
      const own = await makeRecipe([{ ingredientId: butter }], {
        familyId: anaFamily,
      });
      await matchOf(ben, catalog.id);
      await matchOf(ana, own.id);
      const res = await ben.get(`/${own.id}/pantry-match?today=${today}`);
      expect(res.status).toBe(404);
      expect(code(res)).toBe('recipes.not_found');
      const missing = await ana.get(
        `/${crypto.randomUUID()}/pantry-match?today=${today}`,
      );
      expect(code(missing)).toBe('recipes.not_found');
    });

    it('validates the query and requires a Member', async () => {
      const r = await makeRecipe([{ ingredientId: butter }]);
      for (const query of [
        'today=tomorrow',
        `today=${today}&servings=0`,
        `today=${today}&servings=1.5`,
        `today=${today}&servings=1000`,
        `today=${today}&servings=abc`,
      ]) {
        await ana.get(`/${r.id}/pantry-match?${query}`).expect(400);
      }
      await ana.get('/not-a-uuid/pantry-match').expect(400);
      await client(app, '', '/api/recipes')
        .get(`/${r.id}/pantry-match`)
        .expect(401);
    });
  });
});
