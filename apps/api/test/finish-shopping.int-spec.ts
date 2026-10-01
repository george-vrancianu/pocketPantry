import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, sql } from 'drizzle-orm';
import request from 'supertest';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  shoppingItems,
  shoppingLists,
  user,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Item = { id: string; name: string; checked: boolean };
type List = {
  id: string;
  groups: Array<{ items: Item[] }>;
};
type Proposal = {
  listId: string;
  lines: Array<{
    itemId: string;
    name: string;
    unmatched: boolean;
    quantity: number | null;
    unit: string | null;
    location: string;
    expiryDate: string | null;
  }>;
};

const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

describe('Finish Shopping (integration)', () => {
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
      .set('x-forwarded-for', `10.11.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Finish ${n}`,
        email: `finish-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    const userId = (response.body as { user: { id: string } }).user.id;
    const [self] = await database
      .select()
      .from(user)
      .where(eq(user.id, userId));
    return { cookie, familyId: self.familyId };
  }

  const api = (
    method: 'get' | 'post' | 'patch',
    cookie: string,
    path: string,
  ) =>
    request(app.getHttpServer())
      [method](`/api/${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  async function ingredientId(cookie: string, q: string) {
    const response = await api('get', cookie, `catalog/search?q=${q}`).expect(
      200,
    );
    return (response.body as { results: Array<{ id: string }> }).results[0].id;
  }

  async function addItem(cookie: string, body: Record<string, unknown>) {
    const list = (
      await api('post', cookie, 'shopping-list/items').send(body).expect(200)
    ).body as List;
    return list;
  }

  const check = (cookie: string, id: string, checked = true) =>
    api('patch', cookie, `shopping-list/items/${id}`)
      .send({ checked })
      .expect(200);

  const itemIdByName = (list: List, name: string) =>
    list.groups.flatMap((g) => g.items).find((i) => i.name === name)
      ?.id as string;

  const proposal = async (cookie: string) =>
    (await api('get', cookie, 'shopping-list/finish').expect(200))
      .body as Proposal;

  const lineFor = (p: Proposal['lines'][number], extra = {}) => ({
    itemId: p.itemId,
    quantity: p.quantity,
    unit: p.unit,
    location: p.location,
    expiryDate: p.expiryDate,
    ...extra,
  });

  it('proposes a Batch per checked item with Default Expiry and Location', async () => {
    const { cookie } = await signUp();
    const parmesan = await ingredientId(cookie, 'parmesan');
    await addItem(cookie, { ingredientId: parmesan, quantity: 200, unit: 'g' });
    const list = await addItem(cookie, {
      name: 'Zorblax',
      quantity: 2,
      unit: 'pcs',
    });
    await addItem(cookie, { name: 'Left alone' });
    await check(cookie, itemIdByName(list, 'Parmesan'));
    await check(cookie, itemIdByName(list, 'Zorblax'));

    const result = await proposal(cookie);

    expect(result.lines.map((l) => l.name)).toEqual(['Parmesan', 'Zorblax']);
    const [cheese, unmatched] = result.lines;
    expect(cheese).toMatchObject({
      unmatched: false,
      quantity: 200,
      unit: 'g',
      location: 'fridge',
    });
    expect(cheese.expiryDate).not.toBeNull();
    expect(unmatched).toMatchObject({
      unmatched: true,
      quantity: 2,
      unit: 'pcs',
    });
  });

  it("counts Default Expiry from the Member's local date", async () => {
    const { cookie } = await signUp();
    const parmesan = await ingredientId(cookie, 'parmesan');
    const list = await addItem(cookie, { ingredientId: parmesan });
    await check(cookie, itemIdByName(list, 'Parmesan'));

    const now = await proposal(cookie);
    const earlier = (
      await api('get', cookie, 'shopping-list/finish?today=2030-01-01').expect(
        200,
      )
    ).body as Proposal;

    expect(earlier.lines[0].expiryDate).not.toBe(now.lines[0].expiryDate);
    const days = Math.round(
      (Date.parse(`${now.lines[0].expiryDate}T00:00:00Z`) -
        Date.parse(`${inDays(0)}T00:00:00Z`)) /
        86_400_000,
    );
    expect(Date.parse(`${earlier.lines[0].expiryDate}T00:00:00Z`)).toBe(
      Date.parse('2030-01-01T00:00:00Z') + days * 86_400_000,
    );
  });

  it('creates Batches, archives the list and carries unchecked items to a new one', async () => {
    const { cookie, familyId } = await signUp();
    const parmesan = await ingredientId(cookie, 'parmesan');
    const milk = await ingredientId(cookie, 'milk');
    await addItem(cookie, { ingredientId: parmesan, quantity: 200, unit: 'g' });
    const list = await addItem(cookie, {
      ingredientId: milk,
      quantity: 1,
      unit: 'l',
    });
    await addItem(cookie, { name: 'Dragon fruit' });
    const full = await addItem(cookie, { name: 'Left alone' });
    await check(cookie, itemIdByName(full, 'Parmesan'));
    await check(cookie, itemIdByName(list, 'Milk'));
    await check(cookie, itemIdByName(full, 'Dragon fruit'));

    const { lines, listId } = await proposal(cookie);
    const result = await api('post', cookie, 'shopping-list/finish')
      .send({
        lines: lines.map((l) =>
          l.name === 'Parmesan'
            ? lineFor(l, {
                quantity: 150,
                location: 'freezer',
                expiryDate: '2031-05-05',
                productDescription: 'Grana Padano',
              })
            : lineFor(l),
        ),
        droppedItemIds: [],
      })
      .expect(200);

    const body = result.body as { listId: string; batchCount: number };
    expect(body.batchCount).toBe(3);
    expect(body.listId).not.toBe(listId);

    const created = await database
      .select()
      .from(batches)
      .where(eq(batches.familyId, familyId));
    expect(created).toHaveLength(3);
    expect(
      created.find((b) => b.productDescription === 'Grana Padano'),
    ).toMatchObject({
      quantity: 150,
      unit: 'g',
      location: 'freezer',
      expiryDate: '2031-05-05',
      unmatched: false,
    });
    expect(created.find((b) => b.rawName === 'Dragon fruit')).toMatchObject({
      unmatched: true,
      ingredientId: null,
    });

    const lists = await database
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.familyId, familyId));
    expect(lists.find((l) => l.id === listId)?.status).toBe('archived');
    expect(lists.find((l) => l.id === body.listId)?.status).toBe('active');

    const fresh = (await api('get', cookie, 'shopping-list').expect(200))
      .body as List;
    expect(fresh.id).toBe(body.listId);
    expect(fresh.groups.flatMap((g) => g.items).map((i) => i.name)).toEqual([
      'Left alone',
    ]);
  });

  it('files an Unmatched item under the top-level Other Leaf, keeping its raw name', async () => {
    const { cookie, familyId } = await signUp();
    const list = await addItem(cookie, { name: 'Mystery jar' });
    await check(cookie, itemIdByName(list, 'Mystery jar'));

    const { lines } = await proposal(cookie);
    await api('post', cookie, 'shopping-list/finish')
      .send({ lines: lines.map((l) => lineFor(l)), droppedItemIds: [] })
      .expect(200);

    const [batch] = await database
      .select()
      .from(batches)
      .where(eq(batches.familyId, familyId));
    expect(batch).toMatchObject({
      unmatched: true,
      rawName: 'Mystery jar',
      ingredientId: null,
      leafCategoryId: seedId.leaf('other-other'),
    });
  });

  it('leaves a dropped line out of the Pantry and off the new list', async () => {
    const { cookie, familyId } = await signUp();
    const milk = await ingredientId(cookie, 'milk');
    await addItem(cookie, { ingredientId: milk });
    const list = await addItem(cookie, { name: 'Skip me' });
    await check(cookie, itemIdByName(list, 'Milk'));
    await check(cookie, itemIdByName(list, 'Skip me'));

    const { lines } = await proposal(cookie);
    const skipped = lines.find((l) => l.name === 'Skip me')!;
    await api('post', cookie, 'shopping-list/finish')
      .send({
        lines: lines.filter((l) => l !== skipped).map((l) => lineFor(l)),
        droppedItemIds: [skipped.itemId],
      })
      .expect(200);

    const created = await database
      .select()
      .from(batches)
      .where(eq(batches.familyId, familyId));
    expect(created).toHaveLength(1);
    const fresh = (await api('get', cookie, 'shopping-list').expect(200))
      .body as List;
    expect(fresh.groups).toEqual([]);
  });

  it('rolls everything back when the commit fails', async () => {
    const { cookie, familyId } = await signUp();
    const milk = await ingredientId(cookie, 'milk');
    const list = await addItem(cookie, { ingredientId: milk });
    await addItem(cookie, { name: 'Unchecked' });
    await check(cookie, itemIdByName(list, 'Milk'));
    const { lines, listId } = await proposal(cookie);

    // Fail the new-list insert, the last step, after the Batches are in and the old list is archived.
    const trigger = `finish_fail_${counter}`;
    await database.execute(
      sql.raw(`CREATE FUNCTION ${trigger}() RETURNS trigger AS $$
        BEGIN
          IF NEW.family_id = '${familyId}' THEN RAISE EXCEPTION 'boom'; END IF;
          RETURN NEW;
        END $$ LANGUAGE plpgsql`),
    );
    await database.execute(
      sql.raw(`CREATE TRIGGER ${trigger} BEFORE INSERT ON shopping_lists
        FOR EACH ROW EXECUTE FUNCTION ${trigger}()`),
    );
    try {
      await api('post', cookie, 'shopping-list/finish')
        .send({ lines: lines.map((l) => lineFor(l)), droppedItemIds: [] })
        .expect(500);
    } finally {
      await database.execute(
        sql.raw(`DROP TRIGGER ${trigger} ON shopping_lists`),
      );
      await database.execute(sql.raw(`DROP FUNCTION ${trigger}()`));
    }

    const created = await database
      .select()
      .from(batches)
      .where(eq(batches.familyId, familyId));
    expect(created).toHaveLength(0);
    const lists = await database
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.familyId, familyId));
    expect(lists).toHaveLength(1);
    expect(lists[0]).toMatchObject({ id: listId, status: 'active' });
    const items = await database
      .select()
      .from(shoppingItems)
      .where(eq(shoppingItems.listId, listId));
    expect(items).toHaveLength(2);
  });

  it('rejects a commit that no longer matches the checked items', async () => {
    const { cookie } = await signUp();
    const milk = await ingredientId(cookie, 'milk');
    const list = await addItem(cookie, { ingredientId: milk });
    const other = await addItem(cookie, { name: 'Late check' });
    await check(cookie, itemIdByName(list, 'Milk'));
    const { lines } = await proposal(cookie);
    await check(cookie, itemIdByName(other, 'Late check'));

    const response = await api('post', cookie, 'shopping-list/finish')
      .send({ lines: lines.map((l) => lineFor(l)), droppedItemIds: [] })
      .expect(409);

    expect((response.body as { code: string }).code).toBe(
      'shopping.list_changed',
    );
  });

  it("cannot finish another Family's items or finish twice", async () => {
    const mine = await signUp();
    const theirs = await signUp();
    const milk = await ingredientId(mine.cookie, 'milk');
    const list = await addItem(mine.cookie, { ingredientId: milk });
    await check(mine.cookie, itemIdByName(list, 'Milk'));
    const { lines } = await proposal(mine.cookie);
    const body = { lines: lines.map((l) => lineFor(l)), droppedItemIds: [] };

    await api('post', theirs.cookie, 'shopping-list/finish')
      .send(body)
      .expect(409);
    await api('post', mine.cookie, 'shopping-list/finish')
      .send(body)
      .expect(200);
    await api('post', mine.cookie, 'shopping-list/finish')
      .send(body)
      .expect(409);
  });
});
