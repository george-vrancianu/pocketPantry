import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, ilike, isNull } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  recipes,
  recipeTags,
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

// Spec: #706 / #708 (expand step of ADR 0033). Recipes carry Tags next to Cuisine and Method.
describe('Recipe Tags (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let adminCatalog: ReturnType<typeof client>;
  let ana: ReturnType<typeof client>;
  let anaCookie: string;
  let anaFamily: string;
  let cuisineA: string;
  let cuisineB: string;
  let methodA: string;
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
    const adminCookie = await signUp(app, adminEmail, 'Admin');
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

    const make = async (path: string, name: string) =>
      (
        (await adminCatalog.post(path, { name }).expect(201)).body as {
          id: string;
        }
      ).id;
    cuisineA = await make('/cuisines', `Tagcuisine A ${stamp}`);
    cuisineB = await make('/cuisines', `Tagcuisine B ${stamp}`);
    methodA = await make('/methods', `Tagmethod A ${stamp}`);
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
    for (const id of [cuisineA, cuisineB]) {
      await adminCatalog.del(`/cuisines/${id}`);
    }
    await adminCatalog.del(`/methods/${methodA}`);
    await app.close();
  });

  describe('saving Tags (#709)', () => {
    it('Admin: create and update set the whole Tag list, and the old columns follow', async () => {
      const created = (
        await admin
          .post('', catalogDoc({ tagIds: [cuisineA, methodA, dinner] }))
          .expect(201)
      ).body as { id: string; tagIds: string[]; cuisineId: string };
      expect(await linkedIds(created.id)).toEqual(
        [cuisineA, methodA, dinner].sort(),
      );
      expect(created.tagIds).toEqual([cuisineA, methodA, dinner].sort());
      expect(created.cuisineId).toBe(cuisineA);

      const updated = (
        await admin
          .put(`/${created.id}`, catalogDoc({ tagIds: [cuisineB, vegan] }))
          .expect(200)
      ).body as { cuisineId: string | null; methodId: string | null };
      expect(await linkedIds(created.id)).toEqual([cuisineB, vegan].sort());
      expect(updated).toMatchObject({ cuisineId: cuisineB, methodId: null });

      await admin.put(`/${created.id}`, catalogDoc()).expect(200);
      expect(await linkedIds(created.id)).toEqual([]);
    });

    it('Family: create and update set the whole Tag list, Family Tags included', async () => {
      const created = (
        await ana
          .post('', familyDoc({ tagIds: [cuisineA, familyTag] }))
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(created.id)).toEqual([cuisineA, familyTag].sort());

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
          .post('', catalogDoc({ tagIds: [cuisineA, methodA, dinner, vegan] }))
          .expect(201)
      ).body as { id: string };
      const draft = (await ana.get(`/${base.id}/variant-draft`).expect(200))
        .body as { tagIds: string[]; parentId: string } & Record<
        string,
        unknown
      >;
      expect([...draft.tagIds].sort()).toEqual(
        [cuisineA, methodA, dinner, vegan].sort(),
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
        [cuisineA, methodA, dinner, vegan].sort(),
      );
    });
  });

  describe('reads', () => {
    let recipeId: string;

    beforeAll(async () => {
      const created = (
        await ana
          .post('', familyDoc({ tagIds: [cuisineA, methodA] }))
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

    it('returns every Tag with kind and Tag Group: Family Tags first, then Catalog Tags in group order', async () => {
      const { tags: got } = await detail(ana, recipeId);
      expect(got).toEqual([
        {
          id: familyTag,
          name: `Meal prep ${stamp}`,
          kind: 'family',
          groupId: null,
          groupName: null,
          groupOrder: null,
        },
        expect.objectContaining({
          id: dinner,
          name: 'Dinner',
          kind: 'catalog',
          groupName: 'Meal',
          groupOrder: 1,
        }),
        expect.objectContaining({
          id: vegan,
          name: 'Vegan',
          kind: 'catalog',
          groupName: 'Diet',
          groupOrder: 2,
        }),
        expect.objectContaining({
          id: cuisineA,
          name: `Tagcuisine A ${stamp}`,
          groupName: 'Cuisine',
          groupOrder: 3,
        }),
        expect.objectContaining({
          id: methodA,
          groupName: 'Method',
          groupOrder: 4,
        }),
      ]);
      expect(got[1].groupId).toEqual(expect.any(String));
    });

    it("names Catalog Tags and groups in the viewer's language; Family Tags keep their name", async () => {
      await adminCatalog
        .post('/translations', {
          entityType: 'cuisine',
          entityId: cuisineA,
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
        ['Cină', 'Masă'],
        ['Vegan', 'Dietă'],
        [`Bucătărie A ${stamp}`, 'Bucătărie'],
        [expect.any(String), 'Metodă'],
      ]);
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
        await admin.post('', catalogDoc({ tagIds: [cuisineB] })).expect(201)
      ).body as { id: string };
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Var') })
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(variant.id)).toEqual([cuisineB]);
      const shown = await detail(ana, base.id);
      expect(shown.variants.map((v) => names(v.tags))).toEqual([
        [`Tagcuisine B ${stamp}`],
      ]);
    });
  });

  describe('Variants and Add to Family', () => {
    it('a new Admin Variant starts with every Tag of its Base, then they are independent', async () => {
      const base = (
        await admin.post('', catalogDoc({ tagIds: [cuisineA] })).expect(201)
      ).body as { id: string };
      await link(base.id, dinner);
      const variant = (
        await admin
          .post(`/${base.id}/variants`, { title: title('Var') })
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(variant.id)).toEqual([cuisineA, dinner].sort());

      await link(base.id, vegan);
      expect(await linkedIds(variant.id)).toEqual([cuisineA, dinner].sort());
    });

    it("Add to Family copies the Catalog Recipe's Tags onto the Family's copy", async () => {
      const base = (
        await admin
          .post('', catalogDoc({ tagIds: [cuisineA, methodA] }))
          .expect(201)
      ).body as { id: string };
      await link(base.id, dinner);
      await link(base.id, vegan);

      const copy = (await ana.post(`/${base.id}/copy`).expect(200)).body as {
        id: string;
      };
      expect(await linkedIds(copy.id)).toEqual(
        [cuisineA, methodA, dinner, vegan].sort(),
      );
      const shown = await detail(ana, copy.id);
      expect(shown.tags.every((t) => t.kind === 'catalog')).toBe(true);
      // The copy is independent: a new Tag on the source does not follow.
      expect(await linkedIds(base.id)).toHaveLength(4);
    });
  });

  describe('Admin Cuisine and Method lists mirror to Catalog Tags (until the contract step)', () => {
    it('creates, renames, translates and deletes the Tag with the entry', async () => {
      const created = (
        await adminCatalog
          .post('/cuisines', { name: `Mirror ${stamp}` })
          .expect(201)
      ).body as { id: string };
      const tagOf = async () =>
        (
          await database
            .select({
              name: tags.name,
              familyId: tags.familyId,
              groupId: tags.groupId,
            })
            .from(tags)
            .where(eq(tags.id, created.id))
        )[0];
      expect(await tagOf()).toMatchObject({
        name: `Mirror ${stamp}`,
        familyId: null,
        groupId: expect.stringMatching(/-/) as string,
      });

      await adminCatalog
        .patch(`/cuisines/${created.id}`, { name: `Mirror2 ${stamp}` })
        .expect(200);
      expect((await tagOf()).name).toBe(`Mirror2 ${stamp}`);

      const ro = (
        await adminCatalog
          .post('/translations', {
            entityType: 'cuisine',
            entityId: created.id,
            locale: 'ro',
            kind: 'name',
            value: `Oglindă ${stamp}`,
          })
          .expect(201)
      ).body as { id: string };
      const tagNames = () =>
        database
          .select({
            locale: catalogTranslations.locale,
            value: catalogTranslations.value,
          })
          .from(catalogTranslations)
          .where(
            and(
              eq(catalogTranslations.entityType, 'tag'),
              eq(catalogTranslations.entityId, created.id),
              eq(catalogTranslations.kind, 'name'),
            ),
          )
          .then((rows) =>
            rows.sort((a, b) => a.locale.localeCompare(b.locale)),
          );
      expect(await tagNames()).toEqual([
        { locale: 'en', value: `Mirror2 ${stamp}` },
        { locale: 'ro', value: `Oglindă ${stamp}` },
      ]);

      await adminCatalog.del(`/translations/${ro.id}`).expect(204);
      expect(await tagNames()).toEqual([
        { locale: 'en', value: `Mirror2 ${stamp}` },
      ]);

      await adminCatalog.del(`/cuisines/${created.id}`).expect(204);
      expect(await tagOf()).toBeUndefined();
    });
  });
});
