import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from '../src/catalog/seed/catalog-seed-data';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { client, signUp } from './support/admin-session';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Result = {
  id: string;
  name: string;
  parentCategory: {
    id: string;
    name: string;
    aisle: { id: string; name: string };
  };
};
type AisleListing = {
  id: string;
  name: string;
  parentCategories: Array<{ id: string; name: string }>;
};

describe('Catalog browse by aisle (integration)', () => {
  let app: NestFastifyApplication;
  let cookie: string;

  beforeAll(async () => {
    app = await createTestApp();
    const signUp = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .send({
        name: 'Browse Member',
        email: `catalog-browse-${Date.now()}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    cookie = [signUp.headers['set-cookie'] ?? []]
      .flat()
      .map((value) => value.split(';')[0])
      .join('; ');
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, query: Record<string, string>) =>
    request(app.getHttpServer())
      .get(`/api${path}`)
      .query(query)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  async function search(query: Record<string, string>): Promise<Result[]> {
    const response = await get('/catalog/search', query).expect(200);
    return (response.body as { results: Result[] }).results;
  }

  async function aisleList(locale?: string): Promise<AisleListing[]> {
    const response = await get(
      '/catalog/aisles',
      locale ? { locale } : {},
    ).expect(200);
    return (response.body as { aisles: AisleListing[] }).aisles;
  }

  const DAIRY = seedId.aisle('dairy-eggs');
  const seededCount = (aisleSlug: string) => {
    const parents = new Set(
      SEED_PARENTS.filter((p) => p.aisle === aisleSlug).map((p) => p.slug),
    );
    const leaves = new Set(
      SEED_LEAVES.filter((l) => parents.has(l.parent)).map((l) => l.slug),
    );
    return SEED_INGREDIENTS.filter((i) => leaves.has(i.leaf)).length;
  };

  // Other suites share this DB and add rows under seeded Aisles, so assertions
  // about "the Aisle's contents" only consider seeded Parent Categories.
  const SEEDED_PARENT_IDS = new Set(
    SEED_PARENTS.map((p) => seedId.parent(p.slug)),
  );
  const seededParentsOf = (aisle?: AisleListing) =>
    (aisle?.parentCategories ?? []).filter((p) => SEEDED_PARENT_IDS.has(p.id));

  describe('GET /catalog/aisles', () => {
    it('lists the Aisles in shop order, each with its Parent Categories', async () => {
      const aisles = await aisleList();

      const expected = [...SEED_AISLES].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );
      const seededIds = expected.map((a) => seedId.aisle(a.slug));
      // Other suites sharing this DB may add Aisles; compare only the seeded ones.
      expect(
        aisles.map((a) => a.id).filter((id) => seededIds.includes(id)),
      ).toEqual(seededIds);
      const dairy = aisles.find((a) => a.id === DAIRY);
      expect(dairy?.name).toBe('Dairy & eggs');
      const seededParents = seededParentsOf(dairy);
      expect(seededParents).toEqual(
        expect.arrayContaining([
          { id: seedId.parent('dairy'), name: 'Dairy' },
          { id: seedId.parent('eggs'), name: 'Eggs' },
        ]),
      );
      expect(seededParents).toHaveLength(2);
    });

    it('names Aisles and Parent Categories in the requested locale', async () => {
      const dairy = (await aisleList('ro')).find((a) => a.id === DAIRY);
      expect(dairy?.name).toBe('Lactate și ouă');
      expect(
        seededParentsOf(dairy)
          .map((p) => p.name)
          .sort(),
      ).toEqual(['Lactate', 'Ouă']);
    });

    it('requires authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/catalog/aisles')
        .set('origin', TEST_ORIGIN)
        .expect(401);
    });
  });

  describe('GET /catalog/search with aisleId', () => {
    it('returns the Aisle’s Ingredients A to Z by localised name for an empty q', async () => {
      const results = await search({ q: '', aisleId: DAIRY, limit: '50' });

      const seededIds = new Set(
        SEED_INGREDIENTS.map((i) => seedId.ingredient(i.slug)),
      );
      expect(results.length).toBeGreaterThan(5);
      expect(results.length).toBeLessThanOrEqual(50);
      expect(results.filter((r) => seededIds.has(r.id)).length).toBeGreaterThan(
        5,
      );
      for (const r of results) {
        expect(r.parentCategory.aisle.id).toBe(DAIRY);
      }
      const names = results.map((r) => r.name);
      expect(names).toEqual(
        [...names].sort((a, b) => a.localeCompare(b, 'en')),
      );
      expect(names).toEqual(expect.arrayContaining(['Eggs', 'Milk']));
    });

    it('sorts by the name in the requested locale', async () => {
      const results = await search({ q: '', aisleId: DAIRY, locale: 'ro' });
      const names = results.map((r) => r.name);
      expect(names).toContain('Lapte');
      expect(names).toEqual(
        [...names].sort((a, b) => a.localeCompare(b, 'ro')),
      );
    });

    it('caps an empty-q listing at 50, even above the default limit', async () => {
      const big = SEED_AISLES.map((a) => a.slug).find(
        (slug) => seededCount(slug) > 50,
      );
      expect(big).toBeDefined();
      const results = await search({
        q: '',
        aisleId: seedId.aisle(big as string),
      });
      expect(results).toHaveLength(50);
    });

    it('narrows to a Parent Category with parentCategoryId', async () => {
      const all = await search({ q: '', aisleId: DAIRY });
      const eggs = await search({
        q: '',
        aisleId: DAIRY,
        parentCategoryId: seedId.parent('eggs'),
      });

      expect(eggs.length).toBeGreaterThan(0);
      expect(eggs.length).toBeLessThan(all.length);
      for (const r of eggs) {
        expect(r.parentCategory.id).toBe(seedId.parent('eggs'));
      }
      expect(eggs.map((r) => r.name)).toContain('Eggs');
    });

    it('filters by q within the Aisle', async () => {
      const results = await search({ q: 'milk', aisleId: DAIRY });
      expect(results.map((r) => r.name)).toContain('Milk');
      for (const r of results) {
        expect(r.parentCategory.aisle.id).toBe(DAIRY);
      }
      // The same text elsewhere is found without the Aisle, but not inside a different one.
      const bakery = await search({
        q: 'milk',
        aisleId: seedId.aisle('bakery'),
      });
      expect(bakery.map((r) => r.name)).not.toContain('Milk');
    });

    it('applies parentCategoryId to a q search too', async () => {
      const results = await search({
        q: 'e',
        aisleId: DAIRY,
        parentCategoryId: seedId.parent('eggs'),
      });
      expect(results.length).toBeGreaterThan(0);
      for (const r of results) {
        expect(r.parentCategory.id).toBe(seedId.parent('eggs'));
      }
    });

    it('still returns nothing for an empty q without aisleId', async () => {
      expect(await search({ q: '' })).toEqual([]);
      expect(await search({ q: '   ' })).toEqual([]);
      expect(
        await search({ q: '', parentCategoryId: seedId.parent('eggs') }),
      ).toEqual([]);
    });

    it('still works for the shared scope (Admin)', async () => {
      const family = await search({ q: '', aisleId: DAIRY });
      const shared = await search({ q: '', aisleId: DAIRY, scope: 'shared' });
      expect(shared.length).toBeGreaterThan(0);
      const seededIds = new Set(
        SEED_INGREDIENTS.map((i) => seedId.ingredient(i.slug)),
      );
      const seededOnly = (rs: Result[]) =>
        rs.filter((r) => seededIds.has(r.id)).map((r) => r.id);
      expect(seededOnly(shared)).toEqual(seededOnly(family));
      const sharedAisles = (
        await get('/catalog/aisles', { scope: 'shared' }).expect(200)
      ).body as { aisles: AisleListing[] };
      const seededAisleIds = new Set(
        SEED_AISLES.map((a) => seedId.aisle(a.slug)),
      );
      const seededAisles = (as: AisleListing[]) =>
        as
          .filter((a) => seededAisleIds.has(a.id))
          .map((a) => ({ ...a, parentCategories: seededParentsOf(a) }));
      expect(seededAisles(sharedAisles.aisles)).toEqual(
        seededAisles(await aisleList()),
      );
    });

    it('rejects an aisleId that is not a UUID', async () => {
      await get('/catalog/search', { q: '', aisleId: 'nope' }).expect(400);
    });
  });
  describe('Catalog Language', () => {
    // A Member whose UI Language is English; the request carries locale=en as the web does.
    async function member(catalogLanguage: string | null) {
      const memberCookie = await signUp(
        app,
        `catalog-language-${Date.now()}-${Math.random()}@example.com`,
        'Catalog Language Member',
      );
      await client(app, memberCookie, '/api/settings')
        .put('/preferences', { locale: 'en', catalogLanguage })
        .expect(200);
      const api = client(app, memberCookie, '/api');
      return (path: string, query: Record<string, string>) =>
        api.get(`${path}?${new URLSearchParams({ locale: 'en', ...query })}`);
    }

    const dairyAisle = SEED_AISLES.find((a) => a.slug === 'dairy-eggs');
    const milkSeed = SEED_INGREDIENTS.find((i) => i.slug === 'milk');

    it('names Aisles, search results and Allergens in the Catalog Language, not the UI Language', async () => {
      const romanian = await member('ro');

      const aisles = (
        (await romanian('/catalog/aisles', {}).expect(200)).body as {
          aisles: AisleListing[];
        }
      ).aisles;
      expect(aisles.find((a) => a.id === DAIRY)?.name).toBe(dairyAisle?.ro);

      const results = (
        (
          await romanian('/catalog/search', {
            q: 'milk',
            scope: 'shared',
          }).expect(200)
        ).body as { results: Result[] }
      ).results;
      expect(
        results.find((r) => r.id === seedId.ingredient('milk'))?.name,
      ).toBe(milkSeed?.ro);

      const allergens = (
        (await romanian('/catalog/allergens', {}).expect(200)).body as {
          allergens: Array<{ id: string; name: string }>;
        }
      ).allergens;
      expect(
        allergens.find((a) => a.id === seedId.allergen('milk'))?.name,
      ).toBe('Lapte');
    });

    it('uses the UI Language when the Catalog Language is the empty "Same as UI Language"', async () => {
      const same = await member(null);
      const aisles = (
        (await same('/catalog/aisles', {}).expect(200)).body as {
          aisles: AisleListing[];
        }
      ).aisles;
      expect(aisles.find((a) => a.id === DAIRY)?.name).toBe(dairyAisle?.en);
    });
  });
});
