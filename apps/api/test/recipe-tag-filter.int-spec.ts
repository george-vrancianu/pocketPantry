import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes, recipeTags, tags, user } from '../src/database/schema';
import type {
  RecipeFilters,
  RecipeListItem,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

// Spec: #706 / #711. Browse filters by Tag ids (AND), with text search, Variants matched on their own
// Tags; the filter options are the Tags in use in the scope, grouped, Family Tags first.
describe('Browsing by Tags (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let ana: ReturnType<typeof client>;
  let ben: ReturnType<typeof client>;
  let anaFamily: string;
  let benFamily: string;
  let anaTag: string;
  let anaUnusedTag: string;
  let benTag: string;
  const stamp = Date.now();
  let n = 0;
  const dinner = seedId.tag('meal:dinner');
  const lunch = seedId.tag('meal:lunch');
  const vegan = seedId.tag('diet:vegan');
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const doc = (overrides: Record<string, unknown> = {}) => ({
    title: title('Tf'),
    servings: 2,
    lines: [
      { ingredientId: seedId.ingredient('flour'), quantity: 100, unit: 'g' },
    ],
    steps: [{ text: 'Mix' }],
    ...overrides,
  });
  const familyDoc = (overrides: Record<string, unknown> = {}) =>
    doc({ locale: 'en', parentId: null, ...overrides });
  const link = (recipeId: string, ...tagIds: string[]) =>
    database
      .insert(recipeTags)
      .values(tagIds.map((tagId) => ({ recipeId, tagId })));
  const createFamily = async (
    who: ReturnType<typeof client>,
    overrides: Record<string, unknown>,
    ...tagIds: string[]
  ) => {
    const made = (await who.post('', familyDoc(overrides)).expect(201))
      .body as { id: string };
    await link(made.id, ...tagIds);
    return made.id;
  };
  const createCatalog = async (
    overrides: Record<string, unknown>,
    ...tagIds: string[]
  ) => {
    const made = (await admin.post('', doc(overrides)).expect(201)).body as {
      id: string;
    };
    await link(made.id, ...tagIds);
    return made.id;
  };
  const list = async (who: ReturnType<typeof client>, query: string) =>
    (
      (await who.get(`?${query}`).expect(200)).body as {
        recipes: RecipeListItem[];
      }
    ).recipes;
  const filters = async (who: ReturnType<typeof client>, scope: string) =>
    (await who.get(`/filters?scope=${scope}`).expect(200))
      .body as RecipeFilters;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `tf-admin-${stamp}@example.com`;
    admin = client(
      app,
      await signUp(app, adminEmail, 'Admin'),
      '/api/admin/recipes',
    );
    await promoteToAdmin(database, adminEmail);
    const familyOf = async (email: string) =>
      (
        await database
          .select({ id: user.familyId })
          .from(user)
          .where(eq(user.email, email))
      )[0].id;
    const anaEmail = `tf-ana-${stamp}@example.com`;
    ana = client(app, await signUp(app, anaEmail, 'Ana'), '/api/recipes');
    anaFamily = await familyOf(anaEmail);
    const benEmail = `tf-ben-${stamp}@example.com`;
    ben = client(app, await signUp(app, benEmail, 'Ben'), '/api/recipes');
    benFamily = await familyOf(benEmail);

    const familyTag = async (familyId: string, name: string) => {
      const id = crypto.randomUUID();
      await database.insert(tags).values({
        id,
        name,
        normalizedName: name.toLowerCase(),
        familyId,
      });
      return id;
    };
    anaTag = await familyTag(anaFamily, `Meal prep ${stamp}`);
    anaUnusedTag = await familyTag(anaFamily, `Unused ${stamp}`);
    benTag = await familyTag(benFamily, `Bens secret ${stamp}`);
  });

  afterAll(async () => {
    const mine = await database
      .select({ id: recipes.id, parentId: recipes.parentId })
      .from(recipes)
      .where(ilike(recipes.title, `%${stamp}-%`));
    for (const row of mine.filter((r) => r.parentId)) {
      await database.delete(recipes).where(eq(recipes.id, row.id));
    }
    await database.delete(recipes).where(ilike(recipes.title, `%${stamp}-%`));
    for (const id of [anaTag, anaUnusedTag, benTag]) {
      await database.delete(tags).where(eq(tags.id, id));
    }
    await app.close();
  });

  describe('filtering the list', () => {
    let dinnerOnly: string;
    let dinnerVegan: string;
    let lunchVegan: string;
    let soupDinnerVegan: string;
    let veganVariant: string;
    let base: string;

    beforeAll(async () => {
      dinnerOnly = await createFamily(ana, { title: title('Plain') }, dinner);
      dinnerVegan = await createFamily(
        ana,
        { title: title('Both') },
        dinner,
        vegan,
      );
      lunchVegan = await createFamily(
        ana,
        { title: title('Lunchy') },
        lunch,
        vegan,
      );
      soupDinnerVegan = await createFamily(
        ana,
        { title: `Soup ${stamp}-${++n}` },
        dinner,
        vegan,
        anaTag,
      );
      base = await createCatalog({ title: title('Omelette') }, dinner);
      veganVariant = (
        (
          await ana
            .post(
              '',
              familyDoc({ title: title('Vegan omelette'), parentId: base }),
            )
            .expect(201)
        ).body as { id: string }
      ).id;
      await link(veganVariant, dinner, vegan);
    });

    const ids = (items: RecipeListItem[]) => items.map((i) => i.id);

    it('one Tag lists the Recipes that have it', async () => {
      const found = ids(await list(ana, `scope=family&tagIds=${lunch}`));
      expect(found).toEqual([lunchVegan]);
    });

    it('several Tags combine with AND (comma-separated or repeated)', async () => {
      const csv = ids(
        await list(ana, `scope=family&tagIds=${dinner},${vegan}`),
      );
      expect(csv.sort()).toEqual(
        [dinnerVegan, soupDinnerVegan, veganVariant].sort(),
      );
      const repeated = ids(
        await list(ana, `scope=family&tagIds=${dinner}&tagIds=${vegan}`),
      );
      expect(repeated.sort()).toEqual(csv.sort());
      expect(csv).not.toContain(dinnerOnly);
      expect(csv).not.toContain(lunchVegan);
    });

    it('works together with text search', async () => {
      const found = ids(
        await list(
          ana,
          `scope=family&tagIds=${dinner},${vegan}&search=Soup ${stamp}-`,
        ),
      );
      expect(found).toEqual([soupDinnerVegan]);
    });

    it('lists a Variant as its own row, matched on its own Tags', async () => {
      const found = await list(ana, `search=${stamp}-&tagIds=${vegan}`);
      const variant = found.find((i) => i.id === veganVariant);
      expect(variant?.parentId).toBe(base);
      expect(variant?.base?.id).toBe(base);
      // The Base is not vegan, so only the Variant matches.
      expect(ids(found)).not.toContain(base);
    });

    it('lists no Recipe when no Recipe has every Tag', async () => {
      expect(await list(ana, `scope=family&tagIds=${lunch},${anaTag}`)).toEqual(
        [],
      );
    });

    it('rejects an id that is not a UUID', async () => {
      await ana.get('?tagIds=nope').expect(400);
    });

    it('another Family’s Tag matches nothing of ours', async () => {
      expect(await list(ana, `scope=family&tagIds=${benTag}`)).toEqual([]);
    });
  });

  describe('filter options', () => {
    let catalogRecipe: string;

    beforeAll(async () => {
      await createFamily(ana, { title: title('Opt') }, dinner, anaTag);
      await createFamily(ben, { title: title('BenOpt') }, lunch, benTag);
      catalogRecipe = await createCatalog({ title: title('Cat') }, vegan);
    });

    it('Recipes: only Tags used on the Family’s Recipes, Your Tags first, then groups in order', async () => {
      const { tags: options } = await filters(ana, 'family');
      const got = options.map((t) => t.id);
      expect(got).toContain(anaTag);
      expect(got).toContain(dinner);
      expect(got).not.toContain(anaUnusedTag);
      expect(got).not.toContain(benTag);
      expect(options[0].kind).toBe('family');
      const kinds = options.map((t) => t.kind);
      expect(kinds.indexOf('catalog')).toBeGreaterThan(
        kinds.lastIndexOf('family'),
      );
      const orders = options
        .filter((t) => t.kind === 'catalog')
        .map((t) => t.groupOrder ?? 0);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(options.find((t) => t.id === dinner)).toMatchObject({
        name: 'Dinner',
        kind: 'catalog',
        groupName: 'Meal',
      });
    });

    it('Explore: only Catalog Tags used on Catalog Recipes, no Family Tags', async () => {
      const { tags: options } = await filters(ana, 'catalog');
      const got = options.map((t) => t.id);
      expect(got).toContain(vegan);
      expect(got).not.toContain(anaTag);
      expect(options.every((t) => t.kind === 'catalog')).toBe(true);
      expect(catalogRecipe).toBeTruthy();
    });

    it('Family isolation: Ben never sees Ana’s Tags, and Ana never sees Ben’s', async () => {
      const bens = (await filters(ben, 'family')).tags.map((t) => t.id);
      expect(bens).toContain(benTag);
      expect(bens).not.toContain(anaTag);
      const anas = (await filters(ana, 'family')).tags.map((t) => t.id);
      expect(anas).not.toContain(benTag);
    });

    it('does not offer Tags used only on archived Recipes', async () => {
      const archivedOnly = crypto.randomUUID();
      await database.insert(tags).values({
        id: archivedOnly,
        name: `Archived only ${stamp}`,
        normalizedName: `archived only ${stamp}`,
        familyId: anaFamily,
      });
      const id = await createFamily(
        ana,
        { title: title('Gone') },
        archivedOnly,
      );
      await database
        .update(recipes)
        .set({ archivedAt: new Date() })
        .where(eq(recipes.id, id));
      const got = (await filters(ana, 'family')).tags.map((t) => t.id);
      expect(got).not.toContain(archivedOnly);
      await database.delete(recipes).where(eq(recipes.id, id));
      await database.delete(tags).where(eq(tags.id, archivedOnly));
    });
  });
});
