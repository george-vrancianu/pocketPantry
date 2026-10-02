import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, ilike } from 'drizzle-orm';
import type { Pool } from 'pg';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE, DATABASE_POOL } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  catalogTranslations,
  shoppingItems,
  shoppingLists,
  ingredients,
  leafCategories,
  parentCategories,
  user,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Body = { id: string; [key: string]: unknown };
type Overview = {
  aisles: Body[];
  parentCategories: Body[];
  leafCategories: Body[];
  ingredients: Body[];
};

describe('Admin role and Catalog curation (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let adminCookie: string;
  let memberCookie: string;
  const stamp = Date.now();
  const shoppingListIds: string[] = [];
  const batchIds: string[] = [];

  async function signUp(email: string, name: string) {
    let response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .send({ name, email, password: 'correct-horse-staple' });
    // The allow-listed address is fixed, so it may exist from an earlier run.
    if (response.status === 422) {
      response = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .set('origin', TEST_ORIGIN)
        .send({ email, password: 'correct-horse-staple' });
    }
    expect(response.status).toBe(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((value) => value.split(';')[0])
      .join('; ');
    return { cookie, body: response.body as Body };
  }

  const as = (cookie: string) => ({
    get: (path: string) =>
      request(app.getHttpServer())
        .get(`/api/admin/catalog${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie),
    post: (path: string, body: object) =>
      request(app.getHttpServer())
        .post(`/api/admin/catalog${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send(body),
    patch: (path: string, body: object) =>
      request(app.getHttpServer())
        .patch(`/api/admin/catalog${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send(body),
    del: (path: string) =>
      request(app.getHttpServer())
        .delete(`/api/admin/catalog${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie),
  });

  async function overview() {
    return (await as(adminCookie).get('').expect(200)).body as Overview;
  }

  async function translationsOf(type: string, id: string) {
    return database
      .select()
      .from(catalogTranslations)
      .where(
        and(
          eq(
            catalogTranslations.entityType,
            type as 'ingredient' | 'leaf_category' | 'parent_category',
          ),
          eq(catalogTranslations.entityId, id),
        ),
      );
  }

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    // Allow-listed in test/support/env.ts (mixed case on purpose).
    adminCookie = (await signUp('chef.admin@example.com', 'Chef Admin')).cookie;
    memberCookie = (await signUp(`member-${stamp}@example.com`, 'Member'))
      .cookie;
  });

  afterAll(async () => {
    // Leave no rows behind even if a test failed midway: other suites count Catalog rows.
    for (const id of shoppingListIds) {
      await database.delete(shoppingLists).where(eq(shoppingLists.id, id));
    }
    for (const id of batchIds) {
      await database.delete(batches).where(eq(batches.id, id));
    }
    const like = `%${stamp}%`;
    for (const table of [ingredients, leafCategories, parentCategories]) {
      await database.delete(table).where(ilike(table.name, like));
    }
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  describe('role assignment', () => {
    it('grants Admin to an allow-listed email at signup, and only that', async () => {
      const rows = await database
        .select({ email: user.email, role: user.role })
        .from(user);
      expect(rows.find((r) => r.email === 'chef.admin@example.com')?.role).toBe(
        'admin',
      );
      expect(
        rows.find((r) => r.email === `member-${stamp}@example.com`)?.role,
      ).toBe('regular');
    });

    it('ignores a role supplied by the client at signup', async () => {
      const email = `sneaky-${stamp}@example.com`;
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .set('origin', TEST_ORIGIN)
        .send({
          name: 'Sneaky',
          email,
          password: 'correct-horse-staple',
          role: 'admin',
        });
      const [row] = await database
        .select({ role: user.role })
        .from(user)
        .where(eq(user.email, email));
      expect(row?.role).toBe('regular');
    });

    it('does not let a signed-in Member promote themselves via update-user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/update-user')
        .set('origin', TEST_ORIGIN)
        .set('cookie', memberCookie)
        .send({ role: 'admin' });
      await as(memberCookie).get('').expect(403);
    });
  });

  describe('authorisation', () => {
    it('answers signed-out callers with 401 and Members with auth.admin_required', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/catalog')
        .set('origin', TEST_ORIGIN)
        .expect(401);

      const response = await as(memberCookie).get('').expect(403);
      expect(response.body).toEqual({
        code: 'auth.admin_required',
        params: {},
      });
      await as(memberCookie).post('/ingredients', {}).expect(403);
      await as(memberCookie)
        .del(`/ingredients/${seedId.ingredient('parmesan')}`)
        .expect(403);
    });

    it('lets an Admin read the Catalog with translations', async () => {
      const body = await overview();
      const parmesan = body.ingredients.find(
        (i) => i.id === seedId.ingredient('parmesan'),
      );
      expect(parmesan?.name).toBe('Parmesan');
      expect(parmesan?.translations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ locale: 'ro', value: 'Parmezan' }),
        ]),
      );
      expect(body.aisles.length).toBeGreaterThan(0);
    });
  });

  describe('Ingredients', () => {
    const leafId = seedId.leaf('hard-cheese');

    it('creates, edits, renames and deletes an Ingredient, keeping translations consistent', async () => {
      const created = (
        await as(adminCookie)
          .post('/ingredients', {
            leafCategoryId: leafId,
            name: `Gruyère ${stamp}`,
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Body;
      expect(created.id).toEqual(expect.any(String));

      // The English display name exists from the start.
      expect(await translationsOf('ingredient', created.id)).toEqual([
        expect.objectContaining({
          locale: 'en',
          kind: 'name',
          value: `Gruyère ${stamp}`,
        }),
      ]);

      await as(adminCookie)
        .post('/translations', {
          entityType: 'ingredient',
          entityId: created.id,
          locale: 'ro',
          kind: 'name',
          value: `Gruyere ro ${stamp}`,
        })
        .expect(201);
      const synonym = (
        await as(adminCookie)
          .post('/translations', {
            entityType: 'ingredient',
            entityId: created.id,
            locale: 'en',
            kind: 'synonym',
            value: `Swiss cheese ${stamp}`,
          })
          .expect(201)
      ).body as Body;

      // Rename keeps the English display name in step.
      await as(adminCookie)
        .patch(`/ingredients/${created.id}`, {
          name: `Emmental ${stamp}`,
          defaultUnit: 'kg',
        })
        .expect(200);
      const renamed = (await translationsOf('ingredient', created.id)).find(
        (t) => t.locale === 'en' && t.kind === 'name',
      );
      expect(renamed).toMatchObject({
        value: `Emmental ${stamp}`,
        normalizedValue: `emmental ${stamp}`,
      });
      const listed = (await overview()).ingredients.find(
        (i) => i.id === created.id,
      );
      expect(listed).toMatchObject({
        name: `Emmental ${stamp}`,
        defaultUnit: 'kg',
      });

      await as(adminCookie)
        .patch(`/translations/${synonym.id}`, { value: `Swiss ${stamp}` })
        .expect(200);

      await as(adminCookie).del(`/ingredients/${created.id}`).expect(204);
      expect(await translationsOf('ingredient', created.id)).toEqual([]);
      expect(
        (await overview()).ingredients.some((i) => i.id === created.id),
      ).toBe(false);
    });

    it('enforces unique names, ignoring case and diacritics', async () => {
      const response = await as(adminCookie)
        .post('/ingredients', {
          leafCategoryId: leafId,
          name: 'PARMESAN',
          defaultUnit: 'g',
        })
        .expect(409);
      expect(response.body).toEqual({ code: 'catalog.name_taken', params: {} });

      const other = (
        await as(adminCookie)
          .post('/ingredients', {
            leafCategoryId: leafId,
            name: `Unique ${stamp}`,
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Body;
      await as(adminCookie)
        .patch(`/ingredients/${other.id}`, { name: 'parmesan' })
        .expect(409);
      // The failed rename left everything as it was.
      expect((await translationsOf('ingredient', other.id))[0].value).toBe(
        `Unique ${stamp}`,
      );
      await as(adminCookie).del(`/ingredients/${other.id}`).expect(204);
    });

    it('rejects an unknown Leaf Category and invalid input', async () => {
      const missing = await as(adminCookie)
        .post('/ingredients', {
          leafCategoryId: '00000000-0000-4000-8000-000000000000',
          name: 'Nothing',
          defaultUnit: 'g',
        })
        .expect(404);
      expect(missing.body).toEqual({
        code: 'catalog.not_found',
        params: { entity: 'leaf_category' },
      });
      const invalid = await as(adminCookie)
        .post('/ingredients', {
          leafCategoryId: leafId,
          name: '!!!',
          defaultUnit: 'cups',
        })
        .expect(400);
      expect((invalid.body as Body).code).toBe('validation_failed');
    });

    it('rejects deleting an Ingredient that is still on a Shopping List', async () => {
      const made = (
        await as(adminCookie)
          .post('/ingredients', {
            leafCategoryId: leafId,
            name: `Guarded ${stamp}`,
            defaultUnit: 'pcs',
          })
          .expect(201)
      ).body as Body;
      // A real Shopping Item (archived list, so the Family's active list is untouched).
      const [admin] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, 'chef.admin@example.com'));
      const [list] = await database
        .insert(shoppingLists)
        .values({ familyId: admin.familyId, status: 'archived' })
        .returning({ id: shoppingLists.id });
      shoppingListIds.push(list.id);
      await database
        .insert(shoppingItems)
        .values({ listId: list.id, ingredientId: made.id });

      const response = await as(adminCookie)
        .del(`/ingredients/${made.id}`)
        .expect(409);
      expect(response.body).toEqual({
        code: 'catalog.ingredient_in_use',
        params: {},
      });
      // The failed delete rolled back, translations included.
      expect(await translationsOf('ingredient', made.id)).toHaveLength(1);

      await database
        .delete(shoppingItems)
        .where(eq(shoppingItems.ingredientId, made.id));
      await as(adminCookie).del(`/ingredients/${made.id}`).expect(204);
      await as(adminCookie).del(`/ingredients/${made.id}`).expect(404);
    });

    it('rejects a PATCH with no fields as a validation error, not a 500', async () => {
      const response = await as(adminCookie)
        .patch(`/ingredients/${seedId.ingredient('parmesan')}`, {})
        .expect(400);
      expect((response.body as Body).code).toBe('validation_failed');
      await as(adminCookie)
        .patch(`/parent-categories/${seedId.parent('dairy')}`, {})
        .expect(400);
      await as(adminCookie).patch(`/leaf-categories/${leafId}`, {}).expect(400);
    });
  });

  describe('Categories', () => {
    it('manages Parent and Leaf Categories, defaults, Aisle, and the delete guard', async () => {
      const aisleId = seedId.aisle('dairy-eggs');
      const dairy = (await overview()).aisles.find((a) => a.id === aisleId);
      expect(dairy).toBeDefined();

      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: `Test parent ${stamp}`,
            aisleId,
            defaultExpiryDays: 10,
            defaultLocation: 'fridge',
          })
          .expect(201)
      ).body as Body;
      expect(parent).toMatchObject({
        aisleId,
        defaultExpiryDays: 10,
        defaultLocation: 'fridge',
      });

      const leaf = (
        await as(adminCookie)
          .post('/leaf-categories', {
            parentId: parent.id,
            name: `Test leaf ${stamp}`,
          })
          .expect(201)
      ).body as Body;
      expect(leaf).toMatchObject({
        defaultExpiryDays: null,
        defaultLocation: null,
      });

      await as(adminCookie)
        .patch(`/leaf-categories/${leaf.id}`, {
          defaultExpiryDays: 30,
          defaultLocation: 'freezer',
        })
        .expect(200);
      await as(adminCookie)
        .patch(`/parent-categories/${parent.id}`, {
          name: `Renamed parent ${stamp}`,
          aisleId: seedId.aisle('fruit-veg'),
          defaultExpiryDays: null,
        })
        .expect(200);
      expect(
        (await translationsOf('parent_category', parent.id))[0].value,
      ).toBe(`Renamed parent ${stamp}`);

      const ingredient = (
        await as(adminCookie)
          .post('/ingredients', {
            leafCategoryId: leaf.id,
            name: `In test leaf ${stamp}`,
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Body;

      // Non-empty Categories cannot be deleted.
      const parentBlocked = await as(adminCookie)
        .del(`/parent-categories/${parent.id}`)
        .expect(409);
      expect(parentBlocked.body).toEqual({
        code: 'catalog.category_not_empty',
        params: { children: 1 },
      });
      await as(adminCookie).del(`/leaf-categories/${leaf.id}`).expect(409);

      await as(adminCookie).del(`/ingredients/${ingredient.id}`).expect(204);
      await as(adminCookie).del(`/leaf-categories/${leaf.id}`).expect(204);
      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
      expect(await translationsOf('leaf_category', leaf.id)).toEqual([]);
      expect(await translationsOf('parent_category', parent.id)).toEqual([]);
    });

    async function insertBatch(leafCategoryId: string): Promise<string> {
      const [admin] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, 'chef.admin@example.com'));
      const [batch] = await database
        .insert(batches)
        .values({
          familyId: admin.familyId,
          leafCategoryId,
          unmatched: true,
          rawName: 'mystery',
          location: 'fridge',
        })
        .returning({ id: batches.id });
      batchIds.push(batch.id);
      return batch.id;
    }

    it('rejects deleting a Leaf Category that Batches still reference', async () => {
      const leaf = (
        await as(adminCookie)
          .post('/leaf-categories', {
            parentId: seedId.parent('dairy'),
            name: `Referenced leaf ${stamp}`,
          })
          .expect(201)
      ).body as Body;
      const batchId = await insertBatch(leaf.id);
      await as(adminCookie)
        .del(`/leaf-categories/${leaf.id}`)
        .expect(409)
        .expect({ code: 'catalog.category_not_empty', params: {} });
      // The failed delete rolled back, translations included.
      expect(await translationsOf('leaf_category', leaf.id)).toHaveLength(1);
      await database.delete(batches).where(eq(batches.id, batchId));
      await as(adminCookie).del(`/leaf-categories/${leaf.id}`).expect(204);
    });

    it('creates an Other Leaf with every Parent, protects it, and removes it with an empty Parent', async () => {
      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: `Spreads ${stamp}`,
            aisleId: seedId.aisle('dry-goods'),
            defaultExpiryDays: 90,
            defaultLocation: 'cupboard',
          })
          .expect(201)
      ).body as Body;
      const other = (await overview()).leafCategories.find(
        (leaf) => leaf.parentId === parent.id,
      ) as Body;
      expect(other).toMatchObject({
        isOther: true,
        name: `Other spreads ${stamp}`,
        defaultExpiryDays: null,
        defaultLocation: null,
      });
      expect(await translationsOf('leaf_category', other.id)).toEqual([
        expect.objectContaining({ locale: 'en', kind: 'name' }),
      ]);

      // Protected: not deletable, not movable. Renaming stays allowed.
      await as(adminCookie)
        .del(`/leaf-categories/${other.id}`)
        .expect(409)
        .expect({ code: 'catalog.other_leaf_protected', params: {} });
      await as(adminCookie)
        .patch(`/leaf-categories/${other.id}`, {
          parentId: seedId.parent('dairy'),
        })
        .expect(409)
        .expect({ code: 'catalog.other_leaf_protected', params: {} });
      await as(adminCookie)
        .patch(`/leaf-categories/${other.id}`, {
          name: `Misc spreads ${stamp}`,
        })
        .expect(200);

      // A Batch on the Other Leaf blocks deleting the Parent, atomically.
      const batchId = await insertBatch(other.id);
      await as(adminCookie)
        .del(`/parent-categories/${parent.id}`)
        .expect(409)
        .expect({ code: 'catalog.category_not_empty', params: {} });
      expect(await translationsOf('leaf_category', other.id)).toHaveLength(1);
      expect(await translationsOf('parent_category', parent.id)).toHaveLength(
        1,
      );
      await database.delete(batches).where(eq(batches.id, batchId));

      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
      expect(await translationsOf('leaf_category', other.id)).toEqual([]);
      expect(
        (await overview()).leafCategories.some((leaf) => leaf.id === other.id),
      ).toBe(false);
    });

    it('caps a long generated Other Leaf name, and reports a clash clearly', async () => {
      const longName = `${'x'.repeat(95)}${stamp}`.slice(0, 100);
      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: longName,
            aisleId: seedId.aisle('dry-goods'),
          })
          .expect(201)
      ).body as Body;
      const other = (await overview()).leafCategories.find(
        (leaf) => leaf.parentId === parent.id,
      ) as Body;
      expect(String(other.name)).toHaveLength(100);
      expect(String(other.name).startsWith('Other xxx')).toBe(true);
      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);

      // A Leaf already called "Other <name>" makes the generated name clash.
      const clash = `Clash ${stamp}`;
      const leaf = (
        await as(adminCookie)
          .post('/leaf-categories', {
            name: `Other ${clash.toLowerCase()}`,
            parentId: seedId.parent('dairy'),
          })
          .expect(201)
      ).body as Body;
      await as(adminCookie)
        .post('/parent-categories', {
          name: clash,
          aisleId: seedId.aisle('dry-goods'),
        })
        .expect(409)
        .expect({ code: 'catalog.other_leaf_name_taken', params: {} });
      await as(adminCookie).del(`/leaf-categories/${leaf.id}`).expect(204);
    });

    it('renames the Other Leaf with its Parent only while it has the generated name', async () => {
      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: `Jams ${stamp}`,
            aisleId: seedId.aisle('dry-goods'),
          })
          .expect(201)
      ).body as Body;
      const otherOf = async () =>
        (await overview()).leafCategories.find(
          (leaf) => leaf.parentId === parent.id,
        ) as Body;
      const other = await otherOf();

      await as(adminCookie)
        .patch(`/parent-categories/${parent.id}`, {
          name: `Preserves ${stamp}`,
        })
        .expect(200);
      expect((await otherOf()).name).toBe(`Other preserves ${stamp}`);
      expect(await translationsOf('leaf_category', other.id)).toEqual([
        expect.objectContaining({ value: `Other preserves ${stamp}` }),
      ]);

      await as(adminCookie)
        .patch(`/leaf-categories/${other.id}`, { name: `Misc ${stamp}` })
        .expect(200);
      await as(adminCookie)
        .patch(`/parent-categories/${parent.id}`, { name: `Spreads2 ${stamp}` })
        .expect(200);
      expect((await otherOf()).name).toBe(`Misc ${stamp}`);

      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
    });

    it('never overwrites an Admin rename of the Other Leaf that lands during a Parent rename', async () => {
      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: `Chutneys ${stamp}`,
            aisleId: seedId.aisle('dry-goods'),
          })
          .expect(201)
      ).body as Body;
      const [other] = await database
        .select({ id: leafCategories.id })
        .from(leafCategories)
        .where(eq(leafCategories.parentId, parent.id));

      const client = await app.get<Pool>(DATABASE_POOL).connect();
      let parentRename: Promise<request.Response> | undefined;
      try {
        // The Admin's rename holds the Other Leaf's row, uncommitted.
        await client.query('BEGIN');
        await client.query(
          'UPDATE leaf_categories SET name = $1, normalized_name = $2 WHERE id = $3',
          [`Misc ${stamp}`, `misc ${stamp}`, other.id],
        );
        parentRename = Promise.resolve(
          as(adminCookie)
            .patch(`/parent-categories/${parent.id}`, {
              name: `Relishes ${stamp}`,
            })
            .then((r) => r),
        );
        for (;;) {
          const waiting = await client.query(
            `SELECT 1 FROM pg_stat_activity
             WHERE wait_event_type = 'Lock' AND pid <> pg_backend_pid()
               AND query ILIKE '%leaf_categories%'`,
          );
          if (waiting.rowCount) break;
          await new Promise((done) => setTimeout(done, 20));
        }
        await client.query('COMMIT');
      } finally {
        await client.query('ROLLBACK').catch(() => undefined);
        client.release();
      }
      expect((await parentRename)?.status).toBe(200);

      const [leaf] = await database
        .select({ name: leafCategories.name })
        .from(leafCategories)
        .where(eq(leafCategories.id, other.id));
      expect(leaf.name).toBe(`Misc ${stamp}`);

      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
    }, 20_000);

    it('never deletes the top-level Other Parent', async () => {
      await as(adminCookie)
        .del(`/parent-categories/${seedId.parent('other')}`)
        .expect(409)
        .expect({ code: 'catalog.other_leaf_protected', params: {} });
    });

    it('enforces unique Category names and a real Aisle', async () => {
      await as(adminCookie)
        .post('/parent-categories', {
          name: 'dairy',
          aisleId: seedId.aisle('dairy-eggs'),
        })
        .expect(409);
      await as(adminCookie)
        .post('/parent-categories', {
          name: `Orphan ${stamp}`,
          aisleId: '00000000-0000-4000-8000-000000000000',
        })
        .expect(404);
    });
  });

  describe('translations and Synonyms', () => {
    const ingredientId = seedId.ingredient('parmesan');

    it('enforces uniqueness per entity and locale, and display names per locale', async () => {
      // Parmesan already has the Romanian display name "Parmezan".
      await as(adminCookie)
        .post('/translations', {
          entityType: 'ingredient',
          entityId: ingredientId,
          locale: 'ro',
          kind: 'name',
          value: 'Alt nume',
        })
        .expect(409)
        .expect({ code: 'catalog.translation_exists', params: {} });

      const synonym = {
        entityType: 'ingredient',
        entityId: ingredientId,
        locale: 'en',
        kind: 'synonym',
        value: `Parm ${stamp}`,
      };
      await as(adminCookie).post('/translations', synonym).expect(201);
      const duplicate = await as(adminCookie)
        .post('/translations', { ...synonym, value: `PARM ${stamp}` })
        .expect(409);
      expect(duplicate.body).toEqual({
        code: 'catalog.translation_exists',
        params: {},
      });

      // A display name already used by another entity in that locale is a name clash.
      const other = (
        await as(adminCookie)
          .post('/ingredients', {
            leafCategoryId: seedId.leaf('hard-cheese'),
            name: `Clash ${stamp}`,
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Body;
      await as(adminCookie)
        .post('/translations', {
          entityType: 'ingredient',
          entityId: other.id,
          locale: 'ro',
          kind: 'name',
          value: 'Parmezan',
        })
        .expect(409)
        .expect({ code: 'catalog.name_taken', params: {} });
      await as(adminCookie).del(`/ingredients/${other.id}`).expect(204);
    });

    it('manages the English display name only through the entity', async () => {
      const [english] = (
        await translationsOf('ingredient', ingredientId)
      ).filter((t) => t.locale === 'en' && t.kind === 'name');
      const response = await as(adminCookie)
        .patch(`/translations/${english.id}`, { value: 'Other' })
        .expect(409);
      expect(response.body).toEqual({
        code: 'catalog.canonical_name_managed',
        params: {},
      });
      await as(adminCookie).del(`/translations/${english.id}`).expect(409);
    });

    it('rejects translations for entities that do not exist', async () => {
      await as(adminCookie)
        .post('/translations', {
          entityType: 'ingredient',
          entityId: '00000000-0000-4000-8000-000000000000',
          locale: 'ro',
          kind: 'synonym',
          value: 'fantoma',
        })
        .expect(404);
      await as(adminCookie)
        .patch('/translations/00000000-0000-4000-8000-000000000000', {
          value: 'x',
        })
        .expect(404);
    });

    it('deletes a Synonym', async () => {
      const row = (await translationsOf('ingredient', ingredientId)).find(
        (t) => t.kind === 'synonym' && t.value === `Parm ${stamp}`,
      );
      expect(row).toBeDefined();
      await as(adminCookie).del(`/translations/${row?.id}`).expect(204);
      expect(
        (await translationsOf('ingredient', ingredientId)).some(
          (t) => t.id === row?.id,
        ),
      ).toBe(false);
    });
  });
});
