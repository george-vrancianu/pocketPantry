import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, inArray, sql, isNull } from 'drizzle-orm';
import pg from 'pg';
import request from 'supertest';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  catalogTranslations,
  ingredients,
} from '../src/database/schema';
import { PantryService } from '../src/pantry/pantry.service';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';
import { waitForBlockedBackend } from './support/wait-for-blocked-backend';

type Suggestion = {
  ingredientId: string;
  name: string;
  quantity: number | null;
};
type Suggestions = { staples: Suggestion[]; usedUp: Suggestion[] };

const MINUTE = 60_000;
const DAY = 86_400_000;

describe('Used Up Suggestions (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let pool: pg.Pool;
  let counter = 0;
  const resolvedNames: string[] = [];

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  });

  afterAll(async () => {
    // Resolving an Unmatched name adds a Synonym to a seeded Ingredient; remove it so the worker's shared database stays as seeded.
    if (resolvedNames.length > 0) {
      await database
        .delete(catalogTranslations)
        .where(inArray(catalogTranslations.value, resolvedNames));
    }
    await pool.end();
    await app.close();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  async function signUp(
    email = `usedup-${Date.now()}-${++counter}@example.com`,
  ) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.3.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({
        name: 'Used Up',
        email,
        password: 'correct-horse-battery-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  const api = (
    method: 'get' | 'post' | 'patch' | 'delete',
    cookie: string,
    path: string,
  ) =>
    request(app.getHttpServer())
      [method](`/api${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  /** The controllable clock: runs `action` as if it were `offsetMs` from now. */
  async function after<T>(offsetMs: number, action: () => Promise<T>) {
    const real = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(real + offsetMs);
    try {
      return await action();
    } finally {
      clock.mockRestore();
    }
  }

  const addBatch = async (cookie: string, ingredientId: string) =>
    (
      await api('post', cookie, '/pantry/batches?locale=en')
        .send({ ingredientId, quantity: 1, unit: 'pcs', location: 'fridge' })
        .expect(201)
    ).body as { id: string };
  const removeBatch = (cookie: string, id: string) =>
    api('delete', cookie, `/pantry/batches/${id}`).expect(204);
  const suggestions = async (cookie: string) =>
    (
      await api('get', cookie, '/shopping-list/suggestions?locale=en').expect(
        200,
      )
    ).body as Suggestions;
  const usedUpIds = async (cookie: string) =>
    (await suggestions(cookie)).usedUp.map((s) => s.ingredientId);

  const milk = seedId.ingredient('milk');
  const parmesan = seedId.ingredient('parmesan');

  it('suggests an Ingredient whose last Batch was removed, with no quantity', async () => {
    const cookie = await signUp();
    const batch = await addBatch(cookie, milk);

    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    const { usedUp } = await suggestions(cookie);
    expect(usedUp).toEqual([
      expect.objectContaining({
        ingredientId: milk,
        name: 'Milk',
        quantity: null,
      }),
    ]);
  });

  it('ignores a Batch removed less than 10 minutes after it was created', async () => {
    const cookie = await signUp();
    const mistaken = await addBatch(cookie, milk);
    const kept = await addBatch(cookie, parmesan);

    await after(9 * MINUTE, () => removeBatch(cookie, mistaken.id));
    await after(10 * MINUTE + 1000, () => removeBatch(cookie, kept.id));

    expect(await usedUpIds(cookie)).toEqual([parmesan]);
  });

  it('waits until the last Batch of the Ingredient is gone', async () => {
    const cookie = await signUp();
    const first = await addBatch(cookie, milk);
    const second = await addBatch(cookie, milk);

    await after(11 * MINUTE, () => removeBatch(cookie, first.id));
    expect(await usedUpIds(cookie)).toEqual([]);

    await after(12 * MINUTE, () => removeBatch(cookie, second.id));
    expect(await usedUpIds(cookie)).toEqual([milk]);
  });

  it('drops off 30 days after the Batch was removed', async () => {
    const cookie = await signUp();
    const batch = await addBatch(cookie, milk);
    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    expect(
      await after(11 * MINUTE + 29 * DAY, () => usedUpIds(cookie)),
    ).toEqual([milk]);
    expect(
      await after(11 * MINUTE + 31 * DAY, () => usedUpIds(cookie)),
    ).toEqual([]);
  });

  it('drops off when a new Batch of the Ingredient is created, and returns when that runs out', async () => {
    const cookie = await signUp();
    const batch = await addBatch(cookie, milk);
    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    const restocked = await after(12 * MINUTE, () => addBatch(cookie, milk));
    expect(await usedUpIds(cookie)).toEqual([]);

    await after(30 * MINUTE, () => removeBatch(cookie, restocked.id));
    expect(await usedUpIds(cookie)).toEqual([milk]);
  });

  it('is hidden while on the Shopping List, checked or not', async () => {
    const cookie = await signUp();
    const batch = await addBatch(cookie, milk);
    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    const list = (
      await api('post', cookie, '/shopping-list/items?locale=en')
        .send({ ingredientId: milk })
        .expect(200)
    ).body as { groups: Array<{ items: Array<{ id: string }> }> };
    expect(await usedUpIds(cookie)).toEqual([]);

    const itemId = list.groups[0].items[0].id;
    await api(
      'delete',
      cookie,
      `/shopping-list/items/${itemId}?locale=en`,
    ).expect(200);
    expect(await usedUpIds(cookie)).toEqual([milk]);
  });

  it('is never shown for a Staple, which is missing instead', async () => {
    const cookie = await signUp();
    await api('post', cookie, '/staples?locale=en')
      .send({ ingredientId: milk })
      .expect(201);
    const batch = await addBatch(cookie, milk);

    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    const found = await suggestions(cookie);
    expect(found.usedUp).toEqual([]);
    expect(found.staples.map((s) => s.ingredientId)).toEqual([milk]);
  });

  it('is dismissed for the Family, until it is stocked and runs out again', async () => {
    const cookie = await signUp();
    const batch = await addBatch(cookie, milk);
    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    await api(
      'post',
      cookie,
      `/shopping-list/suggestions/${milk}/dismiss`,
    ).expect(204);
    expect(await usedUpIds(cookie)).toEqual([]);

    const again = await after(20 * MINUTE, () => addBatch(cookie, milk));
    await after(40 * MINUTE, () => removeBatch(cookie, again.id));
    expect(await usedUpIds(cookie)).toEqual([milk]);
  });

  it("keeps one Family's Used Up Ingredients out of another's", async () => {
    const mine = await signUp();
    const theirs = await signUp();
    const batch = await addBatch(mine, milk);
    await after(11 * MINUTE, () => removeBatch(mine, batch.id));

    expect(await usedUpIds(theirs)).toEqual([]);
  });

  it('starts from a Batch added by Finish Shopping', async () => {
    const cookie = await signUp();
    const list = (
      await api('post', cookie, '/shopping-list/items?locale=en')
        .send({ ingredientId: milk, quantity: 1, unit: 'l' })
        .expect(200)
    ).body as { groups: Array<{ items: Array<{ id: string }> }> };
    await api(
      'patch',
      cookie,
      `/shopping-list/items/${list.groups[0].items[0].id}?locale=en`,
    )
      .send({ checked: true })
      .expect(200);
    const proposal = (
      await api('get', cookie, '/shopping-list/finish?locale=en').expect(200)
    ).body as {
      listId: string;
      lines: Array<Record<string, unknown> & { itemId: string }>;
    };
    await api('post', cookie, '/shopping-list/finish?locale=en')
      .send({
        lines: proposal.lines.map((l) => ({
          itemId: l.itemId,
          quantity: l.quantity,
          unit: l.unit,
          location: l.location,
          expiryDate: l.expiryDate,
        })),
        droppedItemIds: [],
        listId: proposal.listId,
      })
      .expect(200);
    const pantry = (await api('get', cookie, '/pantry?locale=en').expect(200))
      .body as { batches: Array<{ id: string }> };
    const [bought] = pantry.batches;

    await after(11 * MINUTE, () => removeBatch(cookie, bought.id));

    expect(await usedUpIds(cookie)).toEqual([milk]);
  });

  it('starts from an Unmatched Batch an Admin resolves to an Ingredient', async () => {
    const adminEmail = `usedup-admin-${Date.now()}-${++counter}@example.com`;
    const admin = await signUp(adminEmail);
    await promoteToAdmin(database, adminEmail);
    const cookie = await signUp();
    const raw = `Zzq sheep milk ${Date.now()}`;
    resolvedNames.push(raw);
    const saved = (
      await api('post', cookie, '/pantry/batches/bulk?locale=en')
        .send({
          batches: [
            { rawName: raw, quantity: 1, unit: 'l', location: 'fridge' },
          ],
        })
        .expect(201)
    ).body as { batches: Array<{ id: string }> };
    const [batch] = saved.batches;
    await api('post', admin, '/admin/unmatched/resolve')
      .send({
        normalizedName: raw.toLowerCase(),
        ingredientId: parmesan,
      })
      .expect(201);

    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));

    expect(await usedUpIds(cookie)).toEqual([parmesan]);
  });

  it('dismissing a Staple also ends its stock cycle, so removing the Staple suggests nothing', async () => {
    const cookie = await signUp();
    const staple = (
      await api('post', cookie, '/staples?locale=en')
        .send({ ingredientId: milk })
        .expect(201)
    ).body as { id: string };
    const batch = await addBatch(cookie, milk);
    await after(11 * MINUTE, () => removeBatch(cookie, batch.id));
    await api(
      'post',
      cookie,
      `/shopping-list/suggestions/${milk}/dismiss`,
    ).expect(204);
    expect((await suggestions(cookie)).staples).toEqual([]);

    await api('delete', cookie, `/staples/${staple.id}`).expect(204);

    // The dismissal ended the stock cycle: nothing is suggested.
    expect((await suggestions(cookie)).usedUp).toEqual([]);
  });

  it('counts the 10 minutes from the Batch the app created, on the same clock', async () => {
    const cookie = await signUp();
    const batch = await after(12 * MINUTE, () => addBatch(cookie, milk));

    await after(17 * MINUTE, () => removeBatch(cookie, batch.id));

    expect(await usedUpIds(cookie)).toEqual([]);
  });

  it('marks an Ingredient Used Up when its last two Batches are deleted concurrently', async () => {
    const cookie = await signUp();
    const first = await addBatch(cookie, milk);
    const second = await addBatch(cookie, milk);
    const [{ familyId }] = await database
      .select({ familyId: batches.familyId })
      .from(batches)
      .where(eq(batches.id, first.id));
    const pantry = app.get(PantryService);

    const real = Date.now();
    const clock = jest.spyOn(Date, 'now').mockReturnValue(real + 11 * MINUTE);
    try {
      let secondDelete: Promise<unknown> | undefined;
      let settled = false;
      await database.transaction(async (tx) => {
        const { rows } = await tx.execute<{ pid: number }>(
          sql`SELECT pg_backend_pid() AS pid`,
        );
        // The first delete is uncommitted, so the second cannot see it gone.
        await pantry.deleteBatches(tx, familyId, [first.id]);
        secondDelete = removeBatch(cookie, second.id).then(() => {
          settled = true;
        });
        // With the history lock the second delete waits on this transaction;
        // without it, it finishes at once and the race is lost.
        await Promise.race([
          waitForBlockedBackend(pool, rows[0].pid),
          (async () => {
            while (!settled) await new Promise((r) => setTimeout(r, 20));
          })(),
        ]);
      });
      await secondDelete;
    } finally {
      clock.mockRestore();
    }

    expect(await usedUpIds(cookie)).toEqual([milk]);
  });

  it('lets an Admin delete an Ingredient that only has a stock history row', async () => {
    const adminEmail = `usedup-admin-${Date.now()}-${++counter}@example.com`;
    const admin = await signUp(adminEmail);
    await promoteToAdmin(database, adminEmail);
    const [leaf] = await database
      .select({ id: ingredients.leafCategoryId })
      .from(ingredients)
      .where(isNull(ingredients.ownerFamilyId))
      .limit(1);
    const made = (
      await api('post', admin, '/admin/catalog/ingredients')
        .send({
          leafCategoryId: leaf.id,
          name: `Stock history ${Date.now()}`,
          defaultUnit: 'pcs',
        })
        .expect(201)
    ).body as { id: string };
    const batch = await addBatch(admin, made.id);
    await after(11 * MINUTE, () => removeBatch(admin, batch.id));

    await api('delete', admin, `/admin/catalog/ingredients/${made.id}`).expect(
      204,
    );
  });
});
