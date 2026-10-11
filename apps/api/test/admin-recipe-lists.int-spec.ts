import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  cuisines,
  methods,
  recipes,
} from '../src/database/schema';
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
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    await database.delete(recipes).where(ilike(recipes.title, like));
    await database.delete(cuisines).where(ilike(cuisines.name, like));
    await database.delete(methods).where(ilike(methods.name, like));
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
});
