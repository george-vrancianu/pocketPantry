import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations, eatingMoments } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Moment = {
  id: string;
  name: string;
  sortOrder: number;
  archived: boolean;
  translations: { locale: string; value: string }[];
};

jest.setTimeout(30_000);

describe('Admin Eating Moments (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  const stamp = Date.now();

  const list = async () =>
    (
      (await admin.get('').expect(200)).body as {
        eatingMoments: Moment[];
      }
    ).eatingMoments;
  const create = async (name: string) =>
    (await admin.post('/eating-moments', { name }).expect(201)).body as Moment;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `moments-admin-${stamp}@example.com`;
    admin = client(
      app,
      await signUp(app, email, 'Moments Admin'),
      '/api/admin/catalog',
    );
    await promoteToAdmin(database, email);
    member = client(
      app,
      await signUp(app, `moments-member-${stamp}@example.com`, 'Member'),
      '/api/admin/catalog',
    );
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    await database.delete(eatingMoments).where(ilike(eatingMoments.name, like));
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await app.close();
  });

  it('creates Eating Moments last in order, with an English name', async () => {
    const first = await create(`Breakfast ${stamp}`);
    const second = await create(`Dinner ${stamp}`);
    expect(second.sortOrder).toBeGreaterThan(first.sortOrder);
    const rows = (await list()).filter((m) => m.name.includes(`${stamp}`));
    expect(rows.map((m) => m.name)).toEqual([
      `Breakfast ${stamp}`,
      `Dinner ${stamp}`,
    ]);
    expect(rows[0].archived).toBe(false);
    expect(rows[0].translations.map((t) => [t.locale, t.value])).toEqual([
      ['en', `Breakfast ${stamp}`],
    ]);
    await admin
      .post('/eating-moments', { name: `breakfast ${stamp}` })
      .expect(409);
  });

  it('renames and translates an Eating Moment', async () => {
    const moment = await create(`Lunch ${stamp}`);
    await admin
      .patch(`/eating-moments/${moment.id}`, { name: `Midday ${stamp}` })
      .expect(200);
    await admin
      .post('/translations', {
        entityType: 'eating_moment',
        entityId: moment.id,
        locale: 'ro',
        kind: 'name',
        value: `Pranz ${stamp}`,
      })
      .expect(201);
    const row = (await list()).find((m) => m.id === moment.id);
    expect(row?.name).toBe(`Midday ${stamp}`);
    expect(row?.translations.map((t) => [t.locale, t.value]).sort()).toEqual([
      ['en', `Midday ${stamp}`],
      ['ro', `Pranz ${stamp}`],
    ]);
    await admin
      .patch('/eating-moments/00000000-0000-4000-8000-000000000000', {
        name: `Ghost ${stamp}`,
      })
      .expect(404);
  });

  it('reorders every Eating Moment at once and refuses a stale list', async () => {
    const a = await create(`Alpha ${stamp}`);
    const b = await create(`Beta ${stamp}`);
    const all = await list();
    const ids = all.map((m) => m.id);
    const swapped = ids.map((id) =>
      id === a.id ? b.id : id === b.id ? a.id : id,
    );
    await admin.put('/eating-moments/order', { ids: swapped }).expect(200);
    const after = (await list()).map((m) => m.id);
    expect(after).toEqual(swapped);
    const stale = await admin
      .put('/eating-moments/order', { ids: swapped.slice(1) })
      .expect(409);
    expect((stale.body as { code: string }).code).toBe(
      'catalog.eating_moment_order_stale',
    );
  });

  it('archives and unarchives, keeping the row', async () => {
    const moment = await create(`Snack ${stamp}`);
    await admin.post(`/eating-moments/${moment.id}/archive`).expect(200);
    expect((await list()).find((m) => m.id === moment.id)?.archived).toBe(true);
    await admin.post(`/eating-moments/${moment.id}/unarchive`).expect(200);
    expect((await list()).find((m) => m.id === moment.id)?.archived).toBe(
      false,
    );
    await admin
      .post('/eating-moments/00000000-0000-4000-8000-000000000000/archive')
      .expect(404);
  });

  it('keeps Eating Moments Admin-only', async () => {
    await member.post('/eating-moments', { name: `Nope ${stamp}` }).expect(403);
    await member.put('/eating-moments/order', { ids: [] }).expect(403);
  });
});
