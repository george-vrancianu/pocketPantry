import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, ilike, inArray, sql } from 'drizzle-orm';
import pg from 'pg';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  catalogTranslations,
  ingredients,
  shoppingItems,
  shoppingLists,
  unmatchedEntries,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { waitForBlockedBackend } from './support/wait-for-blocked-backend';

type Entry = {
  normalizedName: string;
  rawName: string;
  count: number;
  locale: string;
  locales: string[];
  sources: string[];
  dismissed: boolean;
  references: Array<{
    type: 'batch' | 'shopping_item';
    id: string;
    source: string;
    locale: string;
    rawName: string;
  }>;
};

describe('Unmatched queue (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let pool: pg.Pool;
  let adminCookie: string;
  const stamp = Date.now();
  let counter = 0;
  // Earlier specs in this worker may leave Unmatched rows: every test uses
  // names unique to it and only looks at its own entries.
  const name = (label: string) => `Zzq ${label} ${stamp}`;

  async function signUp(email: string) {
    let response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.7.${Math.floor(++counter / 250)}.${counter % 250}`,
      )
      .send({ name: 'Tester', email, password: 'correct-horse-staple' });
    if (response.status === 422) {
      response = await request(app.getHttpServer())
        .post('/api/auth/sign-in/email')
        .set('origin', TEST_ORIGIN)
        .send({ email, password: 'correct-horse-staple' });
    }
    expect(response.status).toBe(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((value) => value.split(';')[0])
      .join('; ');
  }
  const newMember = () => signUp(`unmatched-${stamp}-${++counter}@example.com`);

  const call = (cookie: string) => ({
    get: (path: string) =>
      request(app.getHttpServer())
        .get(`/api${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie),
    post: (path: string, body: object = {}) =>
      request(app.getHttpServer())
        .post(`/api${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send(body),
    del: (path: string) =>
      request(app.getHttpServer())
        .delete(`/api${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie),
  });

  async function saveBatches(
    cookie: string,
    lines: Array<{ rawName: string; source?: string }>,
    locale = 'en',
  ) {
    const response = await call(cookie)
      .post(`/pantry/batches/bulk?locale=${locale}`, {
        batches: lines.map((line) => ({
          ...line,
          quantity: 1,
          unit: 'pcs',
          location: 'cupboard',
        })),
      })
      .expect(201);
    return (response.body as { batches: Array<{ id: string }> }).batches;
  }

  async function addItem(cookie: string, itemName: string, locale = 'en') {
    await call(cookie)
      .post(`/shopping-list/items?locale=${locale}`, { name: itemName })
      .expect(200);
  }

  async function queue(status?: 'open' | 'dismissed') {
    const response = await call(adminCookie)
      .get(`/admin/unmatched${status ? `?status=${status}` : ''}`)
      .expect(200);
    return (response.body as { entries: Entry[] }).entries;
  }
  const entryFor = async (raw: string, status?: 'open' | 'dismissed') =>
    (await queue(status)).find(
      (entry) => entry.normalizedName === normalise(raw),
    );
  const normalise = (raw: string) => raw.toLowerCase().replace(/\s+/g, ' ');

  const resolve = (body: object) =>
    call(adminCookie).post('/admin/unmatched/resolve', body);

  beforeAll(async () => {
    app = await createTestApp();
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    database = app.get<Database>(DATABASE);
    adminCookie = await signUp('chef.admin@example.com');
  });

  afterAll(async () => {
    await pool.end();
    const like = `%${stamp}%`;
    await database.delete(batches).where(ilike(batches.rawName, like));
    // Resolved rows lost their raw name: find them through their Ingredient.
    const created = await database
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(ilike(ingredients.name, like));
    if (created.length > 0) {
      const ids = created.map((row) => row.id);
      await database.delete(batches).where(inArray(batches.ingredientId, ids));
      await database
        .delete(shoppingItems)
        .where(inArray(shoppingItems.ingredientId, ids));
    }
    await database.delete(shoppingItems).where(ilike(shoppingItems.name, like));
    await database
      .delete(unmatchedEntries)
      .where(ilike(unmatchedEntries.rawName, like));
    await database
      .delete(catalogTranslations)
      .where(ilike(catalogTranslations.value, like));
    await database.delete(ingredients).where(ilike(ingredients.name, like));
    await app.close();
  });

  describe('authorisation', () => {
    it('is Admin only', async () => {
      const member = await newMember();
      await call(member).get('/admin/unmatched').expect(403);
      await call(member)
        .post('/admin/unmatched/resolve', { normalizedName: 'x' })
        .expect(403);
      await call(member)
        .post('/admin/unmatched/dismiss', { normalizedName: 'x' })
        .expect(403);
      await request(app.getHttpServer())
        .get('/api/admin/unmatched')
        .set('origin', TEST_ORIGIN)
        .expect(401);
    });
  });

  describe('grouping', () => {
    it('groups identical normalised names across Families, sources and rows', async () => {
      const raw = name('grouped');
      const alice = await newMember();
      const bob = await newMember();
      await saveBatches(alice, [{ rawName: raw, source: 'product' }], 'ro');
      await saveBatches(bob, [
        { rawName: `  ${raw.toUpperCase()}!! `, source: 'receipt' },
      ]);
      await addItem(bob, raw.replace(' ', '  '));

      const entry = await entryFor(raw);
      expect(entry).toBeDefined();
      expect(entry?.count).toBe(3);
      expect(entry?.sources.sort()).toEqual(['manual', 'product', 'receipt']);
      expect(entry?.locales.sort()).toEqual(['en', 'ro']);
      expect(entry?.dismissed).toBe(false);
      const types = entry?.references.map((ref) => ref.type).sort();
      expect(types).toEqual(['batch', 'batch', 'shopping_item']);
      const productRef = entry?.references.find((r) => r.source === 'product');
      expect(productRef).toMatchObject({ locale: 'ro', rawName: raw });
    });

    it('records the source and locale of a Batch saved without a source as manual', async () => {
      const raw = name('manual');
      const [batch] = await saveBatches(await newMember(), [{ rawName: raw }]);
      const entry = await entryFor(raw);
      expect(entry?.references).toEqual([
        expect.objectContaining({
          type: 'batch',
          id: batch.id,
          source: 'manual',
          locale: 'en',
        }),
      ]);
    });

    it('records plate Shopping Items and Finish Shopping Batches', async () => {
      const raw = name('finish');
      const member = await newMember();
      await call(member)
        .post('/shopping-list/items?locale=ro', { name: raw, source: 'plate' })
        .expect(200);
      let entry = await entryFor(raw);
      expect(entry?.references[0]).toMatchObject({
        type: 'shopping_item',
        source: 'plate',
        locale: 'ro',
      });

      const list = (await call(member).get('/shopping-list').expect(200))
        .body as { groups: Array<{ items: Array<{ id: string }> }> };
      const itemId = list.groups[0].items[0].id;
      await request(app.getHttpServer())
        .patch(`/api/shopping-list/items/${itemId}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', member)
        .send({ checked: true })
        .expect(200);
      const proposal = (
        await call(member).get('/shopping-list/finish').expect(200)
      ).body as {
        listId: string;
        lines: Array<{
          itemId: string;
          quantity: number | null;
          unit: string | null;
          location: string;
          expiryDate: string | null;
        }>;
      };
      await call(member)
        .post('/shopping-list/finish', {
          listId: proposal.listId,
          lines: proposal.lines,
        })
        .expect(200);

      entry = await entryFor(raw);
      expect(entry?.count).toBe(2);
      expect(entry?.references.map((ref) => ref.source).sort()).toEqual([
        'finish_shopping',
        'plate',
      ]);
      // The Batch inherits the locale the name was first saved in.
      expect(
        entry?.references.find((ref) => ref.type === 'batch')?.locale,
      ).toBe('ro');
    });

    it('drops an entry when its Batch is deleted', async () => {
      const raw = name('deleted');
      const member = await newMember();
      const [batch] = await saveBatches(member, [{ rawName: raw }]);
      expect(await entryFor(raw)).toBeDefined();
      await call(member).del(`/pantry/batches/${batch.id}`).expect(204);
      expect(await entryFor(raw)).toBeUndefined();
    });
  });

  describe('resolve to an existing Ingredient', () => {
    it('relinks every Batch and Shopping Item, adds the Synonym in its locale and clears the queue', async () => {
      const raw = name('brânză');
      const alice = await newMember();
      const bob = await newMember();
      const aliceBatches = await saveBatches(
        alice,
        [{ rawName: raw, source: 'product' }],
        'ro',
      );
      const bobBatches = await saveBatches(bob, [{ rawName: raw }], 'ro');
      await addItem(bob, raw, 'ro');
      const parmesan = seedId.ingredient('parmesan');

      const response = await resolve({
        normalizedName: normalise(raw).normalize('NFD').replace(/\p{M}/gu, ''),
        ingredientId: parmesan,
      }).expect(201);
      expect(response.body).toMatchObject({
        ingredientId: parmesan,
        relinkedBatches: 2,
        relinkedShoppingItems: 1,
        synonymAdded: true,
        locale: 'ro',
      });

      const rows = await database
        .select()
        .from(batches)
        .where(
          inArray(
            batches.id,
            [...aliceBatches, ...bobBatches].map((b) => b.id),
          ),
        );
      expect(rows).toHaveLength(2);
      for (const row of rows) {
        expect(row).toMatchObject({
          ingredientId: parmesan,
          unmatched: false,
          rawName: null,
        });
      }
      // The Batches sit under the Ingredient's Leaf Category, not "Other".
      const [ingredient] = await database
        .select({ leaf: ingredients.leafCategoryId })
        .from(ingredients)
        .where(eq(ingredients.id, parmesan));
      expect(rows.every((r) => r.leafCategoryId === ingredient.leaf)).toBe(
        true,
      );

      const list = (await call(bob).get('/shopping-list?locale=ro').expect(200))
        .body as { groups: Array<{ items: Array<{ unmatched: boolean }> }> };
      expect(
        list.groups.flatMap((group) => group.items).every((i) => !i.unmatched),
      ).toBe(true);

      const synonyms = await database
        .select()
        .from(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.entityId, parmesan),
            eq(catalogTranslations.kind, 'synonym'),
            eq(catalogTranslations.value, raw),
          ),
        );
      expect(synonyms).toEqual([expect.objectContaining({ locale: 'ro' })]);

      expect(await entryFor(raw)).toBeUndefined();
      expect(await entryFor(raw, 'dismissed')).toBeUndefined();

      // The same text now matches deterministically (stage one) for the next entry.
      const search = (
        await call(alice)
          .get(`/catalog/search?q=${encodeURIComponent(raw)}&locale=ro`)
          .expect(200)
      ).body as { results: Array<{ id: string }> };
      expect(search.results[0]?.id).toBe(parmesan);

      await database
        .delete(catalogTranslations)
        .where(eq(catalogTranslations.id, synonyms[0].id));
    });

    it('lets the Admin choose the Synonym locale', async () => {
      const raw = name('locale choice');
      await saveBatches(await newMember(), [{ rawName: raw }], 'en');
      const response = await resolve({
        normalizedName: normalise(raw),
        ingredientId: seedId.ingredient('parmesan'),
        locale: 'ro',
      }).expect(201);
      expect(response.body).toMatchObject({ locale: 'ro' });
    });

    it('rejects a name that already matches a different Ingredient', async () => {
      const raw = name('ambiguous');
      await saveBatches(await newMember(), [{ rawName: raw }]);
      const parmesan = seedId.ingredient('parmesan');
      // Make the raw text a Synonym of another Ingredient first.
      await database.insert(catalogTranslations).values({
        id: crypto.randomUUID(),
        entityType: 'ingredient',
        entityId: parmesan,
        locale: 'en',
        kind: 'synonym',
        value: raw,
        normalizedValue: normalise(raw),
      });
      const other = seedId.ingredient('butter');
      const response = await resolve({
        normalizedName: normalise(raw),
        ingredientId: other,
      }).expect(409);
      expect(response.body).toMatchObject({ code: 'unmatched.name_taken' });
      expect(await entryFor(raw)).toBeDefined();
      // Resolving to the Ingredient that already owns the Synonym is fine and adds nothing.
      const ok = await resolve({
        normalizedName: normalise(raw),
        ingredientId: parmesan,
      }).expect(201);
      expect(ok.body).toMatchObject({ synonymAdded: false });
    });

    it('answers 404 for an unknown name or Ingredient', async () => {
      await resolve({
        normalizedName: name('nothing here'),
        ingredientId: seedId.ingredient('parmesan'),
      }).expect(404);
      const raw = name('bad ingredient');
      await saveBatches(await newMember(), [{ rawName: raw }]);
      const response = await resolve({
        normalizedName: normalise(raw),
        ingredientId: crypto.randomUUID(),
      }).expect(404);
      expect(response.body).toMatchObject({ code: 'catalog.not_found' });
      expect(await entryFor(raw)).toBeDefined();
    });
  });

  describe('resolve to a new Ingredient', () => {
    it('creates the Ingredient, relinks the rows and adds the Synonym in one go', async () => {
      const raw = name('fresh');
      const member = await newMember();
      const [batch] = await saveBatches(member, [{ rawName: raw }]);
      await addItem(member, raw);
      const created = `New ${raw} Item`;

      const response = await resolve({
        normalizedName: normalise(raw),
        newIngredient: {
          name: created,
          leafCategoryId: seedId.leaf('hard-cheese'),
          defaultUnit: 'g',
        },
      }).expect(201);
      const body = response.body as { ingredientId: string };
      expect(response.body).toMatchObject({
        relinkedBatches: 1,
        relinkedShoppingItems: 1,
        synonymAdded: true,
        locale: 'en',
      });

      const [ingredient] = await database
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, body.ingredientId));
      expect(ingredient).toMatchObject({
        name: created,
        leafCategoryId: seedId.leaf('hard-cheese'),
        defaultUnit: 'g',
      });
      const [row] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, batch.id));
      expect(row).toMatchObject({
        ingredientId: body.ingredientId,
        unmatched: false,
        leafCategoryId: seedId.leaf('hard-cheese'),
      });
      const translations = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.entityId, body.ingredientId));
      expect(
        translations.map((t) => [t.kind, t.locale, t.value]).sort(),
      ).toEqual(
        [
          ['name', 'en', created],
          ['synonym', 'en', raw],
        ].sort(),
      );
      expect(await entryFor(raw)).toBeUndefined();
    });

    it('rolls everything back when the new Ingredient name is taken', async () => {
      const raw = name('rollback');
      const member = await newMember();
      const [batch] = await saveBatches(member, [{ rawName: raw }]);
      await resolve({
        normalizedName: normalise(raw),
        newIngredient: {
          name: 'Parmesan',
          leafCategoryId: seedId.leaf('hard-cheese'),
          defaultUnit: 'g',
        },
      }).expect(409);
      const [row] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, batch.id));
      expect(row.unmatched).toBe(true);
      expect(await entryFor(raw)).toBeDefined();
    });

    it('answers 404, not 500, when the Ingredient is deleted while the resolve waits', async () => {
      const raw = name('vanishing');
      await saveBatches(await newMember(), [{ rawName: raw }]);
      const created = (
        await call(adminCookie).post('/admin/catalog/ingredients', {
          name: `Gone ${raw}`,
          leafCategoryId: seedId.leaf('hard-cheese'),
          defaultUnit: 'g',
        })
      ).body as { id: string };
      expect(created.id).toBeDefined();

      let response: Promise<request.Response> | undefined;
      await database.transaction(async (tx) => {
        const { rows } = await tx.execute<{ pid: number }>(
          sql`SELECT pg_backend_pid() AS pid`,
        );
        await tx.execute(sql`DELETE FROM ingredients WHERE id = ${created.id}`);
        response = Promise.resolve(
          resolve({
            normalizedName: normalise(raw),
            ingredientId: created.id,
          }).then((r) => r),
        );
        await waitForBlockedBackend(pool, rows[0].pid);
      });
      expect((await response)?.status).toBe(404);
      expect(await entryFor(raw)).toBeDefined();
    });

    it('requires exactly one of ingredientId and newIngredient', async () => {
      await resolve({ normalizedName: 'x' }).expect(400);
      await resolve({
        normalizedName: 'x',
        ingredientId: seedId.ingredient('parmesan'),
        newIngredient: {
          name: 'x',
          leafCategoryId: seedId.leaf('hard-cheese'),
          defaultUnit: 'g',
        },
      }).expect(400);
    });
  });

  describe('relinking Shopping Items', () => {
    const addTyped = (cookie: string, body: object) =>
      call(cookie).post('/shopping-list/items', body).expect(200);
    const itemsOf = (cookie: string) =>
      call(cookie)
        .get('/shopping-list')
        .expect(200)
        .then((r) =>
          (
            r.body as {
              groups: Array<{
                items: Array<{
                  id: string;
                  quantity: number | null;
                  unit: string | null;
                  unmatched: boolean;
                  ingredientId?: string;
                }>;
              }>;
            }
          ).groups.flatMap((g) => g.items),
        );

    it('merges into the Ingredient line already on the active list when the unit matches', async () => {
      const raw = name('merge');
      const member = await newMember();
      const parmesan = seedId.ingredient('parmesan');
      await addTyped(member, {
        ingredientId: parmesan,
        quantity: 2,
        unit: 'g',
      });
      await addTyped(member, { name: raw, quantity: 3, unit: 'g' });
      await addTyped(member, { name: raw, quantity: 1, unit: 'kg' });

      const response = await resolve({
        normalizedName: normalise(raw),
        ingredientId: parmesan,
      }).expect(201);
      expect(response.body).toMatchObject({ relinkedShoppingItems: 2 });

      const items = await itemsOf(member);
      expect(items).toHaveLength(2);
      expect(items.find((i) => i.unit === 'g')?.quantity).toBe(5);
      expect(items.find((i) => i.unit === 'kg')?.quantity).toBe(1);
      expect(items.every((i) => !i.unmatched)).toBe(true);
      expect(await entryFor(raw)).toBeUndefined();
    });

    it('only relinks on an archived list', async () => {
      const raw = name('archived');
      const member = await newMember();
      const parmesan = seedId.ingredient('parmesan');
      await addTyped(member, { name: raw, quantity: 3, unit: 'g' });
      const [item] = await database
        .select({ id: shoppingItems.id, listId: shoppingItems.listId })
        .from(shoppingItems)
        .where(eq(shoppingItems.name, raw));
      const [list] = await database
        .select()
        .from(shoppingLists)
        .where(eq(shoppingLists.id, item.listId));
      await database
        .update(shoppingLists)
        .set({ status: 'archived' })
        .where(eq(shoppingLists.id, list.id));
      const [older] = await database
        .insert(shoppingItems)
        .values({
          listId: list.id,
          ingredientId: parmesan,
          quantity: '2',
          unit: 'g',
        })
        .returning({ id: shoppingItems.id });

      await resolve({
        normalizedName: normalise(raw),
        ingredientId: parmesan,
      }).expect(201);

      const rows = await database
        .select()
        .from(shoppingItems)
        .where(eq(shoppingItems.listId, list.id));
      expect(rows).toHaveLength(2);
      expect(rows.find((r) => r.id === item.id)).toMatchObject({
        ingredientId: parmesan,
        quantity: '3.000',
      });
      expect(rows.find((r) => r.id === older.id)?.quantity).toBe('2.000');
    });
  });

  describe('dismiss', () => {
    it('hides the entry from the open queue and leaves the rows Unmatched', async () => {
      const raw = name('dismissed');
      const member = await newMember();
      const [batch] = await saveBatches(member, [{ rawName: raw }]);
      await call(adminCookie)
        .post('/admin/unmatched/dismiss', { normalizedName: normalise(raw) })
        .expect(204);

      expect(await entryFor(raw)).toBeUndefined();
      const dismissed = await entryFor(raw, 'dismissed');
      expect(dismissed).toMatchObject({ count: 1, dismissed: true });
      const [row] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, batch.id));
      expect(row).toMatchObject({ unmatched: true, ingredientId: null });

      // A new occurrence puts the name back in the open queue.
      await saveBatches(member, [{ rawName: raw }]);
      const reopened = await entryFor(raw);
      expect(reopened?.count).toBe(2);
      expect(reopened?.dismissed).toBe(false);
    });

    it('answers 404 for a name that is not in the queue', async () => {
      await call(adminCookie)
        .post('/admin/unmatched/dismiss', {
          normalizedName: name('never saved'),
        })
        .expect(404);
    });
  });

  describe('concurrency', () => {
    it('lets exactly one of two Admins resolve the same name', async () => {
      const raw = name('race');
      await saveBatches(await newMember(), [{ rawName: raw }]);
      await saveBatches(await newMember(), [{ rawName: raw }]);
      const second = await signUp('second-admin@example.com');
      const body = {
        normalizedName: normalise(raw),
        ingredientId: seedId.ingredient('parmesan'),
      };
      const results = await Promise.all([
        call(adminCookie).post('/admin/unmatched/resolve', body),
        call(second).post('/admin/unmatched/resolve', body),
      ]);
      expect(results.map((r) => r.status).sort()).toEqual([201, 404]);
      const synonyms = await database
        .select({ id: catalogTranslations.id })
        .from(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.kind, 'synonym'),
            eq(catalogTranslations.value, raw),
          ),
        );
      expect(synonyms).toHaveLength(1);
    });

    it('relinks or keeps queued a Batch saved while the resolve waits for the Shopping List lock', async () => {
      const raw = name('late batch');
      const member = await newMember();
      const parmesan = seedId.ingredient('parmesan');
      await addItem(member, raw);
      const [item] = await database
        .select({ listId: shoppingItems.listId })
        .from(shoppingItems)
        .where(eq(shoppingItems.name, raw));
      const [list] = await database
        .select({ familyId: shoppingLists.familyId })
        .from(shoppingLists)
        .where(eq(shoppingLists.id, item.listId));
      const [other] = await database
        .select({ id: ingredients.leafCategoryId })
        .from(ingredients)
        .where(eq(ingredients.id, parmesan));

      let resolveResponse: Promise<request.Response> | undefined;
      let lateBatchId = '';
      await database.transaction(async (tx) => {
        const { rows } = await tx.execute<{ pid: number }>(
          sql`SELECT pg_backend_pid() AS pid`,
        );
        await tx.execute(
          sql`SELECT id FROM shopping_lists WHERE id = ${item.listId} FOR UPDATE`,
        );
        // Resolve reads its entries, then waits for this list.
        resolveResponse = Promise.resolve(
          resolve({
            normalizedName: normalise(raw),
            ingredientId: parmesan,
          }).then((r) => r),
        );
        await waitForBlockedBackend(pool, rows[0].pid);
        const [batch] = await tx
          .insert(batches)
          .values({
            familyId: list.familyId,
            leafCategoryId: other.id,
            unmatched: true,
            rawName: raw,
            quantity: 1,
            unit: 'pcs',
            location: 'cupboard',
          })
          .returning({ id: batches.id });
        lateBatchId = batch.id;
        await tx.insert(unmatchedEntries).values({
          normalizedName: normalise(raw),
          rawName: raw,
          locale: 'en',
          source: 'manual',
          batchId: batch.id,
        });
      });
      expect((await resolveResponse)?.status).toBe(201);

      const [late] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, lateBatchId));
      const entries = await database
        .select()
        .from(unmatchedEntries)
        .where(eq(unmatchedEntries.batchId, lateBatchId));
      // With the entries read under the locks, the late Batch is relinked.
      expect(late).toMatchObject({ unmatched: false, ingredientId: parmesan });
      expect(entries).toEqual([]);
    });

    it('does not deadlock with Finish Shopping and adds on the same rows', async () => {
      const members = await Promise.all([newMember(), newMember()]);
      const raws = [name('mix a'), name('mix b')];
      for (const cookie of members) {
        for (const raw of raws) {
          await saveBatches(cookie, [{ rawName: raw }]);
          await addItem(cookie, raw);
        }
      }
      const finishes = members.map(async (cookie) => {
        const list = (await call(cookie).get('/shopping-list').expect(200))
          .body as { groups: Array<{ items: Array<{ id: string }> }> };
        for (const item of list.groups.flatMap((g) => g.items)) {
          await request(app.getHttpServer())
            .patch(`/api/shopping-list/items/${item.id}`)
            .set('origin', TEST_ORIGIN)
            .set('cookie', cookie)
            .send({ checked: true });
        }
        const proposal = (
          await call(cookie).get('/shopping-list/finish').expect(200)
        ).body as { listId: string; lines: object[] };
        return call(cookie).post('/shopping-list/finish', {
          listId: proposal.listId,
          lines: proposal.lines,
        });
      });
      const resolves = raws.map((raw) =>
        resolve({
          normalizedName: normalise(raw),
          ingredientId: seedId.ingredient('parmesan'),
        }),
      );
      const results = await Promise.all([...finishes, ...resolves]);
      for (const result of results) {
        // Finish may lose its Review to a concurrent relink (409), never a 500.
        expect([200, 201, 409]).toContain(result.status);
      }
      for (const raw of raws) {
        expect(await entryFor(raw)).toBeUndefined();
        const stillUnmatched = await database
          .select({ id: batches.id })
          .from(batches)
          .where(and(eq(batches.rawName, raw), eq(batches.unmatched, true)));
        expect(stillUnmatched).toEqual([]);
      }
    });
  });
});
