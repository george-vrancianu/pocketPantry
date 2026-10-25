import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, ilike, isNotNull } from 'drizzle-orm';
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
import type {
  CookTonightView,
  RecipeListItem,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(30_000);

type Listing = { recipes: RecipeListItem[]; hiddenByAllergiesCount: number };

// Spec: #561 / #562. `scope=family|catalog` on GET /recipes and Cook Tonight; no scope is the
// mixed result of today.
describe('Recipe list scope (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let ana: ReturnType<typeof client>;
  let anaSettings: ReturnType<typeof client>;
  let ben: ReturnType<typeof client>;
  let anaFamily: string;
  const stamp = Date.now();
  let n = 0;
  const MILK = seedId.allergen('milk');

  const make = async (
    opts: {
      familyId?: string | null;
      parentId?: string;
      archived?: boolean;
      ingredient?: string;
      title?: string;
    } = {},
  ) => {
    const id = crypto.randomUUID();
    await database.insert(recipes).values({
      id,
      familyId: opts.familyId ?? null,
      parentId: opts.parentId ?? null,
      title: opts.title ?? `Scope ${stamp}-${++n}`,
      servings: 2,
      archivedAt: opts.archived ? new Date() : null,
    });
    await database.insert(recipeIngredientLines).values({
      id: crypto.randomUUID(),
      recipeId: id,
      position: 0,
      ingredientId: seedId.ingredient(opts.ingredient ?? 'flour'),
      quantity: 100,
      unit: 'g',
    });
    return id;
  };
  const list = async (query: string, as = ana) =>
    (await as.get(`?locale=en${query}`).expect(200)).body as Listing;
  const ids = (l: Listing) => l.recipes.map((r) => r.id);

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `scope-ana-${stamp}@example.com`;
    const cookie = await signUp(app, email, 'Ana');
    ana = client(app, cookie, '/api/recipes');
    anaSettings = client(app, cookie, '/api/settings');
    ben = client(
      app,
      await signUp(app, `scope-ben-${stamp}@example.com`, 'Ben'),
      '/api/recipes',
    );
    anaFamily = (
      await database
        .select({ id: user.familyId })
        .from(user)
        .where(eq(user.email, email))
    )[0].id;
  });

  afterEach(async () => {
    await database.delete(batches).where(eq(batches.familyId, anaFamily));
    await anaSettings.put('/allergies', { allergenIds: [] }).expect(200);
    await anaSettings
      .put('/preferences', { hideRecipesWithAllergies: false })
      .expect(200);
    await database
      .delete(recipes)
      .where(
        and(isNotNull(recipes.parentId), ilike(recipes.title, `%${stamp}-%`)),
      );
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /recipes', () => {
    it('family: only live Family Recipes, Variants of Catalog Bases included, with no search needed', async () => {
      const base = await make();
      const catalogVariant = await make({
        parentId: base,
        title: `Cat Variant ${stamp}-a`,
      });
      const own = await make({ familyId: anaFamily });
      const familyVariant = await make({
        familyId: anaFamily,
        parentId: base,
        title: `Fam Variant ${stamp}-b`,
      });
      const archived = await make({ familyId: anaFamily, archived: true });
      const bens = await make({ familyId: await benFamily() });

      const body = await list('&scope=family');
      expect(ids(body)).toEqual(expect.arrayContaining([own, familyVariant]));
      for (const out of [base, catalogVariant, archived, bens]) {
        expect(ids(body)).not.toContain(out);
      }
      expect(body.recipes.every((r) => r.owner === 'family')).toBe(true);
      const variant = body.recipes.find((r) => r.id === familyVariant)!;
      expect(variant.parentId).toBe(base);
      expect(variant.base?.id).toBe(base);
    });

    it('catalog: Bases by default, Catalog Variants while searching or filtering, counting Catalog Variants only', async () => {
      const base = await make({ title: `Catbase ${stamp}-c` });
      const catalogVariant = await make({
        parentId: base,
        title: `Catbase ${stamp}-vd`,
      });
      await make({
        familyId: anaFamily,
        parentId: base,
        title: `Catbase ${stamp}-ve`,
      });
      const own = await make({
        familyId: anaFamily,
        title: `Catbase own ${stamp}-f`,
      });

      const browse = await list('&scope=catalog');
      expect(ids(browse)).toContain(base);
      expect(ids(browse)).not.toContain(catalogVariant);
      expect(ids(browse)).not.toContain(own);
      expect(browse.recipes.find((r) => r.id === base)?.variantCount).toBe(1);

      const search = await list(`&scope=catalog&search=Catbase ${stamp}-`);
      expect(ids(search).sort()).toEqual([base, catalogVariant].sort());
    });

    it('with no scope keeps the mixed result of today', async () => {
      const base = await make({ title: `Mixed ${stamp}-g` });
      const own = await make({
        familyId: anaFamily,
        title: `Mixed ${stamp}-h`,
      });
      const familyVariant = await make({
        familyId: anaFamily,
        parentId: base,
        title: `Mixed ${stamp}-vi`,
      });
      const body = await list(`&search=Mixed ${stamp}-`);
      expect(ids(body).sort()).toEqual([base, own, familyVariant].sort());
      const browse = await list('');
      expect(ids(browse)).toEqual(expect.arrayContaining([base, own]));
      expect(ids(browse)).not.toContain(familyVariant);
      expect(browse.recipes.find((r) => r.id === base)?.variantCount).toBe(1);
    });

    it("never shows another Family's Recipes", async () => {
      const own = await make({ familyId: anaFamily });
      expect(ids(await list('&scope=family', ben))).not.toContain(own);
    });

    it('rejects an unknown scope', async () => {
      await ana.get('?scope=everyone').expect(400);
    });

    it.each(['family', 'catalog'])(
      'hides allergy conflicts and honours showHidden on scope=%s',
      async (scope) => {
        const familyId = scope === 'family' ? anaFamily : null;
        const milky = await make({
          familyId,
          ingredient: 'parmesan',
          title: `Allergy ${stamp}-j`,
        });
        const clear = await make({ familyId, title: `Allergy ${stamp}-k` });
        await anaSettings
          .put('/allergies', { allergenIds: [MILK] })
          .expect(200);
        await anaSettings
          .put('/preferences', { hideRecipesWithAllergies: true })
          .expect(200);
        const q = `&scope=${scope}&search=Allergy ${stamp}-`;

        const hidden = await list(q);
        expect(ids(hidden)).toEqual([clear]);
        expect(hidden.hiddenByAllergiesCount).toBe(1);

        const shown = await list(`${q}&showHidden=true`);
        expect(ids(shown).sort()).toEqual([clear, milky].sort());
        expect(shown.hiddenByAllergiesCount).toBe(0);
        expect(
          shown.recipes.find((r) => r.id === milky)?.allergyWarning,
        ).not.toBeNull();
      },
    );
  });

  describe('Cook Tonight allergy hiding', () => {
    it.each(['family', 'catalog'])(
      'hides allergy conflicts and honours showHidden on scope=%s',
      async (scope) => {
        const familyId = scope === 'family' ? anaFamily : null;
        const milky = await make({ familyId, ingredient: 'parmesan' });
        const [{ leaf }] = await database
          .select({ leaf: ingredients.leafCategoryId })
          .from(ingredients)
          .where(eq(ingredients.id, seedId.ingredient('parmesan')));
        await database.insert(batches).values({
          familyId: anaFamily,
          ingredientId: seedId.ingredient('parmesan'),
          unmatched: false,
          leafCategoryId: leaf,
          location: 'fridge',
          quantity: 500,
          unit: 'g',
        });
        await anaSettings
          .put('/allergies', { allergenIds: [MILK] })
          .expect(200);
        await anaSettings
          .put('/preferences', { hideRecipesWithAllergies: true })
          .expect(200);
        const tonight = async (extra = '') =>
          (
            await ana
              .get(`/cook-tonight?today=2026-10-11&scope=${scope}${extra}`)
              .expect(200)
          ).body as CookTonightView;
        expect((await tonight()).cards.map((c) => c.base.id)).not.toContain(
          milky,
        );
        expect(
          (await tonight('&showHidden=true')).cards.map((c) => c.base.id),
        ).toContain(milky);
      },
    );
  });

  async function benFamily() {
    const [row] = await database
      .select({ id: user.familyId })
      .from(user)
      .where(eq(user.email, `scope-ben-${stamp}@example.com`));
    return row.id;
  }
});
