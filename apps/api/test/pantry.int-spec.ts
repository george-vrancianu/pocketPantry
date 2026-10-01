import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  leafCategories,
  parentCategories,
  user,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Batch = {
  id: string;
  name: string;
  ingredientId: string | null;
  unmatched: boolean;
  quantity: number | null;
  unit: string | null;
  location: string;
  expiryDate: string | null;
  productDescription: string | null;
};

const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

describe('Pantry (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    await seedCatalog(database);
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.6.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Pantry ${n}`,
        email: `pantry-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return {
      cookie,
      userId: (response.body as { user: { id: string } }).user.id,
    };
  }

  const add = (cookie: string, body: object, locale = 'en') =>
    request(app.getHttpServer())
      .post('/api/pantry/batches')
      .query({ locale })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send(body);

  const list = async (cookie: string, locale = 'en') =>
    (
      (
        await request(app.getHttpServer())
          .get('/api/pantry')
          .query({ locale })
          .set('origin', TEST_ORIGIN)
          .set('cookie', cookie)
          .expect(200)
      ).body as { batches: Batch[] }
    ).batches;

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/api/pantry').expect(401);
  });

  it('applies the Leaf Category defaults for expiry and Location', async () => {
    const { cookie } = await signUp();
    const response = await add(cookie, {
      ingredientId: seedId.ingredient('parmesan'),
      quantity: 200,
      unit: 'g',
      productDescription: 'Grana Padano 200g',
    }).expect(201);
    const batch = response.body as Batch;
    expect(batch).toMatchObject({
      name: 'Parmesan',
      unmatched: false,
      quantity: 200,
      unit: 'g',
      location: 'fridge',
      expiryDate: inDays(60),
      productDescription: 'Grana Padano 200g',
    });
  });

  it('uses the Leaf defaults when no quantity is given', async () => {
    const { cookie } = await signUp();
    const batch = (
      await add(cookie, { ingredientId: seedId.ingredient('milk') }).expect(201)
    ).body as Batch;
    expect(batch.location).toBe('fridge');
    expect(batch.expiryDate).toBe(inDays(7));
    expect(batch.quantity).toBeNull();
    expect(batch.unit).toBeNull();
  });

  it('lets the Member override Location and expiry, including no expiry', async () => {
    const { cookie } = await signUp();
    const overridden = (
      await add(cookie, {
        ingredientId: seedId.ingredient('parmesan'),
        location: 'freezer',
        expiryDate: '2030-01-31',
      }).expect(201)
    ).body as Batch;
    expect(overridden.location).toBe('freezer');
    expect(overridden.expiryDate).toBe('2030-01-31');

    const none = (
      await add(cookie, {
        ingredientId: seedId.ingredient('parmesan'),
        expiryDate: null,
      }).expect(201)
    ).body as Batch;
    expect(none.expiryDate).toBeNull();
  });

  it('saves an Unmatched Batch under the "Other" Leaf with its raw name', async () => {
    const { cookie } = await signUp();
    const batch = (
      await add(cookie, {
        rawName: 'Zorblax paste',
        location: 'cupboard',
      }).expect(201)
    ).body as Batch;
    expect(batch).toMatchObject({
      name: 'Zorblax paste',
      unmatched: true,
      ingredientId: null,
      location: 'cupboard',
      expiryDate: null,
    });
    const [row] = await database
      .select()
      .from(batches)
      .where(eq(batches.id, batch.id));
    expect(row.leafCategoryId).toBe(seedId.leaf('other-other'));
    expect(row.rawName).toBe('Zorblax paste');
  });

  it('files an Unmatched Batch under the chosen Parent Category\'s "Other" Leaf, with its defaults', async () => {
    const { cookie } = await signUp();
    const batch = (
      await add(cookie, {
        rawName: 'Mystery cheese',
        parentCategoryId: seedId.parent('dairy'),
      }).expect(201)
    ).body as Batch;
    expect(batch.location).toBe('fridge');
    expect(batch.expiryDate).toBe(inDays(10));
    const [row] = await database
      .select()
      .from(batches)
      .where(eq(batches.id, batch.id));
    expect(row.leafCategoryId).toBe(seedId.leaf('dairy-other'));
  });

  // Own Parent so these tests never touch (or race on) the shared seed rows.
  async function createParent(label: string, withOtherLeaf: boolean) {
    const parentId = randomUUID();
    const leafId = randomUUID();
    await database.insert(parentCategories).values({
      id: parentId,
      name: `${label} parent`,
      normalizedName: `${label} parent ${parentId}`,
      aisleId: seedId.aisle('other'),
      defaultExpiryDays: 5,
      defaultLocation: 'fridge',
    });
    await database.insert(leafCategories).values({
      id: leafId,
      parentId,
      name: `${label} catch-all`,
      normalizedName: `${label} catch-all ${leafId}`,
      isOther: withOtherLeaf,
    });
    return { parentId, leafId };
  }

  it("files the top-level default by its fixed seed id and a Parent's Other Leaf by is_other", async () => {
    const { cookie } = await signUp();
    const top = (
      await add(cookie, { rawName: 'Top probe', location: 'cupboard' }).expect(
        201,
      )
    ).body as Batch;
    const [row] = await database
      .select()
      .from(batches)
      .where(eq(batches.id, top.id));
    expect(row.leafCategoryId).toBe(seedId.leaf('other-other'));
  });

  it("finds a Parent's Other Leaf structurally: renaming the Parent or Leaf changes nothing", async () => {
    const { cookie } = await signUp();
    const { parentId, leafId } = await createParent('Rename', true);
    await database
      .update(parentCategories)
      .set({ name: 'Other fridge', normalizedName: `other fridge ${parentId}` })
      .where(eq(parentCategories.id, parentId));
    await database
      .update(leafCategories)
      .set({ name: 'Zebra', normalizedName: `zebra ${leafId}` })
      .where(eq(leafCategories.id, leafId));

    const batch = (
      await add(cookie, {
        rawName: 'Rename probe',
        parentCategoryId: parentId,
      }).expect(201)
    ).body as Batch;
    const [row] = await database
      .select()
      .from(batches)
      .where(eq(batches.id, batch.id));
    expect(row.leafCategoryId).toBe(leafId);
    expect(batch.location).toBe('fridge');
    expect(batch.expiryDate).toBe(inDays(5));
  });

  it('returns a clear 422 when a Parent has no is_other Leaf, and 404 for an unknown Parent', async () => {
    const { cookie } = await signUp();
    const { parentId } = await createParent('Bare', false);
    const response = await add(cookie, {
      rawName: 'No other leaf',
      parentCategoryId: parentId,
    }).expect(422);
    expect(response.body).toMatchObject({ code: 'pantry.other_leaf_missing' });
    await add(cookie, {
      rawName: 'x',
      parentCategoryId: '00000000-0000-4000-8000-000000000000',
    }).expect(404);
  });

  it('allows only one is_other Leaf per Parent', async () => {
    const { parentId } = await createParent('Dup', true);
    await expect(
      database.insert(leafCategories).values({
        id: randomUUID(),
        parentId,
        name: 'Second other',
        normalizedName: `second other ${parentId}`,
        isOther: true,
      }),
    ).rejects.toThrow();
  });

  it('rejects an Unmatched Batch with no Location default and none given', async () => {
    const { cookie } = await signUp();
    const response = await add(cookie, { rawName: 'Zorblax' }).expect(400);
    expect(response.body).toMatchObject({ code: 'pantry.location_required' });
  });

  it('rejects invalid input', async () => {
    const { cookie } = await signUp();
    const parmesan = seedId.ingredient('parmesan');
    await add(cookie, {}).expect(400);
    await add(cookie, { ingredientId: parmesan, rawName: 'x' }).expect(400);
    await add(cookie, { ingredientId: parmesan, quantity: 2 }).expect(400);
    await add(cookie, {
      ingredientId: parmesan,
      quantity: 0,
      unit: 'g',
    }).expect(400);
    await add(cookie, { ingredientId: parmesan, expiryDate: 'soon' }).expect(
      400,
    );
    await add(cookie, {
      ingredientId: '00000000-0000-4000-8000-000000000000',
    }).expect(404);
  });

  it('rejects impossible dates and unstorable quantities with 400, not 500', async () => {
    const { cookie } = await signUp();
    const ingredientId = seedId.ingredient('parmesan');
    for (const expiryDate of ['2026-02-31', '2026-13-01', '2026-1-1']) {
      const response = await add(cookie, { ingredientId, expiryDate }).expect(
        400,
      );
      expect(response.body).toMatchObject({ code: 'validation_failed' });
    }
    await add(cookie, { ingredientId, today: '2026-02-31' }).expect(400);
    for (const quantity of [0.0001, 1.2345, 1_000_001, -1]) {
      const response = await add(cookie, {
        ingredientId,
        quantity,
        unit: 'g',
      }).expect(400);
      expect(response.body).toMatchObject({ code: 'validation_failed' });
    }
    const ok = (
      await add(cookie, { ingredientId, quantity: 0.001, unit: 'kg' }).expect(
        201,
      )
    ).body as Batch;
    expect(ok.quantity).toBe(0.001);
    const fine = (
      await add(cookie, { ingredientId, quantity: 1.235, unit: 'kg' }).expect(
        201,
      )
    ).body as Batch;
    expect(fine.quantity).toBe(1.235);
  });

  it("counts the default expiry from the Member's local `today` when given", async () => {
    const { cookie } = await signUp();
    // A Member just past midnight in Bucharest while UTC is still the previous day.
    const batch = (
      await add(cookie, {
        ingredientId: seedId.ingredient('parmesan'),
        today: '2031-03-01',
      }).expect(201)
    ).body as Batch;
    expect(batch.expiryDate).toBe('2031-04-30');
    // An explicit expiry wins over `today`.
    const explicit = (
      await add(cookie, {
        ingredientId: seedId.ingredient('parmesan'),
        today: '2031-03-01',
        expiryDate: '2031-04-02',
      }).expect(201)
    ).body as Batch;
    expect(explicit.expiryDate).toBe('2031-04-02');
  });

  it('enforces "unit null only when quantity null" in the database too', async () => {
    const { userId } = await signUp();
    const [{ familyId }] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, userId));
    await expect(
      database.insert(batches).values({
        familyId,
        ingredientId: seedId.ingredient('parmesan'),
        leafCategoryId: seedId.leaf('hard-cheese'),
        quantity: 2,
        location: 'fridge',
      }),
    ).rejects.toThrow();
  });

  it('sorts soonest expiry first with no-expiry Batches last, names localised', async () => {
    const { cookie } = await signUp();
    await add(cookie, {
      ingredientId: seedId.ingredient('milk'),
      expiryDate: '2031-05-01',
    }).expect(201);
    await add(cookie, { rawName: 'Mystery', location: 'spices' }).expect(201);
    await add(cookie, {
      ingredientId: seedId.ingredient('parmesan'),
      expiryDate: '2031-01-01',
    }).expect(201);

    expect((await list(cookie)).map((b) => b.name)).toEqual([
      'Parmesan',
      'Milk',
      'Mystery',
    ]);
    expect((await list(cookie, 'ro')).map((b) => b.name)).toEqual([
      'Parmezan',
      'Lapte',
      'Mystery',
    ]);
  });

  it('scopes the Pantry to the Family: members of one Family share it, other Families do not see it', async () => {
    const ana = await signUp();
    const mihai = await signUp();
    const outsider = await signUp();

    // Joining a Family is a later ticket: put Mihai in Ana's Family directly.
    const [{ familyId }] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, ana.userId));
    await database
      .update(user)
      .set({ familyId, familyRole: 'member' })
      .where(eq(user.id, mihai.userId));

    const added = (
      await add(ana.cookie, { ingredientId: seedId.ingredient('milk') }).expect(
        201,
      )
    ).body as Batch;

    expect((await list(mihai.cookie)).map((b) => b.id)).toEqual([added.id]);
    expect(await list(outsider.cookie)).toEqual([]);

    const fromMihai = (
      await add(mihai.cookie, {
        rawName: 'Shared jar',
        location: 'cupboard',
      }).expect(201)
    ).body as Batch;
    expect((await list(ana.cookie)).map((b) => b.id).sort()).toEqual(
      [added.id, fromMihai.id].sort(),
    );
  });

  describe('bulk create', () => {
    const addMany = (cookie: string, batches: object[]) =>
      request(app.getHttpServer())
        .post('/api/pantry/batches/bulk')
        .query({ locale: 'en' })
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send({ batches });

    it('saves matched and Unmatched lines together with the single-Batch rules', async () => {
      const { cookie } = await signUp();
      const response = await addMany(cookie, [
        {
          ingredientId: seedId.ingredient('parmesan'),
          quantity: 200,
          unit: 'g',
          productDescription: 'Grana Padano 200g',
        },
        { rawName: 'Mystery jar', location: 'cupboard', expiryDate: null },
      ]).expect(201);
      const saved = (response.body as { batches: Batch[] }).batches;
      expect(saved.map((b) => b.name).sort()).toEqual([
        'Mystery jar',
        'Parmesan',
      ]);
      expect(saved.find((b) => b.name === 'Parmesan')).toMatchObject({
        location: 'fridge',
        expiryDate: inDays(60),
      });
      expect(saved.find((b) => b.name === 'Mystery jar')).toMatchObject({
        unmatched: true,
        ingredientId: null,
      });
      expect(await list(cookie)).toHaveLength(2);
    });

    it('saves nothing when one line is bad', async () => {
      const { cookie } = await signUp();
      await addMany(cookie, [
        { ingredientId: seedId.ingredient('milk') },
        { ingredientId: randomUUID() },
      ]).expect(404);
      expect(await list(cookie)).toEqual([]);
    });

    it('rejects an empty list', async () => {
      const { cookie } = await signUp();
      await addMany(cookie, []).expect(400);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/pantry/batches/bulk')
        .send({ batches: [] })
        .expect(401);
    });
  });
});
