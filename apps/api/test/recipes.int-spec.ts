import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  cuisines,
  ingredients,
  methods,
  recipes,
  user,
} from '../src/database/schema';
import type {
  AdminRecipeDetail,
  RecipeDetail,
  RecipeFilters,
  RecipeListItem,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

describe('Recipes browsing and detail (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let memberA: ReturnType<typeof client>;
  let memberB: ReturnType<typeof client>;
  let familyA: string;
  let familyB: string;
  let ing: string[];
  let cuisineId: string;
  let otherCuisineId: string;
  let methodId: string;
  const stamp = Date.now();
  let n = 0;
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const list = async (query = '', who = memberA) =>
    (
      (await who.get(`?${query}`).expect(200)).body as {
        recipes: RecipeListItem[];
      }
    ).recipes.filter((r) => r.title.includes(String(stamp)));
  const titles = (items: RecipeListItem[]) => items.map((r) => r.title);
  const detail = async (id: string, query = '') =>
    (await memberA.get(`/${id}${query}`).expect(200)).body as RecipeDetail;

  const line = (i: number, quantity = 100) => ({
    ingredientId: ing[i],
    quantity,
    unit: 'g',
  });

  async function base(overrides: Record<string, unknown> = {}) {
    const doc = {
      title: title('Base'),
      servings: 4,
      lines: [line(0), line(1)],
      steps: [{ text: 'Mix' }, { text: 'Bake' }],
      ...overrides,
    };
    const res = await admin.post('', doc);
    expect(res.status).toBe(201);
    return res.body as AdminRecipeDetail;
  }

  async function variant(
    baseId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const created = (
      await admin
        .post(`/${baseId}/variants`, { title: title('Variant') })
        .expect(201)
    ).body as AdminRecipeDetail;
    if (Object.keys(overrides).length === 0) return created;
    const doc = {
      title: created.title,
      servings: created.servings,
      cuisineId: created.cuisineId,
      methodId: created.methodId,
      lines: created.lines.map((l) => ({ ...l })),
      steps: created.steps.map((s) => ({ ...s })),
      ...overrides,
    };
    return (await admin.put(`/${created.id}`, doc).expect(200))
      .body as AdminRecipeDetail;
  }

  const archive = (id: string) => admin.post(`/${id}/archive`, {}).expect(200);

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `recipes-browse-admin-${stamp}@example.com`;
    const cookie = await signUp(app, adminEmail, 'Browse Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, cookie, '/api/admin/recipes');
    memberA = client(app, cookie, '/api/recipes');
    memberB = client(
      app,
      await signUp(app, `recipes-browse-b-${stamp}@example.com`, 'Member B'),
      '/api/recipes',
    );
    const [a] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, adminEmail));
    familyA = a.familyId;
    const [b] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, `recipes-browse-b-${stamp}@example.com`));
    familyB = b.familyId;
    ing = (
      await database.select({ id: ingredients.id }).from(ingredients).limit(5)
    ).map((r) => r.id);
    cuisineId = crypto.randomUUID();
    otherCuisineId = crypto.randomUUID();
    methodId = crypto.randomUUID();
    await database.insert(cuisines).values([
      {
        id: cuisineId,
        name: `Cuisine ${stamp}`,
        normalizedName: `cuisine ${stamp}`,
      },
      {
        id: otherCuisineId,
        name: `Other ${stamp}`,
        normalizedName: `other ${stamp}`,
      },
    ]);
    await database.insert(methods).values({
      id: methodId,
      name: `Method ${stamp}`,
      normalizedName: `method ${stamp}`,
    });
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
    await database.delete(cuisines).where(ilike(cuisines.name, like));
    await database.delete(methods).where(eq(methods.id, methodId));
    await app.close();
  });

  it('requires a signed-in Member', async () => {
    const anon = client(app, '', '/api/recipes');
    await anon.get('').expect(401);
    await anon.get('/filters').expect(401);
  });

  describe('list without search or filter', () => {
    it('shows Base Recipes only, with the count of their live Variants', async () => {
      const a = await base();
      const v1 = await variant(a.id);
      const v2 = await variant(a.id);
      await archive(v2.id);
      const archivedBase = await base();
      await variant(archivedBase.id);
      await archive(archivedBase.id);

      const items = await list();
      expect(titles(items)).toContain(a.title);
      expect(titles(items)).not.toContain(v1.title);
      expect(titles(items)).not.toContain(archivedBase.title);
      const item = items.find((r) => r.id === a.id)!;
      expect(item).toMatchObject({
        parentId: null,
        base: null,
        variantCount: 1,
        owner: 'catalog',
        servings: 4,
      });
    });

    it('orders by title and resolves it in the locale with source fallback', async () => {
      const x = await base({ title: `Bbb ${stamp}` });
      const y = await base({ title: `Aaa ${stamp}` });
      await admin
        .put(`/${x.id}/translations/ro`, { title: `Zzz ro ${stamp}` })
        .expect(200);
      expect(titles(await list('locale=en'))).toEqual(
        expect.arrayContaining([`Aaa ${stamp}`, `Bbb ${stamp}`]),
      );
      const en = titles(await list('locale=en')).filter((t) =>
        [`Aaa ${stamp}`, `Bbb ${stamp}`].includes(t),
      );
      expect(en).toEqual([`Aaa ${stamp}`, `Bbb ${stamp}`]);
      const ro = await list('locale=ro');
      expect(ro.find((r) => r.id === x.id)?.title).toBe(`Zzz ro ${stamp}`);
      expect(ro.find((r) => r.id === y.id)?.title).toBe(`Aaa ${stamp}`);
    });
  });

  describe('search and filters', () => {
    it('finds Variants labelled with their base, and a base does not match through its Variant', async () => {
      const b = await base({ title: `Plain ${stamp}` });
      const v = await variant(b.id, { title: `Quinoa twist ${stamp}` });
      const found = await list('search=quinoa');
      expect(titles(found)).toEqual([`Quinoa twist ${stamp}`]);
      expect(found[0]).toMatchObject({
        id: v.id,
        parentId: b.id,
        base: { id: b.id, title: `Plain ${stamp}` },
      });
    });

    it('searches case- and diacritic-insensitively in the locale or the source title', async () => {
      const b = await base({ title: `Gulaș ${stamp}` });
      await admin
        .put(`/${b.id}/translations/ro`, { title: `Tocană ${stamp}` })
        .expect(200);
      expect(titles(await list('search=GULAS'))).toContain(`Gulaș ${stamp}`);
      expect(titles(await list('search=tocana&locale=ro'))).toEqual([
        `Tocană ${stamp}`,
      ]);
      // the English request does not see the ro text
      expect(await list('search=tocana&locale=en')).toEqual([]);
      // a ro request still finds the source title
      expect(titles(await list('search=gulas&locale=ro'))).toEqual([
        `Tocană ${stamp}`,
      ]);
    });

    it('filters by Cuisine and Method, combined with AND, over bases and Variants', async () => {
      const b = await base({ title: `FBase ${stamp}`, cuisineId });
      const vBoth = await variant(b.id, {
        title: `FBoth ${stamp}`,
        cuisineId,
        methodId,
      });
      await variant(b.id, {
        title: `FOther ${stamp}`,
        cuisineId: otherCuisineId,
      });
      const byCuisine = await list(`cuisineId=${cuisineId}&search=${stamp}`);
      expect(titles(byCuisine).sort()).toEqual(
        [`FBase ${stamp}`, `FBoth ${stamp}`].sort(),
      );
      const both = await list(
        `cuisineId=${cuisineId}&methodId=${methodId}&search=${stamp}`,
      );
      expect(titles(both)).toEqual([`FBoth ${stamp}`]);
      expect(both[0]).toMatchObject({
        id: vBoth.id,
        base: { id: b.id, title: `FBase ${stamp}` },
        cuisine: { id: cuisineId, name: `Cuisine ${stamp}` },
        method: { id: methodId, name: `Method ${stamp}` },
      });
      // a base is listed by its own cuisine only
      const byMethod = await list(`methodId=${methodId}`);
      expect(titles(byMethod)).toEqual([`FBoth ${stamp}`]);
    });

    it('hides archived Variants but keeps Variants of an archived base, labelled with it', async () => {
      const b = await base({ title: `HBase ${stamp}`, cuisineId });
      const live = await variant(b.id, { title: `HLive ${stamp}`, cuisineId });
      const gone = await variant(b.id, { title: `HGone ${stamp}`, cuisineId });
      const familyVariantId = crypto.randomUUID();
      const otherVariantId = crypto.randomUUID();
      await database.insert(recipes).values([
        {
          id: familyVariantId,
          familyId: familyA,
          parentId: b.id,
          title: `HMine ${stamp}`,
          servings: 2,
          cuisineId,
        },
        {
          id: otherVariantId,
          familyId: familyB,
          parentId: b.id,
          title: `HTheirs ${stamp}`,
          servings: 2,
          cuisineId,
        },
      ]);
      await archive(gone.id);
      expect(titles(await list(`search=HLive ${stamp}`))).toEqual([live.title]);
      expect(await list('search=HGone')).toEqual([]);
      await archive(b.id);
      const label = { id: b.id, title: `HBase ${stamp}` };
      // the archived base itself stays hidden
      expect(await list('search=HBase')).toEqual([]);
      const found = await list(`search=HLive ${stamp}`);
      expect(found).toHaveLength(1);
      expect(found[0]).toMatchObject({ id: live.id, base: label });
      // filters show them too, Family Variants only to their own Family
      const onlyH = (t: string) => t.startsWith('H');
      const byCuisine = await list(`cuisineId=${cuisineId}&search=${stamp}`);
      expect(titles(byCuisine).filter(onlyH).sort()).toEqual(
        [live.title, `HMine ${stamp}`].sort(),
      );
      expect(byCuisine.find((r) => r.id === familyVariantId)?.base).toEqual(
        label,
      );
      expect(
        titles(await list(`cuisineId=${cuisineId}&search=${stamp}`, memberB))
          .filter(onlyH)
          .sort(),
      ).toEqual([live.title, `HTheirs ${stamp}`].sort());
      // still reachable by id
      await memberA.get(`/${live.id}`).expect(200);
    });

    it('rejects an unknown locale', async () => {
      await memberA.get('?locale=xx').expect(400);
    });
  });

  describe('Family visibility', () => {
    it('shows a Family its own Recipes (owner family, never translated) and hides other Families', async () => {
      const mineId = crypto.randomUUID();
      const theirsId = crypto.randomUUID();
      await database.insert(recipes).values([
        {
          id: mineId,
          familyId: familyA,
          title: `Mine ${stamp}`,
          servings: 2,
        },
        {
          id: theirsId,
          familyId: familyB,
          title: `Theirs ${stamp}`,
          servings: 2,
        },
      ]);
      const forA = await list('locale=ro');
      expect(titles(forA)).toContain(`Mine ${stamp}`);
      expect(titles(forA)).not.toContain(`Theirs ${stamp}`);
      expect(forA.find((r) => r.id === mineId)?.owner).toBe('family');
      const forB = await list('', memberB);
      expect(titles(forB)).toContain(`Theirs ${stamp}`);
      expect(titles(forB)).not.toContain(`Mine ${stamp}`);

      const mine = await detail(mineId);
      expect(mine.owner).toBe('family');
      expect(mine.base).toBeNull();
      expect(code(await memberB.get(`/${mineId}`).expect(404))).toBe(
        'recipes.not_found',
      );
    });
  });

  describe('Family Variants under a Catalog base', () => {
    it('shows a Family only its own Variants of a Catalog base', async () => {
      const b = await base({ title: `CBase ${stamp}` });
      await admin
        .put(`/${b.id}/translations/ro`, { title: `CBaza ${stamp}` })
        .expect(200);
      await admin.post(`/${b.id}/tips`, { text: 'Catalog tip' }).expect(201);
      const mine = crypto.randomUUID();
      const theirs = crypto.randomUUID();
      await database.insert(recipes).values([
        {
          id: mine,
          parentId: b.id,
          familyId: familyA,
          title: `FamMine ${stamp}`,
          servings: 2,
        },
        {
          id: theirs,
          parentId: b.id,
          familyId: familyB,
          title: `FamTheirs ${stamp}`,
          servings: 2,
        },
      ]);

      const item = (await list()).find((r) => r.id === b.id)!;
      expect(item.variantCount).toBe(1);
      const baseDetail = await detail(b.id);
      expect(baseDetail.variants.map((v) => [v.id, v.owner])).toEqual([
        [mine, 'family'],
      ]);
      const found = await list('search=FamMine');
      expect(found.map((r) => r.id)).toEqual([mine]);
      expect(found[0].base).toEqual({ id: b.id, title: b.title });
      expect(await list('search=FamTheirs')).toEqual([]);

      const d = await detail(mine, '?locale=ro');
      expect(d.owner).toBe('family');
      expect(d.base).toEqual({
        id: b.id,
        title: `CBaza ${stamp}`,
        archived: false,
      });
      expect(d.tips.map((t) => [t.text, t.inherited])).toEqual([
        ['Catalog tip', true],
      ]);
    });
  });

  describe('detail', () => {
    it('returns a base with its live Variants, and no diff', async () => {
      const b = await base({ cuisineId });
      const v1 = await variant(b.id, { title: `VA ${stamp}`, methodId });
      const v2 = await variant(b.id, { title: `VB ${stamp}` });
      const gone = await variant(b.id);
      await archive(gone.id);
      const d = await detail(b.id);
      expect(d).toMatchObject({
        id: b.id,
        owner: 'catalog',
        base: null,
        diff: null,
        archived: false,
        cuisine: { id: cuisineId, name: `Cuisine ${stamp}` },
      });
      expect(d.lines.map((l) => l.ingredientId)).toEqual([ing[0], ing[1]]);
      expect(typeof d.lines[0].ingredientName).toBe('string');
      expect(d.steps.map((s) => s.text)).toEqual(['Mix', 'Bake']);
      expect(d.variants.map((v) => v.id)).toEqual([v1.id, v2.id]);
      expect(d.variants[0]).toMatchObject({
        title: `VA ${stamp}`,
        owner: 'catalog',
        method: { id: methodId, name: `Method ${stamp}` },
        cuisine: { id: cuisineId },
      });
    });

    it('returns a Variant with its base and the ingredient diff', async () => {
      const b = await base({ lines: [line(0), line(1), line(2)] });
      const v = await variant(b.id, {
        lines: [line(0, 300), line(3), line(4)],
      });
      const d = await detail(v.id);
      expect(d.base).toEqual({ id: b.id, title: b.title, archived: false });
      expect(d.variants).toEqual([]);
      expect(
        d.diff?.swapped.map((s) => [s.from.ingredientId, s.to.ingredientId]),
      ).toEqual([
        [ing[1], ing[3]],
        [ing[2], ing[4]],
      ]);
      expect(d.diff?.added).toEqual([]);
      expect(d.diff?.removed).toEqual([]);
      expect(d.diff?.swapped[0].to).toMatchObject({
        id: d.lines[1].id,
        ingredientName: d.lines[1].ingredientName,
        quantity: 100,
        unit: 'g',
      });
    });

    it('shows own and inherited Recipe-level Tips minus hidden ones, and Step Tips on their step', async () => {
      const b = await base();
      const tip = (text: string, stepId: string | null = null) =>
        admin.post(`/${b.id}/tips`, { text, stepId }).expect(201);
      await tip('Keep me');
      await tip('Hide me');
      await tip('Step tip', b.steps[0].id);
      const tips = (await admin.get(`/${b.id}`).expect(200))
        .body as AdminRecipeDetail;
      const keep = tips.tips.find((t) => t.text === 'Keep me')!;
      const hide = tips.tips.find((t) => t.text === 'Hide me')!;
      const v = await variant(b.id);
      await admin.post(`/${v.id}/tips`, { text: 'Own tip' }).expect(201);
      await admin
        .put(`/${v.id}/hidden-tips`, { tipIds: [hide.id] })
        .expect(200);
      const d = await detail(v.id);
      const recipeLevel = d.tips.filter((t) => t.stepId === null);
      expect(recipeLevel.map((t) => [t.text, t.inherited])).toEqual([
        ['Keep me', true],
        ['Own tip', false],
      ]);
      expect(recipeLevel[0].id).toBe(keep.id);
      expect(d.tips.map((t) => t.text)).not.toContain('Hide me');
      // The copied Step Tip is the Variant's own and anchored to a Variant step
      const stepTip = d.tips.find((t) => t.text === 'Step tip');
      expect(stepTip?.stepId).toBe(d.steps[0].id);
      expect(stepTip?.inherited).toBe(false);
    });

    it('resolves text in the locale with source fallback', async () => {
      const b = await base();
      await admin
        .put(`/${b.id}/translations/ro`, {
          title: `Titlu ${stamp}`,
          steps: { [b.steps[0].id]: 'Amestecă' },
        })
        .expect(200);
      const ro = await detail(b.id, '?locale=ro');
      expect(ro.title).toBe(`Titlu ${stamp}`);
      expect(ro.steps.map((s) => s.text)).toEqual(['Amestecă', 'Bake']);
      expect((await detail(b.id)).steps[0].text).toBe('Mix');
    });

    it('returns an archived Recipe flagged, and its base flagged archived', async () => {
      const b = await base();
      const v = await variant(b.id);
      await archive(b.id);
      expect((await detail(b.id)).archived).toBe(true);
      expect((await detail(v.id)).base).toMatchObject({
        id: b.id,
        archived: true,
      });
    });

    it('answers a coded 404 for an unknown Recipe', async () => {
      const res = await memberA.get(`/${crypto.randomUUID()}`).expect(404);
      expect(code(res)).toBe('recipes.not_found');
      await memberA.get('/not-a-uuid').expect(400);
    });
  });

  describe('filters', () => {
    it('lists Cuisines and Methods by name in the locale, sorted', async () => {
      const res = (await memberA.get('/filters').expect(200))
        .body as RecipeFilters;
      const names = res.cuisines.map((c) => c.name);
      expect(names).toEqual([...names].sort((p, q) => p.localeCompare(q)));
      expect(res.cuisines.find((c) => c.id === cuisineId)?.name).toBe(
        `Cuisine ${stamp}`,
      );
      expect(res.methods.find((m) => m.id === methodId)?.name).toBe(
        `Method ${stamp}`,
      );
    });
  });
});
