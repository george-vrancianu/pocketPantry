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
};
type Card = {
  base: { id: string; title: string; archived: boolean };
  recipe: {
    id: string;
    title: string;
    parentId: string | null;
    owner: 'catalog' | 'family';
    servings: number;
  };
  canMake: boolean;
  missing: { ingredientId: string | null; name: string } | null;
  expiringCount: number;
  otherVariantsCount: number;
};

jest.setTimeout(30_000);

describe('Cook Tonight (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let ana: ReturnType<typeof client>;
  let ben: ReturnType<typeof client>;
  let anaFamily: string;
  let benFamily: string;
  const stamp = Date.now();
  let n = 0;
  const today = '2026-10-11';
  const tomorrow = '2026-10-12';

  const feta = seedId.ingredient('feta');
  const butter = seedId.ingredient('butter');
  const milk = seedId.ingredient('milk');
  const carrot = seedId.ingredient('carrot');

  async function makeRecipe(
    lines: LineSpec[],
    opts: {
      familyId?: string | null;
      parentId?: string;
      archived?: boolean;
      title?: string;
    } = {},
  ) {
    const id = crypto.randomUUID();
    await database.insert(recipes).values({
      id,
      familyId: opts.familyId ?? null,
      parentId: opts.parentId ?? null,
      title: opts.title ?? `Tonight ${stamp}-${++n}`,
      servings: 2,
      archivedAt: opts.archived ? new Date() : null,
    });
    await database.insert(recipeIngredientLines).values(
      lines.map((line, position) => ({
        id: crypto.randomUUID(),
        recipeId: id,
        position,
        ingredientId: line.ingredientId ?? null,
        rawName: line.name ?? null,
        normalizedName: line.name?.trim().toLowerCase() ?? null,
        quantity: line.quantity ?? null,
        unit: line.unit ?? null,
      })),
    );
    return id;
  }

  async function stock(
    familyId: string,
    ingredientId: string,
    extra: { quantity?: number; unit?: Unit; expiryDate?: string } = {},
  ) {
    const [{ leaf }] = await database
      .select({ leaf: ingredients.leafCategoryId })
      .from(ingredients)
      .where(eq(ingredients.id, ingredientId));
    await database.insert(batches).values({
      familyId,
      ingredientId,
      unmatched: false,
      leafCategoryId: leaf,
      location: 'fridge',
      quantity: extra.quantity ?? null,
      unit: extra.unit ?? null,
      expiryDate: extra.expiryDate ?? null,
    });
  }

  const cardsOf = async (as: typeof ana, query = `today=${today}`) =>
    (
      (await as.get(`/cook-tonight?locale=en&${query}`).expect(200)).body as {
        cards: Card[];
      }
    ).cards;
  const cardFor = async (baseId: string, as = ana) =>
    (await cardsOf(as)).find((c) => c.base.id === baseId);

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const anaEmail = `tonight-ana-${stamp}@example.com`;
    ana = client(app, await signUp(app, anaEmail, 'Ana'), '/api/recipes');
    const benEmail = `tonight-ben-${stamp}@example.com`;
    ben = client(app, await signUp(app, benEmail, 'Ben'), '/api/recipes');
    const familyOf = async (email: string) =>
      (
        await database
          .select({ familyId: user.familyId })
          .from(user)
          .where(eq(user.email, email))
      )[0].familyId;
    anaFamily = await familyOf(anaEmail);
    benFamily = await familyOf(benEmail);
  });

  beforeEach(async () => {
    await database.delete(batches).where(eq(batches.familyId, anaFamily));
    await database.delete(batches).where(eq(batches.familyId, benFamily));
  });

  afterAll(async () => {
    // Variants first: they reference their base.
    await database
      .delete(recipes)
      .where(ilike(recipes.title, `%Variant ${stamp}-%`));
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    await app.close();
  });

  it('groups makeable Variants into one card with the best match and the count of the others', async () => {
    const cheese = [
      { ingredientId: feta, quantity: 100, unit: 'g' as const },
      { ingredientId: butter, quantity: 50, unit: 'g' as const },
    ];
    const base = await makeRecipe(cheese);
    const withCarrot = await makeRecipe(
      [...cheese, { ingredientId: carrot, quantity: 1, unit: 'pcs' }],
      { parentId: base, title: `Carrot Variant ${stamp}-a` },
    );
    await makeRecipe(
      [...cheese, { ingredientId: milk, quantity: 200, unit: 'ml' }],
      { parentId: base, title: `Milk Variant ${stamp}-b` },
    );
    await stock(anaFamily, feta, { quantity: 500, unit: 'g' });
    await stock(anaFamily, butter, { quantity: 500, unit: 'g' });
    await stock(anaFamily, carrot, {
      quantity: 3,
      unit: 'pcs',
      expiryDate: tomorrow,
    });

    const cards = await cardsOf(ana);
    expect(cards.filter((c) => c.base.id === base)).toHaveLength(1);
    const card = cards.find((c) => c.base.id === base)!;
    // The carrot Variant wins on Expiring Soon coverage; the milk Variant is
    // a near miss, so "+N" counts the base only.
    expect(card.recipe.id).toBe(withCarrot);
    expect(card.recipe.parentId).toBe(base);
    expect(card.recipe.owner).toBe('catalog');
    expect(card.canMake).toBe(true);
    expect(card.missing).toBeNull();
    expect(card.expiringCount).toBe(1);
    expect(card.otherVariantsCount).toBe(1);
    expect(card.base.archived).toBe(false);
  });

  it('shows the single missing or short line of a near miss and drops a Recipe missing two', async () => {
    const missingMilk = await makeRecipe([
      { ingredientId: feta, quantity: 100, unit: 'g' },
      { ingredientId: milk, quantity: 200, unit: 'ml' },
    ]);
    const shortButter = await makeRecipe([
      { ingredientId: feta, quantity: 100, unit: 'g' },
      { ingredientId: butter, quantity: 50, unit: 'g' },
    ]);
    const unmatched = await makeRecipe([
      { ingredientId: feta, quantity: 100, unit: 'g' },
      { name: `Saffron ${stamp}` },
    ]);
    const twoMissing = await makeRecipe([
      { ingredientId: feta, quantity: 100, unit: 'g' },
      { ingredientId: milk, quantity: 200, unit: 'ml' },
      { ingredientId: carrot, quantity: 1, unit: 'pcs' },
    ]);
    await stock(anaFamily, feta, { quantity: 500, unit: 'g' });
    await stock(anaFamily, butter, { quantity: 10, unit: 'g' });

    const cards = await cardsOf(ana);
    const find = (id: string) => cards.find((c) => c.base.id === id);
    expect(find(missingMilk)).toMatchObject({
      canMake: false,
      missing: { ingredientId: milk, name: 'Milk' },
      otherVariantsCount: 0,
    });
    expect(find(shortButter)?.missing).toEqual({
      ingredientId: butter,
      name: 'Butter',
    });
    expect(find(unmatched)?.missing).toEqual({
      ingredientId: null,
      name: `Saffron ${stamp}`,
    });
    expect(find(twoMissing)).toBeUndefined();
  });

  it('orders cards by the Pantry ranking of their best match', async () => {
    const plain = await makeRecipe([
      { ingredientId: feta, quantity: 100, unit: 'g' },
    ]);
    const expiring = await makeRecipe([
      { ingredientId: carrot, quantity: 1, unit: 'pcs' },
    ]);
    const nearMiss = await makeRecipe([
      { ingredientId: feta, quantity: 100, unit: 'g' },
      { ingredientId: milk, quantity: 1, unit: 'l' },
    ]);
    await stock(anaFamily, feta, { quantity: 500, unit: 'g' });
    await stock(anaFamily, carrot, {
      quantity: 3,
      unit: 'pcs',
      expiryDate: tomorrow,
    });

    const order = (await cardsOf(ana)).map((c) => c.base.id);
    const at = (id: string) => order.indexOf(id);
    expect(at(expiring)).toBeGreaterThanOrEqual(0);
    expect(at(expiring)).toBeLessThan(at(plain));
    expect(at(plain)).toBeLessThan(at(nearMiss));
  });

  it('never suggests an archived base but groups its live Variants under it', async () => {
    const lines = [{ ingredientId: feta, quantity: 100, unit: 'g' as const }];
    const base = await makeRecipe(lines, {
      archived: true,
      title: `Archived base ${stamp}-x`,
    });
    const live = await makeRecipe(lines, {
      parentId: base,
      title: `Live Variant ${stamp}-c`,
    });
    await makeRecipe(lines, {
      parentId: base,
      archived: true,
      title: `Archived Variant ${stamp}-d`,
    });
    await stock(anaFamily, feta, { quantity: 500, unit: 'g' });

    const card = await cardFor(base);
    expect(card?.recipe.id).toBe(live);
    expect(card?.base).toEqual({
      id: base,
      title: `Archived base ${stamp}-x`,
      archived: true,
    });
    expect(card?.otherVariantsCount).toBe(0);
  });

  it("treats a Family's own Variant as a candidate for that Family only", async () => {
    const lines = [{ ingredientId: feta, quantity: 100, unit: 'g' as const }];
    const base = await makeRecipe(lines);
    const own = await makeRecipe(
      [...lines, { ingredientId: carrot, quantity: 1, unit: 'pcs' }],
      { parentId: base, familyId: anaFamily },
    );
    for (const family of [anaFamily, benFamily]) {
      await stock(family, feta, { quantity: 500, unit: 'g' });
      await stock(family, carrot, {
        quantity: 3,
        unit: 'pcs',
        expiryDate: tomorrow,
      });
    }

    const anas = await cardFor(base, ana);
    expect(anas?.recipe).toMatchObject({ id: own, owner: 'family' });
    expect(anas?.otherVariantsCount).toBe(1);
    const bens = await cardFor(base, ben);
    expect(bens?.recipe.id).toBe(base);
    expect(bens?.otherVariantsCount).toBe(0);
  });

  it('rejects a malformed today', async () => {
    await ana.get('/cook-tonight?locale=en&today=soon').expect(400);
    await ana.get('/cook-tonight?locale=en&today=2026-13-45').expect(400);
  });

  it('requires a signed-in Member', async () => {
    await client(app, '', '/api/recipes').get('/cook-tonight').expect(401);
  });
});
