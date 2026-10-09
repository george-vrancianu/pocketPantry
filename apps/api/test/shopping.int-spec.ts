import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  shoppingItemSourceRecipes,
  shoppingLists,
  user,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Item = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  checked: boolean;
  unmatched: boolean;
};
type List = {
  id: string;
  groups: Array<{
    aisle: { id: string; name: string; sortOrder: number } | null;
    items: Item[];
  }>;
  summary: { remaining: number; checked: number };
};

describe('Shopping List (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    // The starter Catalog is seeded once by global-setup.mjs.
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp(name: string) {
    const email = `shopping-${Date.now()}-${++counter}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.1.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({ name, email, password: 'correct-horse-battery-staple' })
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

  const call = (
    method: 'get' | 'post' | 'patch' | 'delete',
    cookie: string,
    path: string,
  ) =>
    request(app.getHttpServer())
      [method](`/api/shopping-list${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  const getList = async (cookie: string, locale = 'en') =>
    (await call('get', cookie, `?locale=${locale}`).expect(200)).body as List;

  const add = async (
    cookie: string,
    body: Record<string, unknown>,
    locale = 'en',
  ) =>
    (
      await call('post', cookie, `/items?locale=${locale}`)
        .send(body)
        .expect(200)
    ).body as List;

  async function ingredientId(cookie: string, q: string) {
    const response = await request(app.getHttpServer())
      .get('/api/catalog/search')
      .query({ q })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .expect(200);
    return (response.body as { results: Array<{ id: string }> }).results[0].id;
  }

  const items = (list: List) => list.groups.flatMap((g) => g.items);

  it('creates exactly one active list per Family, on demand', async () => {
    const { cookie, userId } = await signUp('Ana');

    const first = await getList(cookie);
    const second = await getList(cookie);

    expect(first.groups).toEqual([]);
    expect(first.summary).toEqual({ remaining: 0, checked: 0 });
    expect(second.id).toBe(first.id);
    const [self] = await database
      .select()
      .from(user)
      .where(eq(user.id, userId));
    const lists = await database
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.familyId, self.familyId));
    expect(lists).toHaveLength(1);
    expect(lists[0].status).toBe('active');
  });

  describe('merge rules', () => {
    it('sums quantities when the unit agrees', async () => {
      const { cookie } = await signUp('Merge');
      const parmesan = await ingredientId(cookie, 'parmesan');

      await add(cookie, { ingredientId: parmesan, quantity: 200, unit: 'g' });
      const list = await add(cookie, {
        ingredientId: parmesan,
        quantity: 150,
        unit: 'g',
      });

      expect(items(list)).toHaveLength(1);
      expect(items(list)[0]).toMatchObject({
        name: 'Parmesan',
        quantity: 350,
        unit: 'g',
        unmatched: false,
      });
    });

    it('rejects a merge that would pass the quantity cap, leaving the line as it was', async () => {
      const { cookie } = await signUp('Cap');
      const parmesan = await ingredientId(cookie, 'parmesan');

      await add(cookie, {
        ingredientId: parmesan,
        quantity: 600_000,
        unit: 'g',
      });
      const rejected = await call('post', cookie, '/items').send({
        ingredientId: parmesan,
        quantity: 500_000,
        unit: 'g',
      });
      expect(rejected.status).toBe(400);
      expect((rejected.body as { code: string }).code).toBe(
        'shopping.quantity_too_large',
      );

      const list = await add(cookie, {
        ingredientId: parmesan,
        quantity: 400_000,
        unit: 'g',
      });
      expect(items(list)).toHaveLength(1);
      expect(items(list)[0].quantity).toBe(1_000_000);
    });

    it('keeps separate lines when the units differ', async () => {
      const { cookie } = await signUp('Units');
      const milk = await ingredientId(cookie, 'milk');

      await add(cookie, { ingredientId: milk, quantity: 1, unit: 'l' });
      const list = await add(cookie, {
        ingredientId: milk,
        quantity: 200,
        unit: 'ml',
      });

      expect(items(list).map((i) => [i.quantity, i.unit])).toEqual([
        [1, 'l'],
        [200, 'ml'],
      ]);
    });

    it('treats a missing unit as its own unit', async () => {
      const { cookie } = await signUp('NoUnit');
      const milk = await ingredientId(cookie, 'milk');

      await add(cookie, { ingredientId: milk });
      await add(cookie, { ingredientId: milk, quantity: 2, unit: 'l' });
      const list = await add(cookie, { ingredientId: milk });

      expect(items(list)).toHaveLength(2);
    });

    it('wants a checked item again when it is added again', async () => {
      const { cookie } = await signUp('Again');
      const milk = await ingredientId(cookie, 'milk');
      const added = await add(cookie, {
        ingredientId: milk,
        quantity: 1,
        unit: 'l',
      });
      await call('patch', cookie, `/items/${items(added)[0].id}`)
        .send({ checked: true })
        .expect(200);

      const list = await add(cookie, {
        ingredientId: milk,
        quantity: 1,
        unit: 'l',
      });

      expect(items(list)[0]).toMatchObject({ quantity: 2, checked: false });
    });
  });

  it('adds a name with no Catalog match as an Unmatched Shopping Item, merged by normalised name', async () => {
    const { cookie } = await signUp('Unmatched');

    await add(cookie, { name: 'Dragon fruit', quantity: 1, unit: 'pcs' });
    const list = await add(cookie, {
      name: '  dragon FRUIT ',
      quantity: 2,
      unit: 'pcs',
    });

    expect(items(list)).toEqual([
      expect.objectContaining({
        name: 'Dragon fruit',
        quantity: 3,
        unit: 'pcs',
        unmatched: true,
      }),
    ]);
    expect(list.groups[0].aisle).toBeNull();
  });

  it('rejects an add with neither or both of ingredientId and name', async () => {
    const { cookie } = await signUp('Invalid');
    const milk = await ingredientId(cookie, 'milk');

    await call('post', cookie, '/items').send({}).expect(400);
    await call('post', cookie, '/items')
      .send({ ingredientId: milk, name: 'Milk' })
      .expect(400);
    await call('post', cookie, '/items').send({ name: '!!!' }).expect(400);
    await call('post', cookie, '/items')
      .send({ ingredientId: '00000000-0000-4000-8000-00000000dead' })
      .expect(404);
  });

  it('groups by Aisle in shop order, Unmatched last, with localised names and a summary', async () => {
    const { cookie } = await signUp('Groups');
    await add(cookie, { name: 'Mystery sauce' });
    await add(cookie, { ingredientId: await ingredientId(cookie, 'milk') });
    await add(cookie, { ingredientId: await ingredientId(cookie, 'tomato') });
    const list = await add(cookie, {
      ingredientId: await ingredientId(cookie, 'parmesan'),
    });

    const ro = await getList(cookie, 'ro');
    expect(ro.groups.map((g) => g.aisle?.name ?? null)).toEqual([
      'Legume și fructe',
      'Lactate și ouă',
      null,
    ]);
    expect(ro.groups[1].items.map((i) => i.name).sort()).toEqual(
      ['Lapte', 'Parmezan'].sort(),
    );
    const orders = list.groups.flatMap((g) =>
      g.aisle ? [g.aisle.sortOrder] : [],
    );
    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(list.summary).toEqual({ remaining: 4, checked: 0 });
  });

  it('checks, unchecks, and removes items, updating the summary', async () => {
    const { cookie } = await signUp('Check');
    const added = await add(cookie, {
      ingredientId: await ingredientId(cookie, 'milk'),
    });
    await add(cookie, { name: 'Cake' });
    const id = items(added)[0].id;

    const checked = (
      await call('patch', cookie, `/items/${id}`)
        .send({ checked: true })
        .expect(200)
    ).body as List;
    expect(checked.summary).toEqual({ remaining: 1, checked: 1 });
    expect(items(checked).find((i) => i.id === id)?.checked).toBe(true);

    const unchecked = (
      await call('patch', cookie, `/items/${id}`)
        .send({ checked: false })
        .expect(200)
    ).body as List;
    expect(unchecked.summary).toEqual({ remaining: 2, checked: 0 });

    const removed = (await call('delete', cookie, `/items/${id}`).expect(200))
      .body as List;
    expect(items(removed).map((i) => i.name)).toEqual(['Cake']);
  });

  describe('Family scoping', () => {
    it('shares one list between Members of a Family and isolates other Families', async () => {
      const ana = await signUp('Ana');
      const mihai = await signUp('Mihai');
      const stranger = await signUp('Stranger');
      const [anaRow] = await database
        .select()
        .from(user)
        .where(eq(user.id, ana.userId));
      // Move Mihai into Ana's Family (his own Household of One stays behind).
      await database
        .update(user)
        .set({ familyId: anaRow.familyId, familyRole: 'member' })
        .where(eq(user.id, mihai.userId));

      const milk = await ingredientId(ana.cookie, 'milk');
      const added = await add(ana.cookie, {
        ingredientId: milk,
        quantity: 1,
        unit: 'l',
      });

      const seenByMihai = await getList(mihai.cookie);
      expect(seenByMihai.id).toBe(added.id);
      expect(items(seenByMihai)).toHaveLength(1);

      // Another Member can check and remove it.
      const itemId = items(added)[0].id;
      await call('patch', mihai.cookie, `/items/${itemId}`)
        .send({ checked: true })
        .expect(200);
      expect(items(await getList(ana.cookie))[0].checked).toBe(true);

      // A different Family sees nothing and cannot touch the item.
      expect(items(await getList(stranger.cookie))).toEqual([]);
      await call('patch', stranger.cookie, `/items/${itemId}`)
        .send({ checked: false })
        .expect(404);
      await call('delete', stranger.cookie, `/items/${itemId}`).expect(404);

      await call('delete', mihai.cookie, `/items/${itemId}`).expect(200);
      expect(items(await getList(ana.cookie))).toEqual([]);
    });

    it('requires a signed-in Member', async () => {
      await request(app.getHttpServer())
        .get('/api/shopping-list')
        .set('origin', TEST_ORIGIN)
        .expect(401);
    });
  });

  it('has a Source Recipe join table that stays empty', async () => {
    const rows = await database.select().from(shoppingItemSourceRecipes);
    expect(rows).toEqual([]);
  });
});
