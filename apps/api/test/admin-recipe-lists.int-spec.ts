import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, inArray } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  cuisines,
  methods,
  recipes,
  recipeTags,
  tagGroups,
  tags,
} from '../src/database/schema';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Named = {
  id: string;
  name: string;
  translations: { locale: string; value: string }[];
};

jest.setTimeout(30_000);

describe('Admin Cuisine and Method lists (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  let ana: ReturnType<typeof client>;
  let bea: ReturnType<typeof client>;
  const stamp = Date.now();

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `lists-admin-${stamp}@example.com`;
    admin = client(
      app,
      await signUp(app, email, 'Lists Admin'),
      '/api/admin/catalog',
    );
    await promoteToAdmin(database, email);
    member = client(
      app,
      await signUp(app, `lists-member-${stamp}@example.com`, 'Member'),
      '/api/admin/catalog',
    );
    ana = client(
      app,
      await signUp(app, `lists-ana-${stamp}@example.com`, 'Ana'),
      '/api/recipes',
    );
    bea = client(
      app,
      await signUp(app, `lists-bea-${stamp}@example.com`, 'Bea'),
      '/api/recipes',
    );
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    await database.delete(recipes).where(ilike(recipes.title, like));
    await database.delete(cuisines).where(ilike(cuisines.name, like));
    await database.delete(methods).where(ilike(methods.name, like));
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    const tagIds = (
      await database
        .select({ id: tags.id })
        .from(tags)
        .where(ilike(tags.name, like))
    ).map((row) => row.id);
    if (tagIds.length > 0) {
      await database
        .delete(recipeTags)
        .where(inArray(recipeTags.tagId, tagIds));
    }
    await database.delete(tags).where(ilike(tags.name, like));
    await database.delete(tagGroups).where(ilike(tagGroups.name, like));
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  it.each([
    ['cuisines', 'cuisine', 'cuisines'],
    ['methods', 'method', 'methods'],
  ] as const)(
    'creates, renames, translates and deletes a %s entry like an Aisle',
    async (path, entityType, overviewKey) => {
      const created = await admin
        .post(`/${path}`, { name: `Thai ${stamp}` })
        .expect(201);
      const id = (created.body as { id: string }).id;

      const listed = (await admin.get('').expect(200)).body as Record<
        string,
        Named[]
      >;
      const entry = listed[overviewKey].find((row) => row.id === id);
      expect(entry?.name).toBe(`Thai ${stamp}`);
      // The English display name is managed through the entry, as for Aisles.
      expect(entry?.translations.map((t) => [t.locale, t.value])).toEqual([
        ['en', `Thai ${stamp}`],
      ]);

      await admin.post(`/${path}`, { name: `thai ${stamp}` }).expect(409);
      await admin
        .patch(`/${path}/${id}`, { name: `Siam ${stamp}` })
        .expect(200);

      await admin
        .post('/translations', {
          entityType,
          entityId: id,
          locale: 'ro',
          kind: 'name',
          value: `Tailandeza ${stamp}`,
        })
        .expect(201);

      await admin.del(`/${path}/${id}`).expect(204);
      const rows = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.entityId, id));
      expect(rows).toEqual([]);
      await admin.del(`/${path}/${id}`).expect(404);
    },
  );

  it('refuses to delete a Cuisine or Method a Recipe uses', async () => {
    const cuisine = (
      await admin.post('/cuisines', { name: `Used cuisine ${stamp}` })
    ).body as { id: string };
    const method = (
      await admin.post('/methods', { name: `Used method ${stamp}` })
    ).body as { id: string };
    await database.insert(recipes).values({
      id: crypto.randomUUID(),
      title: `Uses lists ${stamp}`,
      servings: 2,
      cuisineId: cuisine.id,
      methodId: method.id,
    });
    const c = await admin.del(`/cuisines/${cuisine.id}`).expect(409);
    expect((c.body as { code: string }).code).toBe('catalog.cuisine_in_use');
    const m = await admin.del(`/methods/${method.id}`).expect(409);
    expect((m.body as { code: string }).code).toBe('catalog.method_in_use');
  });

  it('keeps the lists Admin-only', async () => {
    await member.post('/cuisines', { name: `Nope ${stamp}` }).expect(403);
    await member
      .del('/methods/00000000-0000-4000-8000-000000000000')
      .expect(403);
  });
  describe('Tag Groups and Catalog Tags', () => {
    type Overview = {
      tagGroups: (Named & { position: number })[];
      tags: (Named & { groupId: string; recipeCount: number })[];
    };
    const code = (res: { body: unknown }) =>
      (res.body as { code: string }).code;
    const overview = async () =>
      (await admin.get('').expect(200)).body as Overview;
    const makeGroup = async (name: string) =>
      (await admin.post('/tag-groups', { name }).expect(201)).body as {
        id: string;
      };
    const makeTag = async (name: string, groupId: string) =>
      (await admin.post('/tags', { name, groupId }).expect(201)).body as {
        id: string;
      };
    const familyRecipe = async (
      who: ReturnType<typeof client>,
      label: string,
      tagIds: string[],
    ) =>
      (
        await who
          .post('', {
            title: `${label} ${stamp}`,
            servings: 2,
            lines: [
              {
                ingredientId: seedId.ingredient('flour'),
                quantity: 100,
                unit: 'g',
              },
            ],
            steps: [{ text: 'Mix' }],
            locale: 'en',
            parentId: null,
            tagIds,
          })
          .expect(201)
      ).body as { id: string };
    const familyTag = async (who: ReturnType<typeof client>, name: string) =>
      (await who.post('/tags', { name }).expect(200)).body as { id: string };
    const tagsOf = async (who: ReturnType<typeof client>, id: string) =>
      (
        (await who.get(`/${id}`).expect(200)).body as {
          tags: { id: string; name: string; kind: string }[];
        }
      ).tags;

    it('creates, renames, translates and orders Tag Groups', async () => {
      const first = await makeGroup(`Season ${stamp}`);
      const second = await makeGroup(`Spice ${stamp}`);
      let listed = await overview();
      const positions = listed.tagGroups.map((g) => g.id);
      expect(positions.indexOf(second.id)).toBe(
        positions.indexOf(first.id) + 1,
      );
      expect(
        listed.tagGroups.find((g) => g.id === first.id)?.translations,
      ).toMatchObject([{ locale: 'en', value: `Season ${stamp}` }]);

      await admin
        .patch(`/tag-groups/${first.id}`, { name: `Seasons ${stamp}` })
        .expect(200);
      await admin
        .post('/translations', {
          entityType: 'tag_group',
          entityId: first.id,
          locale: 'da',
          kind: 'name',
          value: `Sæsoner ${stamp}`,
        })
        .expect(201);
      await admin.post('/tag-groups', { name: `seasons ${stamp}` }).expect(409);

      const order = [...positions.filter((id) => id !== second.id)];
      order.splice(0, 0, second.id);
      await admin.put('/tag-groups/order', { ids: order }).expect(200);
      listed = await overview();
      expect(listed.tagGroups.map((g) => g.id)).toEqual(order);
      const renamed = listed.tagGroups.find((g) => g.id === first.id);
      expect(renamed?.name).toBe(`Seasons ${stamp}`);
      expect(
        renamed?.translations.map((t) => [t.locale, t.value]),
      ).toContainEqual(['da', `Sæsoner ${stamp}`]);
      // A partial order is stale.
      const stale = await admin
        .put('/tag-groups/order', { ids: [first.id] })
        .expect(409);
      expect(code(stale)).toBe('catalog.tag_group_order_stale');

      await admin.del(`/tag-groups/${first.id}`).expect(204);
      await admin.del(`/tag-groups/${second.id}`).expect(204);
    });

    it('creates, renames, moves and translates a Catalog Tag; a Tag Group with Tags stays', async () => {
      const a = await makeGroup(`Mood ${stamp}`);
      const b = await makeGroup(`Speed ${stamp}`);
      const created = await makeTag(`Cosy ${stamp}`, a.id);
      await admin
        .post('/tags', { name: `cosy ${stamp}`, groupId: a.id })
        .expect(409);
      await admin
        .post('/tags', { name: `Other ${stamp}`, groupId: crypto.randomUUID() })
        .expect(404);
      await admin
        .patch(`/tags/${created.id}`, { name: `Snug ${stamp}`, groupId: b.id })
        .expect(200);
      for (const [locale, value] of [
        ['ro', `Confortabil ${stamp}`],
        ['da', `Hyggelig ${stamp}`],
      ]) {
        await admin
          .post('/translations', {
            entityType: 'tag',
            entityId: created.id,
            locale,
            kind: 'name',
            value,
          })
          .expect(201);
      }
      const entry = (await overview()).tags.find((t) => t.id === created.id);
      expect(entry).toMatchObject({
        name: `Snug ${stamp}`,
        groupId: b.id,
        recipeCount: 0,
      });
      expect(entry?.translations.map((t) => t.locale).sort()).toEqual([
        'da',
        'en',
        'ro',
      ]);
      expect(code(await admin.del(`/tag-groups/${b.id}`).expect(409))).toBe(
        'catalog.tag_group_not_empty',
      );

      await admin.del(`/tags/${created.id}`).expect(204);
      const rows = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.entityId, created.id));
      expect(rows).toEqual([]);
      await admin.del(`/tags/${created.id}`).expect(404);
      await admin.del(`/tag-groups/${a.id}`).expect(204);
      await admin.del(`/tag-groups/${b.id}`).expect(204);
    });

    it('reports the usage count on delete, asks for confirmation, then removes the Tag from every Recipe', async () => {
      const group = await makeGroup(`Use ${stamp}`);
      const tag = await makeTag(`Popular ${stamp}`, group.id);
      const mine = await familyRecipe(ana, 'Ana pop', [tag.id]);
      const theirs = await familyRecipe(bea, 'Bea pop', [tag.id]);

      expect(
        (await overview()).tags.find((t) => t.id === tag.id)?.recipeCount,
      ).toBe(2);
      const refused = await admin.del(`/tags/${tag.id}`).expect(409);
      expect(refused.body).toMatchObject({
        code: 'catalog.tag_in_use',
        params: { count: 2 },
      });
      expect((await tagsOf(ana, mine.id)).map((t) => t.id)).toEqual([tag.id]);

      await admin.del(`/tags/${tag.id}?confirm=true`).expect(204);
      expect(await tagsOf(ana, mine.id)).toEqual([]);
      expect(await tagsOf(bea, theirs.id)).toEqual([]);
      await admin.del(`/tag-groups/${group.id}`).expect(204);
    });

    it('rejects allergen-free names on create, rename and translate', async () => {
      const group = await makeGroup(`Safe ${stamp}`);
      const tag = await makeTag(`Plain ${stamp}`, group.id);
      for (const name of ['Gluten-free', 'dairy free', 'Fără gluten']) {
        const res = await admin
          .post('/tags', { name, groupId: group.id })
          .expect(400);
        expect(code(res)).toBe('catalog.tag_allergen_free_name');
      }
      await admin.patch(`/tags/${tag.id}`, { name: 'Nut free' }).expect(400);
      await admin
        .post('/translations', {
          entityType: 'tag',
          entityId: tag.id,
          locale: 'da',
          kind: 'name',
          value: 'Glutenfri',
        })
        .expect(400);
      const ok = (
        await admin
          .post('/translations', {
            entityType: 'tag',
            entityId: tag.id,
            locale: 'da',
            kind: 'name',
            value: `Almindelig ${stamp}`,
          })
          .expect(201)
      ).body as { id: string };
      await admin
        .patch(`/translations/${ok.id}`, { value: 'Laktosefri' })
        .expect(400);
      await admin.del(`/tags/${tag.id}`).expect(204);
      await admin.del(`/tag-groups/${group.id}`).expect(204);
    });

    it('merges same-named Family Tags into a new or renamed Catalog Tag, with no duplicate links', async () => {
      const group = await makeGroup(`Merge ${stamp}`);
      const anaTag = await familyTag(ana, `Quick bite ${stamp}`);
      const beaTag = await familyTag(bea, `quick  BITE ${stamp}`);
      const keeper = await familyTag(ana, `Keeper ${stamp}`);
      expect(anaTag.id).not.toBe(beaTag.id);
      const both = await familyRecipe(ana, 'Ana both', [anaTag.id, keeper.id]);
      const beas = await familyRecipe(bea, 'Bea one', [beaTag.id]);

      // Created: the Catalog Tag takes over.
      const catalogTag = await makeTag(`Quick Bite ${stamp}`, group.id);
      expect(
        (await tagsOf(ana, both.id)).map((t) => [t.id, t.kind]).sort(),
      ).toEqual(
        [
          [catalogTag.id, 'catalog'],
          [keeper.id, 'family'],
        ].sort(),
      );
      expect((await tagsOf(bea, beas.id)).map((t) => t.id)).toEqual([
        catalogTag.id,
      ]);
      // Renamed: a Recipe that already has the Catalog Tag keeps one link.
      const dup = await familyRecipe(ana, 'Ana dup', [catalogTag.id]);
      const lateTag = await familyTag(ana, `Late ${stamp}`);
      await database
        .insert(recipeTags)
        .values({ recipeId: dup.id, tagId: lateTag.id });
      await admin
        .patch(`/tags/${catalogTag.id}`, { name: `Late ${stamp}` })
        .expect(200);
      expect((await tagsOf(ana, dup.id)).map((t) => t.id)).toEqual([
        catalogTag.id,
      ]);
      // The Family still has its other Tag.
      expect((await tagsOf(ana, both.id)).map((t) => t.id)).toContain(
        keeper.id,
      );

      await admin.del(`/tags/${catalogTag.id}?confirm=true`).expect(204);
      await admin.del(`/tag-groups/${group.id}`).expect(204);
    });

    it('refuses a translation on a Family Tag and leaves it and its Family alone', async () => {
      const mine = await familyTag(ana, `Mine ${stamp}`);
      const beas = await familyTag(bea, `Other ${stamp}`);
      const beaRecipe = await familyRecipe(bea, 'Bea fam', [beas.id]);
      const recipe = await familyRecipe(ana, 'Ana fam', [mine.id]);

      const res = await admin
        .post('/translations', {
          entityType: 'tag',
          entityId: mine.id,
          locale: 'ro',
          kind: 'name',
          value: `Other ${stamp}`,
        })
        .expect(404);
      expect(code(res)).toBe('catalog.not_found');

      expect((await tagsOf(ana, recipe.id)).map((t) => t.id)).toEqual([
        mine.id,
      ]);
      expect((await tagsOf(bea, beaRecipe.id)).map((t) => t.id)).toEqual([
        beas.id,
      ]);
    });

    it('keeps the Tag endpoints Admin-only', async () => {
      await member.post('/tag-groups', { name: `Nope ${stamp}` }).expect(403);
      await member
        .post('/tags', { name: `Nope ${stamp}`, groupId: crypto.randomUUID() })
        .expect(403);
      await member.del(`/tags/${crypto.randomUUID()}?confirm=true`).expect(403);
    });
  });
});
