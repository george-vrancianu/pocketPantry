import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { normalizeName } from '../src/catalog/normalize';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Result = {
  id: string;
  name: string;
  owner: 'catalog' | 'family';
  defaultUnit: string;
  leafCategory: { id: string; name: string };
  parentCategory: {
    id: string;
    name: string;
    aisle: { id: string; name: string };
  };
  defaults: { expiryDays: number | null; location: string | null };
};
type Category = {
  id: string;
  name: string;
  parentCategory: { id: string; name: string };
  aisle: { id: string; name: string };
  defaults: { expiryDays: number | null; location: string | null };
};

const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

// Contract: see /home/giu/projects/notes-263/contract-270.md. Rows created here are
// owned by throwaway Families, so no other suite sees them; the test database is
// torn down after the run.
describe('Family Ingredients (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;

  let a: ReturnType<typeof client>;
  let a2: ReturnType<typeof client>;
  let b: ReturnType<typeof client>;
  let adminCookie: string;
  let cookieA: string;
  let cookieB: string;

  const HARD_CHEESE = seedId.leaf('hard-cheese');
  const OTHER = seedId.leaf('other-other');
  const parmesan = seedId.ingredient('parmesan');

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    cookieA = await signUp(app, `fi-a-${stamp}@example.com`, 'A');
    const cookieA2 = await signUp(app, `fi-a2-${stamp}@example.com`, 'A2');
    cookieB = await signUp(app, `fi-b-${stamp}@example.com`, 'B');
    const adminEmail = `fi-admin-${stamp}@example.com`;
    adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    a = client(app, cookieA, '/api');
    a2 = client(app, cookieA2, '/api');
    b = client(app, cookieB, '/api');
    // A2 joins A's Family.
    const invite = (await a.get('/family').expect(200)).body as {
      inviteCode: string;
    };
    await a2.post('/family/join', { code: invite.inviteCode }).expect(201);
  });

  afterAll(async () => {
    await database
      .delete(catalogTranslations)
      .where(eq(catalogTranslations.value, `fi-synonym-${stamp}`));
    await database
      .delete(catalogTranslations)
      .where(eq(catalogTranslations.value, `fi-synonym-hidden-${stamp}`));
    await app.close();
  });

  const create = (who: typeof a, body: object, locale = 'en') =>
    who.post(`/catalog/family-ingredients?locale=${locale}`, body);
  const body = (name: string, overrides: object = {}) => ({
    name,
    leafCategoryId: HARD_CHEESE,
    defaultUnit: 'g',
    ...overrides,
  });
  async function made(who: typeof a, name: string, overrides: object = {}) {
    const res = await create(who, body(name, overrides));
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    return res.body as Result;
  }
  const search = async (
    who: typeof a,
    q: string,
    extra = '',
  ): Promise<Result[]> =>
    (
      (await who.get(`/catalog/search?q=${encodeURIComponent(q)}${extra}`))
        .body as {
        results: Result[];
      }
    ).results;

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/catalog/family-ingredients')
      .set('origin', TEST_ORIGIN)
      .send(body('Nope'))
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/catalog/categories')
      .expect(401);
  });

  describe('creating', () => {
    it('returns a search result owned by the Family, in the chosen Leaf Category and unit', async () => {
      const name = unique('Kombucha');
      const res = await create(a, body(name, { defaultUnit: 'ml' }));

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name,
        owner: 'family',
        defaultUnit: 'ml',
        leafCategory: { id: HARD_CHEESE, name: 'Hard cheese' },
        parentCategory: { name: 'Dairy' },
      });
      expect((res.body as Result).id).toEqual(expect.any(String));
    });

    it('trims the name and shows it as typed in every locale', async () => {
      const name = unique('Gran Mix');
      const created = (await create(a, body(`  ${name}  `), 'en').expect(201))
        .body as Result;
      expect(created.name).toBe(name);

      for (const locale of ['en', 'ro', 'da']) {
        const hit = (await search(a, name, `&locale=${locale}`)).find(
          (r) => r.id === created.id,
        );
        expect(hit).toMatchObject({ name, owner: 'family' });
      }
    });

    it('lets any Member of the Family create one, and every Member see it', async () => {
      const name = unique('Shared Within Family');
      const created = await made(a2, name);
      expect((await search(a, name)).map((r) => r.id)).toContain(created.id);
    });

    it('marks seeded results as owned by the Catalog', async () => {
      const hit = (await search(a, 'parmesan')).find((r) => r.id === parmesan);
      expect(hit?.owner).toBe('catalog');
    });

    it('validates the payload', async () => {
      await create(a, body('')).expect(400);
      await create(a, body('x', { defaultUnit: 'cups' })).expect(400);
      await create(a, { name: 'x', defaultUnit: 'g' }).expect(400);
      await create(a, body('x', { leafCategoryId: 'nope' })).expect(400);
    });

    it('rejects a Leaf Category that does not exist', async () => {
      const res = await create(
        a,
        body(unique('Ghost'), { leafCategoryId: randomUUID() }),
      );
      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ code: 'catalog.not_found' });
    });
  });

  describe('name collisions', () => {
    it('answers 409 with the existing Ingredient on a shared name, ignoring case and accents', async () => {
      for (const typed of ['PARMESAN', 'Pârmesan']) {
        const res = await create(a, body(typed));

        expect(res.status).toBe(409);
        expect(res.body).toMatchObject({
          code: 'catalog.family_ingredient_exists',
          params: {
            existing: { id: parmesan, name: 'Parmesan', owner: 'catalog' },
          },
        });
      }
    });

    it('answers 409 on a shared name in another locale', async () => {
      // "Parmezan" is the Romanian name of Parmesan.
      const res = await create(a, body('parmezan'));
      expect(res.status).toBe(409);
      expect(
        (res.body as { params: { existing: Result } }).params.existing.id,
      ).toBe(parmesan);
    });

    it('answers 409 with the existing Ingredient on a shared Synonym', async () => {
      const value = `fi-synonym-${stamp}`;
      await database.insert(catalogTranslations).values({
        id: randomUUID(),
        entityType: 'ingredient',
        entityId: parmesan,
        locale: 'en',
        kind: 'synonym',
        value,
        normalizedValue: normalizeName(value),
      });

      const res = await create(a, body(value));

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: 'catalog.family_ingredient_exists',
        params: { existing: { id: parmesan, owner: 'catalog' } },
      });
    });

    it("answers 409 with the Family's own Ingredient on its own name, ignoring case", async () => {
      const name = unique('Own Clash');
      const first = await made(a, name);

      const res = await create(
        a,
        body(name.toUpperCase(), { leafCategoryId: OTHER }),
      );

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: 'catalog.family_ingredient_exists',
        params: { existing: { id: first.id, owner: 'family' } },
      });
    });

    it('lets two Families each own the same name', async () => {
      const name = unique('Kombucha Twin');
      const forA = await made(a, name);
      const forB = await made(b, name);

      expect(forB.id).not.toBe(forA.id);
      const seenByA = (await search(a, name)).map((r) => r.id);
      const seenByB = (await search(b, name)).map((r) => r.id);
      expect(seenByA).toContain(forA.id);
      expect(seenByA).not.toContain(forB.id);
      expect(seenByB).toContain(forB.id);
      expect(seenByB).not.toContain(forA.id);
    });
  });

  describe('visibility', () => {
    it("never shows Family A's Ingredient to Family B, in search or by id", async () => {
      const name = unique('Secret Sauce');
      const secret = await made(a, name);

      expect((await search(a, name)).map((r) => r.id)).toContain(secret.id);
      expect((await search(b, name)).map((r) => r.id)).not.toContain(secret.id);

      // Anything that looks the Ingredient up by id treats it as unknown to B.
      await b
        .post('/pantry/batches', { ingredientId: secret.id })
        .expect(404)
        .expect(({ body: error }) =>
          expect(error).toMatchObject({ code: 'pantry.ingredient_not_found' }),
        );
      await b
        .post('/shopping-list/items', { ingredientId: secret.id })
        .expect(404)
        .expect(({ body: error }) =>
          expect(error).toMatchObject({
            code: 'shopping.ingredient_not_found',
          }),
        );
      await b
        .post('/staples', { ingredientId: secret.id })
        .expect(404)
        .expect(({ body: error }) =>
          expect(error).toMatchObject({
            code: 'shopping.ingredient_not_found',
          }),
        );
    });

    it('never shows it in the shared scope, even to its own Family', async () => {
      const name = unique('Hidden From Shared');
      const hiddenFromShared = await made(a, name);

      expect(
        (await search(a, name, '&scope=shared')).map((r) => r.id),
      ).not.toContain(hiddenFromShared.id);
    });

    it('never shows it to an Admin, in the shared scope or in Catalog Recipe editing', async () => {
      const name = unique('Hidden From Admin');
      const hidden = await made(a, name);
      const admin = client(app, adminCookie, '/api');

      expect(
        (await search(admin, name, '&scope=shared')).map((r) => r.id),
      ).not.toContain(hidden.id);
      const recipe = await admin.post('/admin/recipes', {
        title: unique('Admin recipe'),
        servings: 2,
        lines: [{ ingredientId: hidden.id, quantity: 1, unit: 'g' }],
        steps: [{ text: 'Mix' }],
      });
      expect(recipe.status).toBe(404);

      // Nor can Admin curation reach it by id: every mutation answers 404.
      const notFound = { code: 'catalog.not_found' };
      const patched = await admin.patch(
        `/admin/catalog/ingredients/${hidden.id}`,
        {
          name: unique('Renamed By Admin'),
        },
      );
      expect([patched.status, patched.body]).toEqual([
        404,
        expect.objectContaining(notFound),
      ]);
      const deleted = await admin.del(
        `/admin/catalog/ingredients/${hidden.id}`,
      );
      expect(deleted.status).toBe(404);
      const translated = await admin.post('/admin/catalog/translations', {
        entityType: 'ingredient',
        entityId: hidden.id,
        locale: 'ro',
        kind: 'synonym',
        value: unique('Admin synonym'),
      });
      expect(translated.status).toBe(404);
      expect((await search(a, name)).map((r) => r.name)).toContain(name);
    });

    it('answers 404 to Admin edits of a Family Ingredient translation', async () => {
      const admin = client(app, adminCookie, '/api');
      const hidden = await made(a, unique('Hidden Translated'));
      const [row] = await database
        .insert(catalogTranslations)
        .values({
          id: randomUUID(),
          entityType: 'ingredient',
          entityId: hidden.id,
          locale: 'ro',
          kind: 'synonym',
          value: `fi-synonym-hidden-${stamp}`,
          normalizedValue: normalizeName(`fi-synonym-hidden-${stamp}`),
        })
        .returning();

      expect(
        (
          await admin.patch(`/admin/catalog/translations/${row.id}`, {
            value: 'x',
          })
        ).status,
      ).toBe(404);
      expect(
        (await admin.del(`/admin/catalog/translations/${row.id}`)).status,
      ).toBe(404);
    });

    it('lists it in the browse-by-aisle search of its own Family only', async () => {
      const name = unique('Browse Me');
      const created = await made(a, name);
      const aisleId = created.parentCategory.aisle.id;
      const listing = async (who: typeof a, extra = '') =>
        (
          (
            await who.get(
              `/catalog/search?q=&aisleId=${aisleId}&limit=50${extra}`,
            )
          ).body as { results: Result[] }
        ).results;

      // Browse is capped at 50 Ingredients, so narrow with the name.
      const within = async (who: typeof a) =>
        (await search(who, name, `&aisleId=${aisleId}`)).map((r) => r.id);
      expect(await within(a)).toContain(created.id);
      expect(await within(b)).not.toContain(created.id);
      expect((await listing(b)).map((r) => r.id)).not.toContain(created.id);
    });
  });

  describe('Default Expiry', () => {
    it("inherits the Leaf Category's Default Expiry", async () => {
      const created = await made(a, unique('Inherits'));
      expect(created.defaults).toMatchObject({
        expiryDays: 60,
        location: 'fridge',
      });
    });

    it("applies the Family's override, for that Family only", async () => {
      const family = await signUp(app, `fi-override-${stamp}@example.com`, 'O');
      const other = client(app, family, '/api');
      const stranger = client(app, cookieB, '/api');
      await other
        .put(`/settings/family/expiry-overrides/${HARD_CHEESE}`, { days: 14 })
        .expect(200);

      const created = await made(other, unique('Overridden'));

      expect(created.defaults.expiryDays).toBe(14);
      expect(
        (await search(other, created.name)).find((r) => r.id === created.id)
          ?.defaults.expiryDays,
      ).toBe(14);
      // Family B has no override, so its own Family Ingredient in that Leaf keeps 60.
      expect(
        (await made(stranger, unique('Not overridden'))).defaults.expiryDays,
      ).toBe(60);
    });

    it('is the default expiry of a Batch of the Ingredient', async () => {
      const created = await made(a, unique('Batchable'));
      const batch = await a.post('/pantry/batches', {
        ingredientId: created.id,
        quantity: 2,
        unit: 'g',
      });
      expect(batch.status).toBe(201);
      expect(batch.body).toMatchObject({
        name: created.name,
        unmatched: false,
        expiryDate: inDays(60),
        location: 'fridge',
      });
    });
  });

  describe('using a Family Ingredient', () => {
    it('adds a Batch, a Shopping Item, a Staple and a Family Recipe line', async () => {
      const created = await made(a, unique('First Class'));

      const batch = await a.post('/pantry/batches', {
        ingredientId: created.id,
        quantity: 1,
        unit: 'g',
      });
      expect(batch.status).toBe(201);
      expect(batch.body).toMatchObject({
        ingredientId: created.id,
        unmatched: false,
      });

      const item = await a.post('/shopping-list/items', {
        ingredientId: created.id,
      });
      expect(item.status).toBe(200);
      expect(
        (
          item.body as {
            groups: { items: { ingredientId: string | null }[] }[];
          }
        ).groups
          .flatMap((g) => g.items)
          .map((i) => i.ingredientId),
      ).toContain(created.id);

      const staple = await a.post('/staples?locale=en', {
        ingredientId: created.id,
      });
      expect(staple.status).toBe(201);
      expect(staple.body).toMatchObject({
        ingredientId: created.id,
        name: created.name,
      });

      const recipe = await a.post('/recipes', {
        title: unique('Fam recipe'),
        servings: 2,
        locale: 'en',
        parentId: null,
        lines: [{ ingredientId: created.id, quantity: 50, unit: 'g' }],
        steps: [{ text: 'Whisk' }],
      });
      expect([recipe.status, recipe.body]).toEqual([201, expect.anything()]);
      expect(
        (recipe.body as { lines: { ingredientId: string | null }[] }).lines.map(
          (l) => l.ingredientId,
        ),
      ).toEqual([created.id]);
    });
  });

  describe('GET /catalog/categories', () => {
    const categories = async (who: typeof a, query: string) => {
      const res = await who.get(`/catalog/categories?${query}`);
      expect(res.status).toBe(200);
      return (res.body as { categories: Category[] }).categories;
    };

    it('offers only the top-level Other Leaf for an empty query', async () => {
      const list = await categories(a, 'q=&locale=en');
      expect(list.map((c) => c.id)).toEqual([OTHER]);
      expect(list[0]).toMatchObject({
        name: 'Other',
        parentCategory: { name: 'Other' },
        aisle: { name: 'Other' },
        defaults: { expiryDays: null },
      });
    });

    it('lists Leaf Categories with parent, aisle and Default Expiry, names in the locale', async () => {
      const [hard] = await categories(a, 'q=hard%20cheese');
      expect(hard).toMatchObject({
        id: HARD_CHEESE,
        name: 'Hard cheese',
        parentCategory: { name: 'Dairy' },
        aisle: { name: 'Dairy & eggs' },
        defaults: { expiryDays: 60, location: 'fridge' },
      });
      const [ro] = await categories(a, 'q=brânzeturi%20tari&locale=ro');
      expect(ro).toMatchObject({ id: HARD_CHEESE, name: 'Brânzeturi tari' });
    });

    it('ranks leaf starts with, leaf contains, parent contains, then aisle contains', async () => {
      const list = await categories(a, 'q=spice&limit=50');
      const tier = (c: Category) => {
        const q = 'spice';
        const leaf = c.name.toLowerCase();
        if (leaf.startsWith(q)) return 0;
        if (leaf.includes(q)) return 1;
        if (c.parentCategory.name.toLowerCase().includes(q)) return 2;
        if (c.aisle.name.toLowerCase().includes(q)) return 3;
        return 4;
      };
      const tiers = list.map(tier);

      expect(Math.max(...tiers)).toBe(3);
      expect([...new Set(tiers)]).toEqual([0, 1, 2, 3]);
      expect(tiers).toEqual([...tiers].sort((x, y) => x - y));
    });

    it('caps the list at the limit', async () => {
      expect((await categories(a, 'q=spice&limit=2')).length).toBe(2);
    });

    it("applies the Family's Default Expiry override", async () => {
      const family = await signUp(app, `fi-cat-${stamp}@example.com`, 'C');
      const own = client(app, family, '/api');
      await own
        .put(`/settings/family/expiry-overrides/${HARD_CHEESE}`, { days: 9 })
        .expect(200);

      const mine = (await categories(own, 'q=hard%20cheese'))[0];
      const theirs = (await categories(b, 'q=hard%20cheese'))[0];

      expect(mine.defaults.expiryDays).toBe(9);
      expect(theirs.defaults.expiryDays).toBe(60);
    });

    it('rejects an unknown locale', async () => {
      await a.get('/catalog/categories?q=x&locale=xx').expect(400);
    });
  });
});
