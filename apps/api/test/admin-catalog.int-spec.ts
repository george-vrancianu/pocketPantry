import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { and, eq, ilike, sql } from 'drizzle-orm';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  shoppingItems,
  shoppingLists,
  ingredients,
  leafCategories,
  parentCategories,
  user,
} from '../src/database/schema';
import { TEST_ORIGIN } from './support/create-test-app';

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
  const refTable = (kind: string) => `admin_spec_${kind}_refs_${stamp}`;

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
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
    database = app.get<Database>(DATABASE);
    // Stand-in for a Leaf Category dependant (Batches arrive in a later ticket):
    // a table whose foreign key blocks deletes, like the real one will.
    await database.execute(
      sql.raw(`
        CREATE TABLE ${refTable('leaf')} (
          leaf_id uuid REFERENCES leaf_categories(id)
        );
      `),
    );

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
    await database.execute(sql.raw(`DROP TABLE IF EXISTS ${refTable('leaf')}`));
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

    it('rejects deleting a Leaf Category that another table still references', async () => {
      const parentId = seedId.parent('dairy');
      const leaf = (
        await as(adminCookie)
          .post('/leaf-categories', {
            parentId,
            name: `Referenced leaf ${stamp}`,
          })
          .expect(201)
      ).body as Body;
      await database.execute(
        sql.raw(`INSERT INTO ${refTable('leaf')} VALUES ('${leaf.id}')`),
      );
      await as(adminCookie)
        .del(`/leaf-categories/${leaf.id}`)
        .expect(409)
        .expect({ code: 'catalog.category_not_empty', params: {} });
      await database.execute(sql.raw(`DELETE FROM ${refTable('leaf')}`));
      await as(adminCookie).del(`/leaf-categories/${leaf.id}`).expect(204);
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
        code: 'catalog.name_taken',
        params: {},
      });
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
