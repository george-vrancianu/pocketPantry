import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, like } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { promoCode } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Entry = {
  id: string;
  code: string;
  credits: number;
  note: string | null;
  createdAt: string;
  status: 'unused' | 'redeemed' | 'revoked';
  redeemedAt: string | null;
  redeemedByName: string | null;
  redeemedByEmail: string | null;
  redeemedFamilyId: string | null;
};
type Page = { entries: Entry[]; nextCursor: string | null };

jest.setTimeout(30_000);

describe('Admin Promo Codes (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  const stamp = Date.now();
  const note = (label: string) => `${label} ${stamp}`;

  const generate = async (body: object = {}) =>
    (await admin.post('', body).expect(201)).body as { codes: string[] };
  const list = async (query = '') =>
    (await admin.get(`?${query}`).expect(200)).body as Page;
  // Only the rows this run made: other specs share the table.
  const mine = (page: Page) =>
    page.entries.filter((e) => e.note?.endsWith(`${stamp}`));
  const rowOf = async (code: string) =>
    (await list('limit=100')).entries.find((e) => e.code === code)!;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `promo-admin-${stamp}@example.com`;
    admin = client(
      app,
      await signUp(app, email, 'Promo Admin'),
      '/api/admin/promo-codes',
    );
    await promoteToAdmin(database, email);
    member = client(
      app,
      await signUp(app, `promo-member-${stamp}@example.com`, 'Member'),
      '/api/admin/promo-codes',
    );
  });

  afterAll(async () => {
    await database.delete(promoCode).where(like(promoCode.note, `%${stamp}`));
    await app.close();
  });

  it('refuses a non-Admin on every route', async () => {
    const id = '00000000-0000-4000-8000-000000000000';
    for (const response of [
      await member.post('', {}),
      await member.get(''),
      await member.post(`/${id}/revoke`),
    ]) {
      expect(response.status).toBe(403);
      expect(response.body).toMatchObject({ code: 'auth.admin_required' });
    }
  });

  it('generates one code of 100 Credits by default, shown as XXXXX-XXXXX', async () => {
    const { codes } = await generate({ note: note('default') });
    expect(codes).toHaveLength(1);
    expect(codes[0]).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
    expect(codes[0]).not.toMatch(/[01OIL]/);
    expect(await rowOf(codes[0])).toMatchObject({
      credits: 100,
      note: note('default'),
      status: 'unused',
      redeemedAt: null,
      redeemedByName: null,
    });
  });

  it('generates a batch of distinct codes with the given Credits, and allows 0', async () => {
    const { codes } = await generate({
      count: 50,
      credits: 0,
      note: note('batch'),
    });
    expect(new Set(codes).size).toBe(50);
    expect(await rowOf(codes[0])).toMatchObject({ credits: 0 });
    const top = await generate({ credits: 10_000, note: note('top') });
    expect(await rowOf(top.codes[0])).toMatchObject({ credits: 10_000 });
  });

  it.each([
    { count: 0 },
    { count: 51 },
    { count: 1.5 },
    { credits: -1 },
    { credits: 10_001 },
    { credits: 2.5 },
    { note: 'x'.repeat(501) },
  ])('rejects %j with validation_failed', async (body) => {
    const response = await admin.post('', body).expect(400);
    expect(response.body).toMatchObject({ code: 'validation_failed' });
  });

  it('lists newest first, filters by status and pages with a cursor', async () => {
    const tag = note('order');
    const first = (await generate({ note: tag })).codes[0];
    const second = (await generate({ note: tag })).codes[0];
    const third = (await generate({ note: tag })).codes[0];
    const id = (await rowOf(second)).id;
    await admin.post(`/${id}/revoke`).expect(201);

    const all = mine(await list('limit=100')).filter((e) => e.note === tag);
    expect(all.map((e) => e.code)).toEqual([third, second, first]);

    const revoked = mine(await list('status=revoked&limit=100')).filter(
      (e) => e.note === tag,
    );
    expect(revoked.map((e) => e.code)).toEqual([second]);
    const unused = mine(await list('status=unused&limit=100')).filter(
      (e) => e.note === tag,
    );
    expect(unused.map((e) => e.code)).toEqual([third, first]);
    const redeemed = await list('status=redeemed&limit=100');
    expect(redeemed.entries.every((e) => e.status === 'redeemed')).toBe(true);

    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const page: Page = await list(
        `limit=2${cursor ? `&cursor=${cursor}` : ''}`,
      );
      expect(page.entries.length).toBeLessThanOrEqual(2);
      seen.push(...page.entries.map((e) => e.code));
      cursor = page.nextCursor;
    } while (cursor && seen.length < 500);
    expect(new Set(seen).size).toBe(seen.length);
    expect(seen).toEqual(expect.arrayContaining([first, second, third]));
    expect(seen.indexOf(third)).toBeLessThan(seen.indexOf(first));
  });

  it('rejects a bad status, limit or cursor', async () => {
    await admin.get('?status=nope').expect(400);
    await admin.get('?limit=0').expect(400);
    await admin.get('?limit=101').expect(400);
    await admin.get('?cursor=garbage').expect(400);
  });

  it('revokes an unused code once, then refuses with promo_code.not_revocable', async () => {
    const code = (await generate({ note: note('revoke') })).codes[0];
    const { id } = await rowOf(code);
    await admin.post(`/${id}/revoke`).expect(201);
    expect(await rowOf(code)).toMatchObject({ status: 'revoked' });
    const again = await admin.post(`/${id}/revoke`).expect(409);
    expect(again.body).toMatchObject({ code: 'promo_code.not_revocable' });
  });

  it('refuses to revoke a redeemed code, and shows who redeemed it', async () => {
    const code = (await generate({ note: note('redeemed') })).codes[0];
    const { id } = await rowOf(code);
    const familyId = '11111111-1111-4111-8111-111111111111';
    await database
      .update(promoCode)
      .set({
        redeemedAt: new Date(),
        redeemedByName: 'Ada',
        redeemedByEmail: 'ada@example.com',
        redeemedFamilyId: familyId,
      })
      .where(eq(promoCode.id, id));
    const row = await rowOf(code);
    expect(row).toMatchObject({
      status: 'redeemed',
      redeemedByName: 'Ada',
      redeemedByEmail: 'ada@example.com',
      redeemedFamilyId: familyId,
    });
    expect(row.redeemedAt).not.toBeNull();
    const response = await admin.post(`/${id}/revoke`).expect(409);
    expect(response.body).toMatchObject({ code: 'promo_code.not_revocable' });
  });

  it('answers promo_code.not_found for an unknown id', async () => {
    const response = await admin
      .post('/00000000-0000-4000-8000-000000000000/revoke')
      .expect(404);
    expect(response.body).toMatchObject({ code: 'promo_code.not_found' });
  });
});
