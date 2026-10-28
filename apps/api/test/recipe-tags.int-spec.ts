import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, ilike } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  cuisines,
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
    for (const id of [cuisineA, cuisineB]) {
      await adminCatalog.del(`/cuisines/${id}`);
    }
    await adminCatalog.del(`/methods/${methodA}`);
    await app.close();
  });

  describe('saving a Cuisine or Method keeps the matching Tag in sync', () => {
    it('Admin: create and update move the Cuisine and Method Tags, other Tags stay', async () => {
      const created = (
        await admin
          .post('', catalogDoc({ cuisineId: cuisineA, methodId: methodA }))
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(created.id)).toEqual([cuisineA, methodA].sort());

      await link(created.id, dinner);
      await admin
        .put(
          `/${created.id}`,
          catalogDoc({ cuisineId: cuisineB, methodId: null }),
        )
        .expect(200);
      expect(await linkedIds(created.id)).toEqual([cuisineB, dinner].sort());

      await admin
        .put(`/${created.id}`, catalogDoc({ cuisineId: null, methodId: null }))
        .expect(200);
      expect(await linkedIds(created.id)).toEqual([dinner]);
    });

    it('Family: create and update move the Cuisine and Method Tags, other Tags stay', async () => {
      const created = (
        await ana
          .post('', familyDoc({ cuisineId: cuisineA, methodId: methodA }))
          .expect(201)
      ).body as { id: string };
      expect(await linkedIds(created.id)).toEqual([cuisineA, methodA].sort());

      await link(created.id, familyTag);
      await ana
        .put(`/${created.id}`, familyUpdate({ cuisineId: cuisineB }))
        .expect(200);
      expect(await linkedIds(created.id)).toEqual([cuisineB, familyTag].sort());
    });

    it('a Cuisine made directly in the database still gets its Tag when a Recipe uses it', async () => {
      const bare = crypto.randomUUID();
      await database.insert(cuisines).values({
        id: bare,
        name: `Bare ${stamp}`,
        normalizedName: `bare ${stamp}`,
      });
      const created = (
        await ana.post('', familyDoc({ cuisineId: bare })).expect(201)
      ).body as { id: string };
      expect(await linkedIds(created.id)).toEqual([bare]);
      await database.delete(recipes).where(eq(recipes.id, created.id));
      await database.delete(tags).where(eq(tags.id, bare));
      await database.delete(cuisines).where(eq(cuisines.id, bare));
    });
  });

  describe('reads', () => {
    let recipeId: string;

    beforeAll(async () => {
      const created = (
        await ana
          .post('', familyDoc({ cuisineId: cuisineA, methodId: methodA }))
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
        await admin.post('', catalogDoc({ cuisineId: cuisineB })).expect(201)
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
        await admin.post('', catalogDoc({ cuisineId: cuisineA })).expect(201)
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
          .post('', catalogDoc({ cuisineId: cuisineA, methodId: methodA }))
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
