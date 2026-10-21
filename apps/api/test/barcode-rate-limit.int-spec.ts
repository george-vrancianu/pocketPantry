import { eq } from 'drizzle-orm';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { knownBarcodes, user } from '../src/database/schema';
import { BarcodeLookupService } from '../src/barcode/barcode-lookup.service';
import { OpenFoodFactsThrottle } from '../src/barcode/open-food-facts-throttle';
import { freshBarcode } from './support/fresh-barcode';

// Spec: #416, ADR 0013. Only calls that really go out to Open Food Facts are
// charged: Known Barcodes, cache hits and invalid codes never are. The client
// is replaced, so no test reaches the network.
const MEMBER_LIMIT = 3;
const GLOBAL_LIMIT = 5;

type Who = ReturnType<typeof import('./support/admin-session').client>;

describe('Barcode Lookup rate limit (integration)', () => {
  let app: NestFastifyApplication;
  let session: typeof import('./support/admin-session');
  let database: Database;
  let throttle: OpenFoodFactsThrottle;
  let a: Who;
  let b: Who;
  let c: Who;
  let familyA: string;
  let time = 1_000_000;
  let gate: Promise<void> | null = null;
  const asked: string[] = [];
  const stamp = Date.now();
  let members = 0;
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
    session = (await import(
      sessionPath
    )) as typeof import('./support/admin-session');
    app = await createTestApp([], undefined, undefined, {
      fetchProduct: async (barcode) => {
        asked.push(barcode);
        await gate;
        return null;
      },
    });
    database = app.get<Database>(DATABASE);
    throttle = app.get(OpenFoodFactsThrottle);
    throttle.clock = () => time;
  });

  // Every test starts with fresh Members and an empty throttle, so none depends on another.
  beforeEach(async () => {
    time += 120_000;
    gate = null;
    asked.length = 0;
    const join = async (label: string) => {
      const email = `bc-limit-${label}-${stamp}-${++members}@example.com`;
      return {
        email,
        who: session.client(
          app,
          await session.signUp(app, email, label),
          '/api',
        ),
      };
    };
    const [first, second, third] = [
      await join('a'),
      await join('b'),
      await join('c'),
    ];
    [a, b, c] = [first.who, second.who, third.who];
    const [row] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, first.email));
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
    expect(Number(limited.headers['retry-after'])).toBe(60);
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

    // A minute later the Member can look new codes up again.
    time += 60_000;
    await lookup(a, fresh).expect(200);
  });

  it('limits each Member separately', async () => {
    for (let i = 0; i < MEMBER_LIMIT; i += 1) {
      await lookup(a, freshBarcode()).expect(200);
    }
    await lookup(a, freshBarcode()).expect(429);
    await lookup(b, freshBarcode()).expect(200);
  });

  it('answers 429 for everyone once the whole API has used its Open Food Facts budget', async () => {
    for (let i = 0; i < MEMBER_LIMIT; i += 1) {
      await lookup(a, freshBarcode()).expect(200);
    }
    for (let i = 0; i < GLOBAL_LIMIT - MEMBER_LIMIT; i += 1) {
      await lookup(b, freshBarcode()).expect(200);
    }
    const limited = await lookup(c, freshBarcode()).expect(429);
    expect(limited.body).toEqual({ code: 'barcode.rate_limited', params: {} });
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
  });

  it('makes one call, and one charge, for overlapping lookups of the same new code', async () => {
    const service = app.get<BarcodeLookupService>(
      BarcodeLookupService,
    ) as unknown as {
      freshCached: (barcode: string) => Promise<unknown>;
    };
    const freshCached = service.freshCached.bind(service);
    let cacheChecks = 0;
    service.freshCached = async (barcode) => {
      const result = await freshCached(barcode);
      cacheChecks += 1;
      return result;
    };
    const code = freshBarcode();
    let release = () => {};
    gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const both = Promise.all([
      lookup(a, code).then((res) => res.status),
      lookup(a, code).then((res) => res.status),
    ]);
    // Hold Open Food Facts' answer until both lookups are past the cache check.
    while (cacheChecks < 2) {
      await new Promise((resolve) => setImmediate(resolve));
    }
    for (let i = 0; i < 5; i += 1) {
      await new Promise((resolve) => setImmediate(resolve));
    }
    release();
    service.freshCached = freshCached;
    expect(await both).toEqual([200, 200]);
    expect(asked).toEqual([code]);
    // Only one charge: two more new codes fit in the Member's limit of 3.
    gate = null;
    await lookup(a, freshBarcode()).expect(200);
    await lookup(a, freshBarcode()).expect(200);
    await lookup(a, freshBarcode()).expect(429);
  });
});
