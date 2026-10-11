import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { normalizeName } from '../src/catalog/normalize';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  catalogTranslations,
  ingredients,
  staples,
  user,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Staple = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: { id: string; name: string; sortOrder: number } | null;
};
type Suggestion = {
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  aisle: { id: string; name: string; sortOrder: number } | null;
};
type Suggestions = { staples: Suggestion[] };
type List = {
  groups: Array<{ items: Array<{ id: string; ingredientId: string | null }> }>;
};

describe('Staples and Suggestions (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp(name = 'Staples') {
    const email = `staples-${Date.now()}-${++counter}@example.com`;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.2.${Math.floor(counter / 250)}.${counter % 250}`,
      )
      .send({ name, email, password: 'correct-horse-battery-staple' })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return {
      cookie,
      email,
      userId: (response.body as { user: { id: string } }).user.id,
    };
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

  const addStaple = (cookie: string, body: object) =>
    api('post', cookie, '/staples?locale=en').send(body);
  const listStaples = async (cookie: string) =>
    (await api('get', cookie, '/staples?locale=en').expect(200)).body as {
      staples: Staple[];
    };
  const suggestions = async (cookie: string, today?: string) =>
    (
      await api(
        'get',
        cookie,
        `/shopping-list/suggestions?locale=en${today ? `&today=${today}` : ''}`,
      ).expect(200)
    ).body as Suggestions;
  const addBatch = async (cookie: string, body: object) =>
    (
      await api('post', cookie, '/pantry/batches?locale=en')
        .send(body)
        .expect(201)
    ).body as { id: string };

  const milk = seedId.ingredient('milk');
  const parmesan = seedId.ingredient('parmesan');

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/api/staples').expect(401);
    await request(app.getHttpServer())
      .get('/api/shopping-list/suggestions')
      .expect(401);
  });

  describe('Staples', () => {
    it('adds, edits and removes a Staple with a preferred quantity and unit', async () => {
      const { cookie } = await signUp();

      const created = (
        await addStaple(cookie, {
          ingredientId: milk,
          quantity: 2,
          unit: 'l',
        }).expect(201)
      ).body as Staple;
      expect(created).toMatchObject({
        ingredientId: milk,
        name: 'Milk',
        quantity: 2,
        unit: 'l',
      });
      expect((await listStaples(cookie)).staples).toHaveLength(1);

      const edited = (
        await api('patch', cookie, `/staples/${created.id}?locale=en`)
          .send({ quantity: 1, unit: 'l' })
          .expect(200)
      ).body as Staple;
      expect(edited).toMatchObject({ quantity: 1, unit: 'l' });

      const cleared = (
        await api('patch', cookie, `/staples/${created.id}?locale=en`)
          .send({ quantity: null, unit: null })
          .expect(200)
      ).body as Staple;
      expect(cleared).toMatchObject({ quantity: null, unit: null });

      await api('delete', cookie, `/staples/${created.id}`).expect(204);
      expect((await listStaples(cookie)).staples).toEqual([]);
      await api('delete', cookie, `/staples/${created.id}`).expect(404);
    });

    it('refuses a duplicate, an unknown Ingredient and a quantity without a unit', async () => {
      const { cookie } = await signUp();
      await addStaple(cookie, { ingredientId: milk }).expect(201);

      const duplicate = await addStaple(cookie, { ingredientId: milk }).expect(
        409,
      );
      expect(duplicate.body).toMatchObject({
        code: 'shopping.staple_already_exists',
      });
      const unknown = await addStaple(cookie, {
        ingredientId: '00000000-0000-4000-8000-000000000000',
      }).expect(404);
      expect(unknown.body).toMatchObject({
        code: 'shopping.ingredient_not_found',
      });
      await addStaple(cookie, { ingredientId: parmesan, quantity: 2 }).expect(
        400,
      );
    });

    it("keeps one Family's Staples out of another's", async () => {
      const a = await signUp();
      const b = await signUp();
      await addStaple(a.cookie, { ingredientId: milk }).expect(201);
      expect((await listStaples(b.cookie)).staples).toEqual([]);
    });

    it('refuses the 201st Staple with a coded error', async () => {
      const { cookie, userId } = await signUp();
      const [self] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.id, userId));
      const all = await database
        .select({ id: ingredients.id })
        .from(ingredients)
        .limit(201);
      expect(all.length).toBe(201);
      await database
        .insert(staples)
        .values(
          all
            .slice(0, 199)
            .map(({ id }) => ({ familyId: self.familyId, ingredientId: id })),
        );

      await addStaple(cookie, { ingredientId: all[199].id }).expect(201);
      const refused = await addStaple(cookie, {
        ingredientId: all[200].id,
      }).expect(409);
      expect(refused.body).toMatchObject({
        code: 'shopping.staple_limit_reached',
        params: { max: 200 },
      });
    });

    it('keeps its Ingredient in use, so an Admin cannot delete it', async () => {
      const admin = await signUp('Admin');
      await promoteToAdmin(database, admin.email);
      const [leaf] = await database
        .select({ id: ingredients.leafCategoryId })
        .from(ingredients)
        .limit(1);
      const made = (
        await api('post', admin.cookie, '/admin/catalog/ingredients')
          .send({
            leafCategoryId: leaf.id,
            name: `Staple guard ${Date.now()}`,
            defaultUnit: 'pcs',
          })
          .expect(201)
      ).body as { id: string };
      const created = (
        await addStaple(admin.cookie, { ingredientId: made.id }).expect(201)
      ).body as Staple;

      const blocked = await api(
        'delete',
        admin.cookie,
        `/admin/catalog/ingredients/${made.id}`,
      ).expect(409);
      expect(blocked.body).toMatchObject({ code: 'catalog.ingredient_in_use' });

      await api('delete', admin.cookie, `/staples/${created.id}`).expect(204);
      await api(
        'delete',
        admin.cookie,
        `/admin/catalog/ingredients/${made.id}`,
      ).expect(204);
    });
  });

  describe('Suggestions', () => {
    it('suggests a Staple with no Batch, with its preferred quantity, in Aisle order', async () => {
      const { cookie } = await signUp();
      await addStaple(cookie, { ingredientId: parmesan }).expect(201);
      await addStaple(cookie, {
        ingredientId: milk,
        quantity: 2,
        unit: 'l',
      }).expect(201);

      const { staples: found } = await suggestions(cookie);

      expect(found.map((s) => s.ingredientId).sort()).toEqual(
        [milk, parmesan].sort(),
      );
      const orders = found.map((s) => s.aisle?.sortOrder ?? Infinity);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
      expect(found.find((s) => s.ingredientId === milk)).toMatchObject({
        name: 'Milk',
        quantity: 2,
        unit: 'l',
      });
    });

    it('treats an expired Batch as missing and an Expiring Soon one as present', async () => {
      const { cookie } = await signUp();
      await addStaple(cookie, { ingredientId: milk }).expect(201);
      await addStaple(cookie, { ingredientId: parmesan }).expect(201);
      await addBatch(cookie, {
        ingredientId: milk,
        expiryDate: '2026-01-01',
      });
      await addBatch(cookie, {
        ingredientId: parmesan,
        expiryDate: '2026-01-11',
      });

      const { staples: found } = await suggestions(cookie, '2026-01-10');

      expect(found.map((s) => s.ingredientId)).toEqual([milk]);
    });

    it('treats a Batch without an expiry as present, whatever its quantity', async () => {
      const { cookie } = await signUp();
      await addStaple(cookie, { ingredientId: milk }).expect(201);
      await addBatch(cookie, {
        ingredientId: milk,
        quantity: 1,
        unit: 'ml',
        expiryDate: null,
      });
      expect((await suggestions(cookie)).staples).toEqual([]);
    });

    it('adds through the normal add endpoint and hides while on the list, checked or not', async () => {
      const { cookie } = await signUp();
      await addStaple(cookie, {
        ingredientId: milk,
        quantity: 2,
        unit: 'l',
      }).expect(201);
      const [suggestion] = (await suggestions(cookie)).staples;

      const list = (
        await api('post', cookie, '/shopping-list/items?locale=en')
          .send({
            ingredientId: suggestion.ingredientId,
            quantity: suggestion.quantity,
            unit: suggestion.unit,
          })
          .expect(200)
      ).body as List;
      expect((await suggestions(cookie)).staples).toEqual([]);

      const itemId = list.groups[0].items[0].id;
      await api('patch', cookie, `/shopping-list/items/${itemId}?locale=en`)
        .send({ checked: true })
        .expect(200);
      expect((await suggestions(cookie)).staples).toEqual([]);

      await api(
        'delete',
        cookie,
        `/shopping-list/items/${itemId}?locale=en`,
      ).expect(200);
      expect((await suggestions(cookie)).staples).toHaveLength(1);
    });

    it('reports the Ingredient of each Shopping Item so the list can toggle Staples', async () => {
      const { cookie } = await signUp();
      const list = (
        await api('post', cookie, '/shopping-list/items?locale=en')
          .send({ ingredientId: milk })
          .expect(200)
      ).body as List;
      expect(list.groups[0].items[0].ingredientId).toBe(milk);
    });

    it('dismisses for every Member of the Family until a Batch is created, then again once it is removed', async () => {
      const owner = await signUp('Owner');
      const joiner = await signUp('Joiner');
      const family = (await api('get', owner.cookie, '/family').expect(200))
        .body as { inviteCode: string };
      await api('post', joiner.cookie, '/family/join')
        .send({ code: family.inviteCode })
        .expect(201);
      await addStaple(owner.cookie, { ingredientId: milk }).expect(201);
      expect((await suggestions(joiner.cookie)).staples).toHaveLength(1);

      await api(
        'post',
        owner.cookie,
        `/shopping-list/suggestions/${milk}/dismiss`,
      ).expect(204);
      expect((await suggestions(owner.cookie)).staples).toEqual([]);
      expect((await suggestions(joiner.cookie)).staples).toEqual([]);

      // Restocking clears the dismissal; running out again suggests it again.
      const batch = await addBatch(joiner.cookie, { ingredientId: milk });
      expect((await suggestions(owner.cookie)).staples).toEqual([]);
      await api('delete', owner.cookie, `/pantry/batches/${batch.id}`).expect(
        204,
      );
      expect((await suggestions(owner.cookie)).staples).toHaveLength(1);
    });

    it('shows the Suggestion again when an Admin relinks an Unmatched Batch to the Staple Ingredient', async () => {
      const admin = await signUp('Admin');
      await promoteToAdmin(database, admin.email);
      await addStaple(admin.cookie, { ingredientId: milk }).expect(201);
      await api(
        'post',
        admin.cookie,
        `/shopping-list/suggestions/${milk}/dismiss`,
      ).expect(204);
      expect((await suggestions(admin.cookie)).staples).toEqual([]);

      const rawName = `Zzq staple relink ${Date.now()}-${counter}`;
      const created = (
        await api('post', admin.cookie, '/pantry/batches?locale=en')
          .send({
            rawName,
            quantity: 1,
            unit: 'pcs',
            location: 'fridge',
          })
          .expect(201)
      ).body as { id: string };
      // An Unmatched Batch is not Milk: the dismissal still holds.
      expect((await suggestions(admin.cookie)).staples).toEqual([]);

      await api('post', admin.cookie, '/admin/unmatched/resolve')
        .send({
          normalizedName: normalizeName(rawName),
          ingredientId: milk,
        })
        .expect(201);
      await api('delete', admin.cookie, `/pantry/batches/${created.id}`).expect(
        204,
      );

      expect((await suggestions(admin.cookie)).staples).toHaveLength(1);
      await database
        .delete(catalogTranslations)
        .where(eq(catalogTranslations.value, rawName));
    });

    it('clears the dismissal when the Batch is created by Finish Shopping', async () => {
      const { cookie } = await signUp();
      await addStaple(cookie, { ingredientId: milk }).expect(201);
      await api(
        'post',
        cookie,
        `/shopping-list/suggestions/${milk}/dismiss`,
      ).expect(204);
      const list = (
        await api('post', cookie, '/shopping-list/items?locale=en')
          .send({ ingredientId: milk, quantity: 1, unit: 'l' })
          .expect(200)
      ).body as List;
      const itemId = list.groups[0].items[0].id;
      await api('patch', cookie, `/shopping-list/items/${itemId}?locale=en`)
        .send({ checked: true })
        .expect(200);
      const review = (
        await api('get', cookie, '/shopping-list/finish?locale=en').expect(200)
      ).body as { listId: string; lines: Array<{ itemId: string }> };
      await api('post', cookie, '/shopping-list/finish?locale=en')
        .send({
          listId: review.listId,
          lines: review.lines.map((line) => ({
            itemId: line.itemId,
            quantity: 1,
            unit: 'l',
            location: 'fridge',
            expiryDate: '2099-01-01',
            productDescription: '',
          })),
        })
        .expect(200);

      // Dismissal gone: once the Batch is deleted the Staple is suggested again.
      const pantry = (await api('get', cookie, '/pantry?locale=en').expect(200))
        .body as { batches: Array<{ id: string }> };
      await api(
        'delete',
        cookie,
        `/pantry/batches/${pantry.batches[0].id}`,
      ).expect(204);
      expect((await suggestions(cookie)).staples).toHaveLength(1);
    });
  });
});
