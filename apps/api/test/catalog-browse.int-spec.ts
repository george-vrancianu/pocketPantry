import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import {
  SEED_AISLES,
  SEED_INGREDIENTS,
  SEED_LEAVES,
  SEED_PARENTS,
} from '../src/catalog/seed/catalog-seed-data';
import { seedId } from '../src/catalog/seed/seed-catalog';
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

  describe('GET /catalog/aisles', () => {
    it('lists the Aisles in shop order, each with its Parent Categories', async () => {
      const aisles = await aisleList();

      const expected = [...SEED_AISLES].sort(
        (a, b) => a.sortOrder - b.sortOrder,
      );
      expect(aisles.map((a) => a.id)).toEqual(
        expected.map((a) => seedId.aisle(a.slug)),
      );
      const dairy = aisles.find((a) => a.id === DAIRY);
      expect(dairy?.name).toBe('Dairy & eggs');
      expect(dairy?.parentCategories).toEqual(
        expect.arrayContaining([
          { id: seedId.parent('dairy'), name: 'Dairy' },
          { id: seedId.parent('eggs'), name: 'Eggs' },
        ]),
      );
      expect(dairy?.parentCategories).toHaveLength(2);
    });

    it('names Aisles and Parent Categories in the requested locale', async () => {
      const dairy = (await aisleList('ro')).find((a) => a.id === DAIRY);
      expect(dairy?.name).toBe('Lactate și ouă');
      expect(dairy?.parentCategories.map((p) => p.name).sort()).toEqual([
        'Lactate',
        'Ouă',
      ]);
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

      expect(results.length).toBeGreaterThan(5);
      expect(results.length).toBe(Math.min(50, seededCount('dairy-eggs')));
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
      expect(shared).toEqual(family);
      expect(
        (await get('/catalog/aisles', { scope: 'shared' }).expect(200)).body,
      ).toHaveProperty('aisles');
    });

    it('rejects an aisleId that is not a UUID', async () => {
      await get('/catalog/search', { q: '', aisleId: 'nope' }).expect(400);
    });
  });
});
