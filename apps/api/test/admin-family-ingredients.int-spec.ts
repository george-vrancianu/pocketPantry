import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, inArray } from 'drizzle-orm';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { normalizeName } from '../src/catalog/normalize';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  ingredients,
  ingredientStockHistory,
  recipeIngredientLines,
  runningLow,
  shoppingItems,
  shoppingTemplateLines,
  staples,
  suggestionDismissals,
  user,
} from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

// Contract: see /home/giu/projects/notes-263/contract-275.md. Every Family here is
// throwaway and every name carries the run stamp, so assertions filter to our own
// names and ids; the shared tables also hold rows from other suites.
type Who = ReturnType<typeof client>;
type Copy = {
  id: string;
  name: string;
  locale: string;
  defaultUnit: string;
  leafCategory: { id: string; name: string };
};
type Group = {
  normalizedName: string;
  name: string;
  leafCategory: { id: string; name: string };
  familyCount: number;
  locale: string;
  copies: Copy[];
};
type Made = { id: string; name: string };
type Json = Record<string, unknown>;

const IMAGE = 'data:image/jpeg;base64,YQ==';

describe('Admin: Family Ingredients queue and promote (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;
  let respond: Json = {};
  const prompts: StructuredOutputRequest[] = [];

  let admin: Who;
  let a: Who;
  let b: Who;
  let c: Who;
  let d: Who;
  const emails: Record<string, string> = {};

  const HARD_CHEESE = seedId.leaf('hard-cheese');
  const OTHER = seedId.leaf('other-other');

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input) => {
        prompts.push(input);
        return Promise.resolve({ data: respond, requestId: 'fake-request' });
      },
    });
    database = app.get<Database>(DATABASE);
    const member = async (label: string) => {
      emails[label] = `afi-${label}-${stamp}@example.com`;
      return client(app, await signUp(app, emails[label], label), '/api');
    };
    a = await member('a');
    b = await member('b');
    c = await member('c');
    d = await member('d');
    const adminEmail = `afi-admin-${stamp}@example.com`;
    const adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, adminCookie, '/api');
  });

  afterAll(async () => {
    await app.close();
  });

  const familyIdOf = async (label: string) => {
    const [row] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, emails[label]));
    return row.familyId;
  };

  async function made(
    who: Who,
    name: string,
    leafCategoryId = HARD_CHEESE,
    locale = 'en',
  ): Promise<Made> {
    const res = await who.post(`/catalog/family-ingredients?locale=${locale}`, {
      name,
      leafCategoryId,
      defaultUnit: 'g',
    });
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    return res.body as Made;
  }

  /** Every group of the queue (following the cursor), reduced to the ones named in `names`. */
  async function groupsOf(...names: string[]): Promise<Group[]> {
    const found: Group[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < 50; page++) {
      const res: request.Response = await admin.get(
        `/admin/family-ingredients?limit=100${cursor ? `&cursor=${cursor}` : ''}`,
      );
      expect(res.status).toBe(200);
      const body = res.body as { groups: Group[]; nextCursor: string | null };
      found.push(
        ...body.groups.filter((g) =>
          names.some((name) => g.name.toLowerCase() === name.toLowerCase()),
        ),
      );
      cursor = body.nextCursor;
      if (!cursor) break;
    }
    return found;
  }

  const promote = (ingredientId: string) =>
    admin.post('/admin/family-ingredients/promote', { ingredientId });
  const rowOf = async (id: string) =>
    (
      await database.select().from(ingredients).where(eq(ingredients.id, id))
    )[0];

  type Search = { results: { id: string; owner: string }[] };

  describe('access', () => {
    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/family-ingredients')
        .expect(401);
      await request(app.getHttpServer())
        .post('/api/admin/family-ingredients/promote')
        .set('origin', TEST_ORIGIN)
        .send({ ingredientId: '00000000-0000-4000-8000-000000000000' })
        .expect(401);
    });

    it('is Admin-only: a Member gets 403 on the queue and on promote, and nothing changes', async () => {
      const copy = await made(a, unique('Members Cannot Promote'));

      await a.get('/admin/family-ingredients').expect(403);
      await a
        .post('/admin/family-ingredients/promote', { ingredientId: copy.id })
        .expect(403);

      expect((await rowOf(copy.id)).ownerFamilyId).not.toBeNull();
    });
  });

  describe('the queue', () => {
    it('groups copies by normalised name across Families, ranked by Family count', async () => {
      const three = unique('Afi Three');
      const two = unique('Afi Two');
      const one = unique('Afi One');
      // Case differs between Families: still one group.
      const threeA = await made(a, three, HARD_CHEESE, 'ro');
      const threeB = await made(b, three.toUpperCase(), OTHER, 'ro');
      const threeC = await made(
        c,
        ` ${three.toLowerCase()} `,
        HARD_CHEESE,
        'ro',
      );
      const twoA = await made(a, two, HARD_CHEESE, 'en');
      const twoB = await made(b, two, HARD_CHEESE, 'da');
      const oneD = await made(d, one, OTHER, 'da');
      const shared = await admin.post('/admin/catalog/ingredients', {
        leafCategoryId: HARD_CHEESE,
        name: unique('Afi Shared Never Listed'),
        defaultUnit: 'g',
      });
      expect(shared.status).toBe(201);

      const groups = await groupsOf(three, two, one);

      expect(groups.map((g) => g.familyCount)).toEqual([3, 2, 1]);
      const [g3, g2, g1] = groups;
      expect(g3).toMatchObject({
        name: three,
        familyCount: 3,
        locale: 'ro',
        leafCategory: { id: HARD_CHEESE },
      });
      expect(g3.copies.map((x) => x.id).sort()).toEqual(
        [threeA.id, threeB.id, threeC.id].sort(),
      );
      expect(g3.copies.find((x) => x.id === threeB.id)).toMatchObject({
        name: three.toUpperCase(),
        locale: 'ro',
        defaultUnit: 'g',
        leafCategory: { id: OTHER },
      });
      // The oldest copy names the group and sets its locale.
      expect(g2).toMatchObject({ name: two, familyCount: 2, locale: 'en' });
      expect(g2.copies.map((x) => [x.id, x.locale]).sort()).toEqual(
        [
          [twoA.id, 'en'],
          [twoB.id, 'da'],
        ].sort(),
      );
      expect(g1).toMatchObject({
        name: one,
        familyCount: 1,
        locale: 'da',
        leafCategory: { id: OTHER },
      });
      expect(g1.copies.map((x) => x.id)).toEqual([oneD.id]);
      expect(
        await groupsOf((shared.body as { name: string }).name),
      ).toHaveLength(0);
    });

    it('pages with a cursor', async () => {
      await made(a, unique('Afi Page'));
      const first = await admin.get('/admin/family-ingredients?limit=1');
      expect(first.status).toBe(200);
      const body = first.body as {
        groups: Group[];
        nextCursor: string | null;
      };
      expect(body.groups).toHaveLength(1);
      expect(typeof body.nextCursor).toBe('string');
      await admin.get('/admin/family-ingredients?limit=101').expect(400);
      await admin
        .get('/admin/family-ingredients?cursor=not-a-cursor')
        .expect(400);
    });
  });

  describe('promote', () => {
    it('clears the owner and keeps the ID, and the group leaves the queue', async () => {
      const name = unique('Afi Promoted');
      const copyA = await made(a, name);
      const copyB = await made(b, name);

      const res = await promote(copyB.id);

      expect([res.status, res.body]).toEqual([
        200,
        { ingredientId: copyB.id, name, mergedIngredientIds: [copyA.id] },
      ]);
      expect(await rowOf(copyB.id)).toMatchObject({
        id: copyB.id,
        ownerFamilyId: null,
        normalizedName: normalizeName(name),
      });
      expect(await groupsOf(name)).toHaveLength(0);
    });

    it('makes the Ingredient shared: every Family and the Admin see it as shared, with no Family tag', async () => {
      const name = unique('Afi Visible');
      const copyA = await made(a, name);
      await promote(copyA.id).expect(200);

      for (const who of [a, b, c, d]) {
        const hit = (
          (
            await who.get(
              `/catalog/search?q=${encodeURIComponent(name)}&locale=en`,
            )
          ).body as Search
        ).results.find((r) => r.id === copyA.id);
        expect(hit).toMatchObject({ owner: 'catalog' });
      }
      const shared = (
        (
          await admin.get(
            `/catalog/search?q=${encodeURIComponent(name)}&locale=en&scope=shared`,
          )
        ).body as Search
      ).results.find((r) => r.id === copyA.id);
      expect(shared).toMatchObject({ owner: 'catalog' });
      // A Family can now use it without having owned it.
      await d.post('/staples', { ingredientId: copyA.id }).expect(201);
    });

    it('answers 404 for an unknown Ingredient and for one that is already shared', async () => {
      const unknown = await promote('00000000-0000-4000-8000-000000000000');
      expect(unknown.status).toBe(404);
      expect(unknown.body).toMatchObject({
        code: 'family_ingredients.not_found',
      });
      const shared = await promote(seedId.ingredient('parmesan'));
      expect(shared.status).toBe(404);
      expect(shared.body).toMatchObject({
        code: 'family_ingredients.not_found',
      });
      await admin
        .post('/admin/family-ingredients/promote', { ingredientId: 'nope' })
        .expect(400);
    });

    it('is rejected with 409 family_ingredients.shared_name_exists when a shared Ingredient has that name, and changes nothing', async () => {
      const name = unique('Afi Taken');
      const copyA = await made(a, name);
      const copyB = await made(b, name);
      // Added after the Families filed their copies: both Families see two.
      const sharedRes = await admin.post('/admin/catalog/ingredients', {
        leafCategoryId: HARD_CHEESE,
        name: name.toUpperCase(),
        defaultUnit: 'g',
      });
      expect(sharedRes.status).toBe(201);
      const sharedId = (sharedRes.body as { id: string }).id;
      await a.post('/staples', { ingredientId: copyA.id }).expect(201);

      const res = await promote(copyA.id);

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: 'family_ingredients.shared_name_exists',
        params: { ingredientId: sharedId },
      });
      expect((await rowOf(copyA.id)).ownerFamilyId).not.toBeNull();
      expect((await rowOf(copyB.id)).ownerFamilyId).not.toBeNull();
      expect(await groupsOf(name)).toHaveLength(1);
    });

    it.each([
      ['display name', 'name'],
      ['Synonym', 'synonym'],
    ])(
      'is rejected with 409 when a shared Ingredient has that name as a %s in another locale',
      async (_label, kind) => {
        const name = unique('Afi Translated');
        const copy = await made(a, name);
        const sharedRes = await admin.post('/admin/catalog/ingredients', {
          leafCategoryId: HARD_CHEESE,
          name: unique('Afi Translated Shared'),
          defaultUnit: 'g',
        });
        const sharedId = (sharedRes.body as { id: string }).id;
        const translated = await admin.post('/admin/catalog/translations', {
          entityType: 'ingredient',
          entityId: sharedId,
          locale: 'da',
          kind,
          value: name,
        });
        expect(translated.status).toBe(201);

        const res = await promote(copy.id);

        expect(res.status).toBe(409);
        expect(res.body).toMatchObject({
          code: 'family_ingredients.shared_name_exists',
          params: { ingredientId: sharedId },
        });
        expect((await rowOf(copy.id)).ownerFamilyId).not.toBeNull();
      },
    );
  });

  describe('merging the other Families copies', () => {
    it('re-points every reference kind to the promoted Ingredient, and removes the merged copies', async () => {
      const name = unique('Afi Merge');
      const keep = await made(a, name, HARD_CHEESE);
      // B and C file theirs under another Leaf Category.
      const copyB = await made(b, name, OTHER);
      const copyC = await made(c, name, OTHER);
      const familyB = await familyIdOf('b');
      const familyC = await familyIdOf('c');

      // Family B uses its copy everywhere.
      await b
        .post('/pantry/batches?locale=en', {
          ingredientId: copyB.id,
          quantity: 2,
          unit: 'g',
          location: 'cupboard',
        })
        .expect(201);
      await b
        .post('/shopping-list/items', { ingredientId: copyB.id })
        .expect(200);
      await b
        .post('/shopping-templates', {
          name: unique('Merge template'),
          lines: [{ ingredientId: copyB.id }],
        })
        .expect(201);
      await b
        .post('/recipes', {
          title: unique('Merge recipe'),
          servings: 2,
          locale: 'en',
          parentId: null,
          lines: [{ ingredientId: copyB.id, quantity: 50, unit: 'g' }],
          steps: [{ text: 'Stir' }],
        })
        .expect(201);
      await b
        .post('/staples?locale=en', { ingredientId: copyB.id })
        .expect(201);
      await b.put(`/pantry/running-low/${copyB.id}`).expect(204);
      await b
        .post(`/shopping-list/suggestions/${copyB.id}/dismiss`)
        .expect(204);
      // Family C uses its copy too (a Batch is enough to have stock history).
      await c
        .post('/pantry/batches?locale=en', {
          ingredientId: copyC.id,
          quantity: 1,
          unit: 'g',
          location: 'cupboard',
        })
        .expect(201);

      const res = await promote(keep.id);

      expect(res.status).toBe(200);
      expect(
        (
          res.body as { mergedIngredientIds: string[] }
        ).mergedIngredientIds.sort(),
      ).toEqual([copyB.id, copyC.id].sort());
      const gone = [copyB.id, copyC.id];
      expect(
        await database
          .select()
          .from(ingredients)
          .where(inArray(ingredients.id, gone)),
      ).toHaveLength(0);

      const bBatches = await database
        .select()
        .from(batches)
        .where(eq(batches.familyId, familyB));
      expect(bBatches).toHaveLength(1);
      // The Batch moves to the promoted Ingredient and to its Leaf Category.
      expect(bBatches[0]).toMatchObject({
        ingredientId: keep.id,
        leafCategoryId: HARD_CHEESE,
        unmatched: false,
      });
      const cBatches = await database
        .select()
        .from(batches)
        .where(eq(batches.familyId, familyC));
      expect(cBatches.map((x) => [x.ingredientId, x.leafCategoryId])).toEqual([
        [keep.id, HARD_CHEESE],
      ]);

      const idsOf = async (
        table:
          | typeof shoppingItems
          | typeof shoppingTemplateLines
          | typeof recipeIngredientLines
          | typeof staples,
      ) =>
        database
          .select({ id: table.ingredientId })
          .from(table)
          .where(inArray(table.ingredientId, [keep.id, ...gone]));
      for (const table of [shoppingItems, shoppingTemplateLines, staples]) {
        expect((await idsOf(table)).map((x) => x.id)).toEqual([keep.id]);
      }
      // Recipe lines of other suites do not use our ids.
      expect((await idsOf(recipeIngredientLines)).map((x) => x.id)).toEqual([
        keep.id,
      ]);

      const history = await database
        .select()
        .from(ingredientStockHistory)
        .where(
          inArray(ingredientStockHistory.ingredientId, [keep.id, ...gone]),
        );
      expect(history.map((x) => [x.familyId, x.ingredientId]).sort()).toEqual(
        [
          [familyB, keep.id],
          [familyC, keep.id],
        ].sort(),
      );
      for (const table of [runningLow, suggestionDismissals]) {
        const rows = await database
          .select({ familyId: table.familyId, id: table.ingredientId })
          .from(table)
          .where(inArray(table.ingredientId, [keep.id, ...gone]));
        expect(rows).toEqual([{ familyId: familyB, id: keep.id }]);
      }
    });

    it('de-duplicates Staples, stock history, dismissals and running low a Family already holds on both', async () => {
      const name = unique('Afi Dedup');
      const keep = await made(a, name);
      const copyB = await made(b, name);
      const familyB = await familyIdOf('b');
      const now = new Date();
      const earlier = new Date(now.getTime() - 5 * 86_400_000);
      // Family B ends up referencing both copies (a state an earlier merge
      // or a race can leave behind).
      await database.insert(staples).values([
        { familyId: familyB, ingredientId: copyB.id },
        { familyId: familyB, ingredientId: keep.id },
      ]);
      await database.insert(ingredientStockHistory).values([
        { familyId: familyB, ingredientId: copyB.id, lastStockedAt: now },
        { familyId: familyB, ingredientId: keep.id, lastStockedAt: earlier },
      ]);
      await database.insert(suggestionDismissals).values([
        { familyId: familyB, ingredientId: copyB.id },
        { familyId: familyB, ingredientId: keep.id },
      ]);
      await database.insert(runningLow).values([
        { familyId: familyB, ingredientId: copyB.id },
        { familyId: familyB, ingredientId: keep.id },
      ]);

      await promote(keep.id).expect(200);

      for (const table of [staples, suggestionDismissals, runningLow]) {
        const rows = await database
          .select()
          .from(table)
          .where(
            and(
              eq(table.familyId, familyB),
              inArray(table.ingredientId, [keep.id, copyB.id]),
            ),
          );
        expect(rows.map((x) => x.ingredientId)).toEqual([keep.id]);
      }
      const history = await database
        .select()
        .from(ingredientStockHistory)
        .where(eq(ingredientStockHistory.familyId, familyB));
      const mine = history.filter((x) =>
        [keep.id, copyB.id].includes(x.ingredientId),
      );
      expect(mine).toHaveLength(1);
      expect(mine[0].ingredientId).toBe(keep.id);
      // The most recent stocking wins.
      expect(mine[0].lastStockedAt.getTime()).toBe(now.getTime());
    });

    it('keeps a Family copy of a different name untouched', async () => {
      const name = unique('Afi Different');
      const other = await made(d, unique('Afi Different Other'));
      const keep = await made(a, name);
      await made(b, name);

      await promote(keep.id).expect(200);

      expect((await rowOf(other.id)).ownerFamilyId).not.toBeNull();
    });
  });

  describe('scan catalog caches', () => {
    const productJson = (productName: string): Json => ({
      productName,
      productType: 'Cheese',
      matchedIngredientId: null,
      matchedCategory: null,
      matchConfidence: 0,
      fallbackIngredientName: 'Something else',
      expiryDate: null,
      expiryText: null,
      confidence: 0.95,
    });
    const scan = async (who: Who, productName: string) => {
      respond = productJson(productName);
      prompts.length = 0;
      const res = await who.post('/scan/product', { productImage: IMAGE });
      expect(res.status).toBe(201);
      return (res.body as { lines: { match: { id: string } | null }[] })
        .lines[0].match;
    };

    it('drops every Family cache on promote: a warm Family sees the Ingredient and no stale merged copy', async () => {
      const name = unique('Afi Cached');
      const keep = await made(a, name);
      const copyC = await made(c, name);
      // Warm the caches of the owners and of an outsider.
      expect(await scan(c, name)).toMatchObject({ id: copyC.id });
      await scan(a, 'warm');
      await scan(d, 'warm');
      expect(prompts[0].prompt).not.toContain(name);

      await promote(keep.id).expect(200);

      expect(await scan(d, name)).toMatchObject({ id: keep.id });
      expect(prompts[0].prompt).toContain(name);
      expect(await scan(c, name)).toMatchObject({ id: keep.id });
    });
  });
});
