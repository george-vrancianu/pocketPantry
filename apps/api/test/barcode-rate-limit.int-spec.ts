import { eq } from 'drizzle-orm';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { knownBarcodes, user } from '../src/database/schema';
import { freshBarcode } from './support/fresh-barcode';

// Spec: #416, ADR 0013. Only calls that really go out to Open Food Facts are
// charged: Known Barcodes, cache hits and invalid codes never are. The client
// is replaced, so no test reaches the network.
const MEMBER_LIMIT = 3;
const GLOBAL_LIMIT = 5;

type Who = ReturnType<typeof import('./support/admin-session').client>;

describe('Barcode Lookup rate limit (integration)', () => {
  let app: NestFastifyApplication;
  let a: Who;
  let b: Who;
  let c: Who;
  let familyA: string;
  let database: Database;
  const asked: string[] = [];
  const stamp = Date.now();
  const saved = {
    member: process.env.BARCODE_LOOKUP_LIMIT_PER_MEMBER,
    global: process.env.BARCODE_LOOKUP_LIMIT_GLOBAL,
  };

  beforeAll(async () => {
    // AppModule reads env when first imported, so import it only now.
    process.env.BARCODE_LOOKUP_LIMIT_PER_MEMBER = String(MEMBER_LIMIT);
    process.env.BARCODE_LOOKUP_LIMIT_GLOBAL = String(GLOBAL_LIMIT);
    const supportPath = './support/create-test-app'; // a variable: TS demands a .js extension on literal dynamic imports, Jest resolves the .ts
    const sessionPath = './support/admin-session';
    const { createTestApp } = (await import(
      supportPath
    )) as typeof import('./support/create-test-app');
    const session = (await import(
      sessionPath
    )) as typeof import('./support/admin-session');
    app = await createTestApp([], undefined, undefined, {
      fetchProduct: (barcode) => {
        asked.push(barcode);
        return Promise.resolve(null);
      },
    });
    database = app.get<Database>(DATABASE);
    const emailA = `bc-limit-a-${stamp}@example.com`;
    a = session.client(app, await session.signUp(app, emailA, 'A'), '/api');
    b = session.client(
      app,
      await session.signUp(app, `bc-limit-b-${stamp}@example.com`, 'B'),
      '/api',
    );
    c = session.client(
      app,
      await session.signUp(app, `bc-limit-c-${stamp}@example.com`, 'C'),
      '/api',
    );
    const [row] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, emailA));
    familyA = row.familyId;
  });

  afterAll(async () => {
    process.env.BARCODE_LOOKUP_LIMIT_PER_MEMBER = saved.member;
    process.env.BARCODE_LOOKUP_LIMIT_GLOBAL = saved.global;
    await app.close();
  });

  const lookup = (who: Who, code: string) =>
    who.get(`/barcode-lookup/${code}?locale=en`);

  it('answers 429 barcode.rate_limited once a Member has used their Open Food Facts lookups, while cache hits and Known Barcodes still work', async () => {
    const first = freshBarcode();
    await lookup(a, first).expect(200);
    await lookup(a, freshBarcode()).expect(200);
    await lookup(a, freshBarcode()).expect(200);

    const fresh = freshBarcode();
    const limited = await lookup(a, fresh).expect(429);
    expect(limited.body).toEqual({ code: 'barcode.rate_limited', params: {} });
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    expect(asked).not.toContain(fresh);

    // Cache hit: the first code is cached now, so no call goes out.
    const callsBefore = asked.length;
    await lookup(a, first).expect(200);
    // Known Barcode of the Family.
    const known = freshBarcode();
    await database.insert(knownBarcodes).values({
      familyId: familyA,
      barcode: known,
      rawName: 'Rate limit test',
    });
    await lookup(a, known).expect(200);
    // Invalid codes are rejected, not charged.
    await lookup(a, '3017620422004').expect(400);
    expect(asked.length).toBe(callsBefore);
  });

  it('keeps the Member limit per Member', async () => {
    await lookup(b, freshBarcode()).expect(200);
  });

  it('answers 429 for everyone once the whole API has used its Open Food Facts budget', async () => {
    // a used 3 and b used 1: one call left in the global budget.
    await lookup(b, freshBarcode()).expect(200);
    const limited = await lookup(c, freshBarcode()).expect(429);
    expect(limited.body).toEqual({ code: 'barcode.rate_limited', params: {} });
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
  });
});
