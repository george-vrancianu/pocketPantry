import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, ilike } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { Pool } from 'pg';
import request from 'supertest';
import { lockAisleOrder } from '../src/catalog/aisle-order-lock';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE, DATABASE_POOL } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  aisles,
  batches,
  catalogTranslations,
  shoppingItems,
  shoppingLists,
  ingredients,
  leafCategories,
  parentCategories,
  user,
} from '../src/database/schema';
import { normalizeName } from '../src/catalog/normalize';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

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
  const adminEmail = `chef-admin-${stamp}@example.com`;
  const shoppingListIds: string[] = [];
  const batchIds: string[] = [];

  let signUps = 0;
  async function signUp(email: string, name: string) {
    // A fresh client IP per signup keeps clear of Better Auth's sign-up rate limit.
    const n = ++signUps;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.16.${Math.floor(n / 250)}.${n % 250}`)
      .send({ name, email, password: 'correct-horse-staple' });
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
    put: (path: string, body: object) =>
      request(app.getHttpServer())
        .put(`/api/admin/catalog${path}`)
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
            type as
              'aisle' | 'ingredient' | 'leaf_category' | 'parent_category',
          ),
          eq(catalogTranslations.entityId, id),
        ),
      );
  }

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    adminCookie = (await signUp(adminEmail, 'Chef Admin')).cookie;
    await promoteToAdmin(database, adminEmail);
    memberCookie = (await signUp(`member-${stamp}@example.com`, 'Member'))
      .cookie;
  });

  afterAll(async () => {
    // Leave no rows behind even if a test failed midway: later specs in this worker count Catalog rows.
    for (const id of shoppingListIds) {
      await database.delete(shoppingLists).where(eq(shoppingLists.id, id));
    }
    for (const id of batchIds) {
      await database.delete(batches).where(eq(batches.id, id));
    }
    const like = `%${stamp}%`;
    for (const table of [
      ingredients,
      leafCategories,
      parentCategories,
      aisles,
    ]) {
      await database.delete(table).where(ilike(table.name, like));
    }
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  describe('role assignment', () => {
    it('never grants Admin at signup, even to a formerly allow-listed email', async () => {
      // Was on the ADMIN_EMAILS allow-list; signup no longer reads one.
      const { cookie, body } = await signUp(
        'chef.admin@example.com',
        'Chef Admin',
      );
      expect((body as { user?: { role?: string } }).user?.role).toBe('regular');
      await as(cookie).get('').expect(403);
    });

    it('lets a Member whose role is set to admin in the database through', async () => {
      const email = `promoted-${stamp}@example.com`;
      const { cookie } = await signUp(email, 'Promoted');
      await as(cookie).get('').expect(403);
      await promoteToAdmin(database, email);
      await as(cookie).get('').expect(200);
      // The web RequireAdmin reads the role from the session.
      const session = await request(app.getHttpServer())
        .get('/api/auth/get-session')
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .expect(200);
      expect((session.body as { user: { role: string } }).user.role).toBe(
        'admin',
      );
    });

    it('ignores a role supplied by the client at signup', async () => {
      const email = `sneaky-${stamp}@example.com`;
      await request(app.getHttpServer())
        .post('/api/auth/sign-up/email')
        .set('origin', TEST_ORIGIN)
        .set('x-forwarded-for', '10.16.250.1')
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
        .where(eq(user.email, adminEmail));
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
        .where(eq(user.email, adminEmail));
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

      const pool = app.get<Pool>(DATABASE_POOL);
      const client = await pool.connect();
      let parentRename: Promise<request.Response>;
      let committed = false;
      try {
        // The Admin's rename holds the Other Leaf's row, uncommitted.
        await client.query('BEGIN');
        const holder = await client.query<{ pid: number }>(
          'SELECT pg_backend_pid() AS pid',
        );
        await client.query(
          'UPDATE leaf_categories SET name = $1, normalized_name = $2 WHERE id = $3',
          [`Misc ${stamp}`, normalizeName(`Misc ${stamp}`), other.id],
        );
        parentRename = as(adminCookie)
          .patch(`/parent-categories/${parent.id}`, {
            name: `Relishes ${stamp}`,
          })
          .then((r) => r);
        // Poll from the pool, not `client`: inside a transaction pg_stat_activity is a frozen snapshot.
        for (let attempt = 0; ; attempt++) {
          const { rowCount } = await pool.query(
            'SELECT 1 FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))',
            [holder.rows[0].pid],
          );
          if (rowCount) break;
          if (attempt === 250)
            throw new Error('the Parent rename never blocked');
          await new Promise((done) => setTimeout(done, 20));
        }
        await client.query('COMMIT');
        committed = true;
      } finally {
        if (!committed) await client.query('ROLLBACK').catch(() => undefined);
        client.release();
      }
      expect((await parentRename).status).toBe(200);

      const [leaf] = await database
        .select({ name: leafCategories.name })
        .from(leafCategories)
        .where(eq(leafCategories.id, other.id));
      expect(leaf.name).toBe(`Misc ${stamp}`);

      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
    });

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

  describe('Aisles', () => {
    it('creates an Aisle at the end of the shop order, renames it, and keeps its English name in step', async () => {
      const before = (await overview()).aisles;
      const made = (
        await as(adminCookie)
          .post('/aisles', { name: `Test aisle ${stamp}` })
          .expect(201)
      ).body as Body;
      expect(made).toMatchObject({
        name: `Test aisle ${stamp}`,
        sortOrder: Math.max(...before.map((a) => a.sortOrder as number)) + 1,
      });
      const after = (await overview()).aisles;
      expect(after.at(-1)?.id).toBe(made.id);

      await as(adminCookie)
        .patch(`/aisles/${made.id}`, { name: `Renamed aisle ${stamp}` })
        .expect(200);
      const names = await translationsOf('aisle', made.id);
      expect(names.map((t) => [t.locale, t.kind, t.value])).toEqual([
        ['en', 'name', `Renamed aisle ${stamp}`],
      ]);

      await as(adminCookie).del(`/aisles/${made.id}`).expect(204);
      expect(await translationsOf('aisle', made.id)).toEqual([]);
      expect((await overview()).aisles.map((a) => a.id)).toEqual(
        before.map((a) => a.id),
      );
    });

    it('refuses to delete an Aisle while a Parent Category uses it', async () => {
      const aisle = (
        await as(adminCookie)
          .post('/aisles', { name: `Busy aisle ${stamp}` })
          .expect(201)
      ).body as Body;
      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: `On busy aisle ${stamp}`,
            aisleId: aisle.id,
          })
          .expect(201)
      ).body as Body;

      await as(adminCookie)
        .del(`/aisles/${aisle.id}`)
        .expect(409)
        .expect({ code: 'catalog.aisle_in_use', params: { parents: 1 } });
      expect(await translationsOf('aisle', aisle.id)).toHaveLength(1);

      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
      await as(adminCookie).del(`/aisles/${aisle.id}`).expect(204);
      await as(adminCookie).del(`/aisles/${aisle.id}`).expect(404);
    });

    it('translates an Aisle through the translations endpoint', async () => {
      const aisle = (
        await as(adminCookie)
          .post('/aisles', { name: `Spices ${stamp}` })
          .expect(201)
      ).body as Body;
      await as(adminCookie)
        .post('/translations', {
          entityType: 'aisle',
          entityId: aisle.id,
          locale: 'ro',
          kind: 'name',
          value: `Condimente ${stamp}`,
        })
        .expect(201);
      const listed = (await overview()).aisles.find((a) => a.id === aisle.id);
      expect(listed?.translations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            locale: 'ro',
            value: `Condimente ${stamp}`,
          }),
        ]),
      );
      await as(adminCookie).del(`/aisles/${aisle.id}`).expect(204);
      expect(await translationsOf('aisle', aisle.id)).toEqual([]);
    });

    it('shows an Admin-added Aisle translation on the Shopping List in that locale', async () => {
      const aisle = (
        await as(adminCookie)
          .post('/aisles', { name: `Deli ${stamp}` })
          .expect(201)
      ).body as Body;
      const parent = (
        await as(adminCookie)
          .post('/parent-categories', {
            name: `Deli parent ${stamp}`,
            aisleId: aisle.id,
          })
          .expect(201)
      ).body as Body;
      const leaf = (
        await as(adminCookie)
          .post('/leaf-categories', {
            parentId: parent.id,
            name: `Deli leaf ${stamp}`,
          })
          .expect(201)
      ).body as Body;
      const ingredient = (
        await as(adminCookie)
          .post('/ingredients', {
            leafCategoryId: leaf.id,
            name: `Pastrami ${stamp}`,
            defaultUnit: 'g',
          })
          .expect(201)
      ).body as Body;
      await as(adminCookie)
        .post('/translations', {
          entityType: 'aisle',
          entityId: aisle.id,
          locale: 'da',
          kind: 'name',
          value: `Pålæg ${stamp}`,
        })
        .expect(201);

      type List = {
        id: string;
        groups: Array<{ aisle: { id: string; name: string } | null }>;
      };
      const shopping = (method: 'get' | 'post', path: string) =>
        request(app.getHttpServer())
          [method](`/api/shopping-list${path}`)
          .set('origin', TEST_ORIGIN)
          .set('cookie', adminCookie);
      const added = (
        await shopping('post', '/items?locale=da')
          .send({ ingredientId: ingredient.id })
          .expect(200)
      ).body as List;
      shoppingListIds.push(added.id);
      const aisleName = async (locale: string) => {
        const list = (await shopping('get', `?locale=${locale}`).expect(200))
          .body as List;
        return list.groups.find((g) => g.aisle?.id === aisle.id)?.aisle?.name;
      };
      try {
        expect(await aisleName('da')).toBe(`Pålæg ${stamp}`);
        // Romanian has no name yet: the English one stands in.
        expect(await aisleName('ro')).toBe(`Deli ${stamp}`);
      } finally {
        await database
          .delete(shoppingItems)
          .where(eq(shoppingItems.ingredientId, ingredient.id));
      }
      await as(adminCookie).del(`/ingredients/${ingredient.id}`).expect(204);
      await as(adminCookie).del(`/leaf-categories/${leaf.id}`).expect(204);
      await as(adminCookie).del(`/parent-categories/${parent.id}`).expect(204);
      await as(adminCookie).del(`/aisles/${aisle.id}`).expect(204);
    });

    it('reorders the Aisles, and the Shopping List groups follow the new order', async () => {
      const shopping = (method: 'get' | 'post', path = '') =>
        request(app.getHttpServer())
          [method](`/api/shopping-list${path}`)
          .set('origin', TEST_ORIGIN)
          .set('cookie', adminCookie);
      for (const slug of ['milk', 'tomato']) {
        await shopping('post', '/items')
          .send({ ingredientId: seedId.ingredient(slug) })
          .expect(200);
      }
      type List = { id: string; groups: Array<{ aisle: Body | null }> };
      const groupIds = async () => {
        const list = (await shopping('get').expect(200)).body as List;
        shoppingListIds.push(list.id);
        return list.groups.map((g) => g.aisle?.id);
      };
      const dairy = seedId.aisle('dairy-eggs');
      const produce = seedId.aisle('fruit-veg');
      expect(await groupIds()).toEqual([produce, dairy]);

      const original = (await overview()).aisles.map((a) => a.id);
      const dairyFirst = [dairy, ...original.filter((id) => id !== dairy)];
      try {
        const reordered = await as(adminCookie)
          .put('/aisles/order', { ids: dairyFirst })
          .expect(200);
        expect((reordered.body as Body[]).map((a) => a.id)).toEqual(dairyFirst);
        expect((await overview()).aisles.map((a) => a.id)).toEqual(dairyFirst);
        expect(await groupIds()).toEqual([dairy, produce]);
      } finally {
        await as(adminCookie)
          .put('/aisles/order', { ids: original })
          .expect(200);
      }
      expect(await groupIds()).toEqual([produce, dairy]);
    });

    /** Polls until `count` sessions wait on `holderPid`; from the pool, since inside a transaction pg_stat_activity is a frozen snapshot. */
    async function waitUntilBlocked(
      holderPid: number,
      count: number,
      what: string,
    ) {
      const pool = app.get<Pool>(DATABASE_POOL);
      for (let attempt = 0; ; attempt++) {
        const { rowCount } = await pool.query(
          'SELECT 1 FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))',
          [holderPid],
        );
        if ((rowCount ?? 0) >= count) return;
        if (attempt === 250) throw new Error(`${what} never blocked`);
        await new Promise((done) => setTimeout(done, 20));
      }
    }

    it('serialises an API delete and a reorder on the Aisle order lock', async () => {
      const doomed = (
        await as(adminCookie)
          .post('/aisles', { name: `Queued aisle ${stamp}` })
          .expect(201)
      ).body as Body;
      const ids = (await overview()).aisles.map((a) => a.id);

      const client = await app.get<Pool>(DATABASE_POOL).connect();
      let remove: Promise<request.Response>;
      let reorder: Promise<request.Response>;
      let released = false;
      try {
        await client.query('BEGIN');
        const holder = await client.query<{ pid: number }>(
          'SELECT pg_backend_pid() AS pid',
        );
        await lockAisleOrder(drizzle(client));
        const pid = holder.rows[0].pid;
        // Queued in this order: the delete first, then the reorder.
        remove = as(adminCookie)
          .del(`/aisles/${doomed.id}`)
          .then((r) => r);
        await waitUntilBlocked(pid, 1, 'the delete');
        reorder = as(adminCookie)
          .put('/aisles/order', { ids: [...ids].reverse() })
          .then((r) => r);
        await waitUntilBlocked(pid, 2, 'the reorder');
        await client.query('COMMIT');
        released = true;
      } finally {
        if (!released) await client.query('ROLLBACK').catch(() => undefined);
        client.release();
      }
      expect((await remove).status).toBe(204);
      // The reorder ran after the delete committed, so its list is stale.
      const response = await reorder;
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 'catalog.aisle_order_stale',
        params: {},
      });
      expect((await overview()).aisles.map((a) => a.id)).toEqual(
        ids.filter((id) => id !== doomed.id),
      );
    });

    it('refuses as stale a reorder naming an Aisle deleted from outside the service while it runs', async () => {
      const doomed = (
        await as(adminCookie)
          .post('/aisles', { name: `Doomed aisle ${stamp}` })
          .expect(201)
      ).body as Body;
      const ids = (await overview()).aisles.map((a) => a.id);

      const client = await app.get<Pool>(DATABASE_POOL).connect();
      let reorder: Promise<request.Response>;
      let committed = false;
      try {
        // A delete that skips the advisory lock, uncommitted, holding the row.
        await client.query('BEGIN');
        const holder = await client.query<{ pid: number }>(
          'SELECT pg_backend_pid() AS pid',
        );
        await client.query(
          'DELETE FROM catalog_translations WHERE entity_id = $1',
          [doomed.id],
        );
        await client.query('DELETE FROM aisles WHERE id = $1', [doomed.id]);
        reorder = as(adminCookie)
          .put('/aisles/order', { ids: [...ids].reverse() })
          .then((r) => r);
        await waitUntilBlocked(holder.rows[0].pid, 1, 'the reorder');
        await client.query('COMMIT');
        committed = true;
      } finally {
        if (!committed) await client.query('ROLLBACK').catch(() => undefined);
        client.release();
      }
      const response = await reorder;
      expect(response.status).toBe(409);
      expect(response.body).toEqual({
        code: 'catalog.aisle_order_stale',
        params: {},
      });
      expect((await overview()).aisles.map((a) => a.id)).toEqual(
        ids.filter((id) => id !== doomed.id),
      );
    });

    it('refuses a shop order that does not name every Aisle exactly once', async () => {
      const ids = (await overview()).aisles.map((a) => a.id);
      await as(adminCookie)
        .put('/aisles/order', { ids: ids.slice(1) })
        .expect(409)
        .expect({ code: 'catalog.aisle_order_stale', params: {} });
      await as(adminCookie)
        .put('/aisles/order', {
          ids: [...ids.slice(1), '00000000-0000-4000-8000-000000000000'],
        })
        .expect(409);
      const duplicate = await as(adminCookie)
        .put('/aisles/order', { ids: [ids[0], ...ids.slice(0, -1)] })
        .expect(400);
      expect((duplicate.body as Body).code).toBe('validation_failed');
      expect((await overview()).aisles.map((a) => a.id)).toEqual(ids);
    });

    it('enforces unique Aisle names and valid input', async () => {
      await as(adminCookie)
        .post('/aisles', { name: 'BAKERY' })
        .expect(409)
        .expect({ code: 'catalog.name_taken', params: {} });
      await as(adminCookie).post('/aisles', { name: '!!!' }).expect(400);
      await as(adminCookie)
        .patch(`/aisles/${seedId.aisle('frozen')}`, { name: 'Bakery' })
        .expect(409);
      await as(adminCookie)
        .patch('/aisles/00000000-0000-4000-8000-000000000000', { name: 'Gone' })
        .expect(404);
      await as(adminCookie)
        .patch(`/aisles/${seedId.aisle('frozen')}`, {})
        .expect(400);
    });
  });

  describe('translations and Synonyms', () => {
    const ingredientId = seedId.ingredient('parmesan');

    it('takes a Danish Synonym and a Danish display name, since Danish is a catalog locale', async () => {
      const entry = {
        entityType: 'leaf_category',
        entityId: seedId.leaf('hard-cheese'),
        locale: 'da',
      };
      const synonym = await as(adminCookie)
        .post('/translations', {
          ...entry,
          kind: 'synonym',
          value: `Hård ost ${stamp}`,
        })
        .expect(201);
      expect(synonym.body).toMatchObject({ locale: 'da', kind: 'synonym' });
      // The seed already gave this Leaf its Danish name, so a second one is a clash.
      await as(adminCookie)
        .post('/translations', {
          ...entry,
          kind: 'name',
          value: `Ost ${stamp}`,
        })
        .expect(409);
    });

    it('creates a Danish display name for an entity that has none, and rejects a locale outside the catalog', async () => {
      const created = await as(adminCookie)
        .post('/ingredients', {
          leafCategoryId: seedId.leaf('hard-cheese'),
          name: `Danbo ${stamp}`,
          defaultUnit: 'g',
        })
        .expect(201);
      const entry = {
        entityType: 'ingredient',
        entityId: (created.body as { id: string }).id,
        kind: 'name',
        value: `Danbo ost ${stamp}`,
      };
      const name = await as(adminCookie)
        .post('/translations', { ...entry, locale: 'da' })
        .expect(201);
      expect(name.body).toMatchObject({ locale: 'da', kind: 'name' });
      await as(adminCookie)
        .post('/translations', { ...entry, locale: 'fr' })
        .expect(400);
    });

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
