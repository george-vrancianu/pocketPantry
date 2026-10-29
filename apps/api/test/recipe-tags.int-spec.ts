import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, isNull } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  recipes,
  recipeTags,
  tagGroups,
  tags,
  user,
} from '../src/database/schema';
import type {
  RecipeDetail,
  RecipeListItem,
  RecipeTag,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';
import { storeLanguages } from './support/stored-language';

jest.setTimeout(30_000);

// Spec: #706 (ADR 0033). Recipes carry Tags: saving, reading, copying.
describe('Recipe Tags (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let adminCatalog: ReturnType<typeof client>;
  let ana: ReturnType<typeof client>;
  let anaCookie: string;
  let adminCookie: string;
  let anaFamily: string;
  // Catalog Tags made through the Admin endpoints, in the Cuisine and Method Tag Groups.
  let groupedA: string;
  let groupedB: string;
  let methodGrouped: string;
  let familyTag: string;
  let otherFamilyTag: string;
  let bea: ReturnType<typeof client>;
  let catalogTagIds: string[];
  const stamp = Date.now();
  let n = 0;
  const dinner = seedId.tag('meal:dinner');
  const vegan = seedId.tag('diet:vegan');
  const title = (label: string) => `${label} ${stamp}-${++n}`;

  const catalogDoc = (overrides: Record<string, unknown> = {}) => ({
    title: title('Cat'),
    servings: 2,
    lines: [
      { ingredientId: seedId.ingredient('flour'), quantity: 100, unit: 'g' },
    ],
    steps: [{ text: 'Mix' }],
    ...overrides,
  });
  const familyDoc = (overrides: Record<string, unknown> = {}) => ({
    ...catalogDoc({ title: title('Fam') }),
    locale: 'en',
    parentId: null,
    ...overrides,
  });
  const familyUpdate = (overrides: Record<string, unknown> = {}) =>
    Object.fromEntries(
      Object.entries(familyDoc(overrides)).filter(([k]) => k !== 'parentId'),
    );
  const link = (recipeId: string, tagId: string) =>
    database.insert(recipeTags).values({ recipeId, tagId });
  const linkedIds = async (recipeId: string) =>
    (
      await database
        .select({ id: recipeTags.tagId })
        .from(recipeTags)
        .where(eq(recipeTags.recipeId, recipeId))
    )
      .map((r) => r.id)
      .sort();
  const detail = async (who: ReturnType<typeof client>, id: string) =>
    (await who.get(`/${id}`).expect(200)).body as RecipeDetail;
  const names = (list: RecipeTag[]) => list.map((t) => t.name);

  async function listItems(query: string) {
    const body = (await ana.get(`?${query}`).expect(200)).body as {
      recipes: RecipeListItem[];
    };
    return body.recipes;
  }

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `tags-admin-${stamp}@example.com`;
    adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, adminCookie, '/api/admin/recipes');
    adminCatalog = client(app, adminCookie, '/api/admin/catalog');
    const email = `tags-ana-${stamp}@example.com`;
    anaCookie = await signUp(app, email, 'Ana');
    ana = client(app, anaCookie, '/api/recipes');
    anaFamily = (
      await database
        .select({ id: user.familyId })
        .from(user)
        .where(eq(user.email, email))
    )[0].id;

    const groupIdOf = async (normalizedName: string) =>
      (
        await database
          .select({ id: tagGroups.id })
          .from(tagGroups)
          .where(eq(tagGroups.normalizedName, normalizedName))
      )[0].id;
    const make = async (groupName: string, name: string) =>
      (
        (
          await adminCatalog
            .post('/tags', { name, groupId: await groupIdOf(groupName) })
            .expect(201)
        ).body as { id: string }
      ).id;
    groupedA = await make('cuisine', `Taggroup A ${stamp}`);
    groupedB = await make('cuisine', `Taggroup B ${stamp}`);
    methodGrouped = await make('method', `Tagmethod A ${stamp}`);
    const beaEmail = `tags-bea-${stamp}@example.com`;
    bea = client(app, await signUp(app, beaEmail, 'Bea'), '/api/recipes');
    const beaFamily = (
      await database
        .select({ id: user.familyId })
        .from(user)
        .where(eq(user.email, beaEmail))
    )[0].id;
    otherFamilyTag = crypto.randomUUID();
    await database.insert(tags).values({
      id: otherFamilyTag,
      name: `Bea only ${stamp}`,
      normalizedName: `bea only ${stamp}`,
      familyId: beaFamily,
    });
    catalogTagIds = (
      await database
        .select({ id: tags.id })
        .from(tags)
        .where(isNull(tags.familyId))
        .orderBy(tags.id)
        .limit(11)
    ).map((t) => t.id);
    familyTag = crypto.randomUUID();
    await database.insert(tags).values({
      id: familyTag,
      name: `Meal prep ${stamp}`,
      normalizedName: `meal prep ${stamp}`,
      familyId: anaFamily,
    });
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
    await database.delete(tags).where(eq(tags.id, familyTag));
    await database.delete(tags).where(eq(tags.id, otherFamilyTag));
    for (const id of [groupedA, groupedB, methodGrouped]) {
      await adminCatalog.del(`/tags/${id}?confirm=true`);
    }
    await app.close();
  });

  describe('saving Tags (#709)', () => {
    it('Admin: create and update set the whole Tag list', async () => {
      const created = (
        await admin
          .post('', catalogDoc({ tagIds: [groupedA, methodGrouped, dinner] }))
          .expect(201)
      ).body as { id: string; tagIds: string[] };
      expect(await linkedIds(created.id)).toEqual(
        [groupedA, methodGrouped, dinner].sort(),
      );
      expect(created.tagIds).toEqual([groupedA, methodGrouped, dinner].sort());

      const updated = (
        await admin
          .put(`/${created.id}`, catalogDoc({ tagIds: [groupedB, vegan] }))
          .expect(200)
      ).body as { tagIds: string[] };
      expect(await linkedIds(created.id)).toEqual([groupedB, vegan].sort());
      expect(updated.tagIds).toEqual([groupedB, vegan].sort());

      await admin.put(`/${created.id}`, catalogDoc()).expect(200);
      expect(await linkedIds(created.id)).toEqual([]);
    });

    it('Family: create and update set the whole Tag list, Family Tags included', async () => {
      const created = (
        await ana
          .post('', familyDoc({ tagIds: [groupedA, familyTag] }))
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(created.id)).toEqual([groupedA, familyTag].sort());

      await ana
        .put(`/${created.id}`, familyUpdate({ tagIds: [familyTag, dinner] }))
        .expect(200);
      expect(await linkedIds(created.id)).toEqual([familyTag, dinner].sort());
      const edit = (await ana.get(`/${created.id}/edit`).expect(200)).body as {
        tagIds: string[];
      };
      expect(edit.tagIds).toEqual([familyTag, dinner].sort());
    });

    it('a Catalog Recipe accepts only Catalog Tags', async () => {
      const res = await admin
        .post('', catalogDoc({ tagIds: [dinner, familyTag] }))
        .expect(404);
      expect((res.body as { code: string }).code).toBe('recipes.tag_not_found');
    });

    it("refuses another Family's Tag, on create and on update, and an unknown Tag", async () => {
      const res = await ana
        .post('', familyDoc({ tagIds: [otherFamilyTag] }))
        .expect(404);
      expect((res.body as { code: string }).code).toBe('recipes.tag_not_found');
      const mine = (await ana.post('', familyDoc()).expect(201)).body as {
        id: string;
      };
      await ana
        .put(`/${mine.id}`, familyUpdate({ tagIds: [dinner, otherFamilyTag] }))
        .expect(404);
      await ana
        .put(`/${mine.id}`, familyUpdate({ tagIds: [crypto.randomUUID()] }))
        .expect(404);
      expect(await linkedIds(mine.id)).toEqual([]);
      // The other Family can use it.
      await bea.post('', familyDoc({ tagIds: [otherFamilyTag] })).expect(201);
    });

    it('allows 10 Tags and refuses the 11th with a coded error, on create and update', async () => {
      const ten = [...catalogTagIds.slice(0, 10)];
      expect(ten).toHaveLength(10);
      const ok = (await ana.post('', familyDoc({ tagIds: ten })).expect(201))
        .body as { id: string };
      expect(await linkedIds(ok.id)).toHaveLength(10);
      const eleven = [...ten, catalogTagIds[10]];
      const res = await ana.post('', familyDoc({ tagIds: eleven })).expect(400);
      expect(res.body).toMatchObject({
        code: 'recipes.tags_too_many',
        params: { max: 10 },
      });
      await ana.put(`/${ok.id}`, familyUpdate({ tagIds: eleven })).expect(400);
      await admin.post('', catalogDoc({ tagIds: eleven })).expect(400);
      expect(await linkedIds(ok.id)).toHaveLength(10);
    });

    it('counts a repeated Tag once', async () => {
      const created = (
        await ana
          .post('', familyDoc({ tagIds: [dinner, dinner, dinner] }))
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(created.id)).toEqual([dinner]);
    });

    it('a Family Variant made from a draft gets every Tag of its Base', async () => {
      const base = (
        await admin
          .post(
            '',
            catalogDoc({ tagIds: [groupedA, methodGrouped, dinner, vegan] }),
          )
          .expect(201)
      ).body as { id: string };
      const draft = (await ana.get(`/${base.id}/variant-draft`).expect(200))
        .body as { tagIds: string[]; parentId: string } & Record<
        string,
        unknown
      >;
      expect([...draft.tagIds].sort()).toEqual(
        [groupedA, methodGrouped, dinner, vegan].sort(),
      );
      const made = (
        await ana
          .post('', {
            ...draft,
            title: title('Fam'),
            locale: 'en',
            lines: [
              {
                ingredientId: seedId.ingredient('flour'),
                quantity: 1,
                unit: 'g',
              },
            ],
            steps: [],
          })
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(made.id)).toEqual(
        [groupedA, methodGrouped, dinner, vegan].sort(),
      );
    });
  });

  describe('reads', () => {
    let recipeId: string;

    beforeAll(async () => {
      const created = (
        await ana
          .post('', familyDoc({ tagIds: [groupedA, methodGrouped] }))
          .expect(201)
      ).body as { id: string };
      recipeId = created.id;
      await link(recipeId, vegan);
      await link(recipeId, dinner);
      await link(recipeId, familyTag);
    });

    afterAll(() =>
      storeLanguages(app, anaCookie, { locale: 'en', catalogLanguage: null }),
    );

    // Tag Groups are catalog-wide and other specs reorder them, so the
    // expectations follow the Admin's current order instead of hard-coded positions.
    const adminGroupOrder = async () =>
      (
        (await adminCatalog.get('').expect(200)).body as {
          tagGroups: { id: string; name: string }[];
        }
      ).tagGroups.map((g) => g.name);
    const byGroupOrder = <T extends { group: string }>(
      order: string[],
      rows: T[],
    ) =>
      [...rows].sort((x, y) => order.indexOf(x.group) - order.indexOf(y.group));

    it('returns every Tag with kind and Tag Group: Family Tags first, then Catalog Tags in group order', async () => {
      const order = await adminGroupOrder();
      const { tags: got } = await detail(ana, recipeId);
      const catalog = byGroupOrder(order, [
        { group: 'Meal', tag: dinner, name: 'Dinner' },
        { group: 'Diet', tag: vegan, name: 'Vegan' },
        { group: 'Cuisine', tag: groupedA, name: `Taggroup A ${stamp}` },
        { group: 'Method', tag: methodGrouped, name: undefined },
      ]);
      expect(got).toEqual([
        {
          id: familyTag,
          name: `Meal prep ${stamp}`,
          kind: 'family',
          groupId: null,
          groupName: null,
          groupOrder: null,
        },
        ...catalog.map((c): unknown =>
          expect.objectContaining({
            id: c.tag,
            ...(c.name ? { name: c.name } : {}),
            kind: 'catalog',
            groupName: c.group,
            groupOrder: expect.any(Number) as unknown,
          }),
        ),
      ]);
      const orders = got.slice(1).map((t) => t.groupOrder as number);
      expect(orders).toEqual([...orders].sort((x, y) => x - y));
      expect(got[1].groupId).toEqual(expect.any(String));
    });

    it("names Catalog Tags and groups in the viewer's language; Family Tags keep their name", async () => {
      const order = await adminGroupOrder();
      await adminCatalog
        .post('/translations', {
          entityType: 'tag',
          entityId: groupedA,
          locale: 'ro',
          kind: 'name',
          value: `Bucătărie A ${stamp}`,
        })
        .expect(201);
      await storeLanguages(app, anaCookie, {
        locale: 'ro',
        catalogLanguage: 'ro',
      });
      const { tags: got } = await detail(ana, recipeId);
      expect(got.map((t) => [t.name, t.groupName])).toEqual([
        [`Meal prep ${stamp}`, null],
        ...byGroupOrder<{ group: string; ro: unknown[] }>(order, [
          { group: 'Meal', ro: ['Cină', 'Masă'] },
          { group: 'Diet', ro: ['Vegan', 'Dietă'] },
          {
            group: 'Cuisine',
            ro: [`Bucătărie A ${stamp}`, 'Bucătărie'],
          },
          { group: 'Method', ro: [expect.any(String) as unknown, 'Metodă'] },
        ]).map((c) => c.ro),
      ]);
    });

    it("lists the Admin's pickable Tags in the Admin's Catalog Language", async () => {
      await storeLanguages(app, adminCookie, {
        locale: 'ro',
        catalogLanguage: 'ro',
      });
      try {
        const got = (await admin.get('/tags').expect(200)).body as RecipeTag[];
        expect(got.find((t) => t.id === dinner)?.name).toBe('Cină');
      } finally {
        await storeLanguages(app, adminCookie, {
          locale: 'en',
          catalogLanguage: null,
        });
      }
    });

    it('rows carry their Tags too: the Recipe list and a Base Recipe’s Variants', async () => {
      await storeLanguages(app, anaCookie, {
        locale: 'en',
        catalogLanguage: null,
      });
      const items = await listItems('scope=family');
      expect(names(items.find((r) => r.id === recipeId)?.tags ?? [])).toContain(
        'Dinner',
      );

      const base = (
        await admin.post('', catalogDoc({ tagIds: [groupedB] })).expect(201)
      ).body as { id: string };
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Var') })
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(variant.id)).toEqual([groupedB]);
      const shown = await detail(ana, base.id);
      expect(shown.variants.map((v) => names(v.tags))).toEqual([
        [`Taggroup B ${stamp}`],
      ]);
    });
  });

  describe('Variants and Add to Family', () => {
    it('a new Admin Variant starts with every Tag of its Base, then they are independent', async () => {
      const base = (
        await admin.post('', catalogDoc({ tagIds: [groupedA] })).expect(201)
      ).body as { id: string };
      await link(base.id, dinner);
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Var') })
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(variant.id)).toEqual([groupedA, dinner].sort());

      await link(base.id, vegan);
      expect(await linkedIds(variant.id)).toEqual([groupedA, dinner].sort());
    });

    it("Add to Family copies the Catalog Recipe's Tags onto the Family's copy", async () => {
      const base = (
        await admin
          .post('', catalogDoc({ tagIds: [groupedA, methodGrouped] }))
          .expect(201)
      ).body as { id: string };
      await link(base.id, dinner);
      await link(base.id, vegan);

      const copy = (await ana.post(`/${base.id}/copy`).expect(200)).body as {
        id: string;
      };
      expect(await linkedIds(copy.id)).toEqual(
        [groupedA, methodGrouped, dinner, vegan].sort(),
      );
      const shown = await detail(ana, copy.id);
      expect(shown.tags.every((t) => t.kind === 'catalog')).toBe(true);
      // The copy is independent: a new Tag on the source does not follow.
      expect(await linkedIds(base.id)).toHaveLength(4);
    });
  });
});
