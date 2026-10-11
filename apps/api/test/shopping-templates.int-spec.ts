import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  ingredients,
  shoppingTemplates,
  user,
} from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Line = {
  id: string;
  ingredientId: string | null;
  name: string;
  quantity: number | null;
  unit: string | null;
  unmatched: boolean;
  inPantry: boolean;
  aisle: { id: string; name: string; sortOrder: number } | null;
};
type Template = { id: string; name: string; lines: Line[] };
type Summary = { id: string; name: string; lineCount: number };
type Body = { code?: string; params?: unknown };

describe('Shopping Templates (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const stamp = Date.now();
  let counter = 0;

  const parmesan = seedId.ingredient('parmesan');
  const milk = seedId.ingredient('milk');

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
  });

  afterAll(async () => {
    await app.close();
  });

  async function signUp(email = `tpl-${stamp}-${++counter}@example.com`) {
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set(
        'x-forwarded-for',
        `10.9.${Math.floor(++counter / 250)}.${counter % 250}`,
      )
      .send({ name: 'Tester', email, password: 'correct-horse-staple' })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((value) => value.split(';')[0])
      .join('; ');
  }

  const as = (cookie: string) => {
    const base = (method: 'get' | 'post' | 'patch' | 'delete', path: string) =>
      request(app.getHttpServer())
        [method](`/api${path}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie);
    return {
      get: (path: string) => base('get', path),
      post: (path: string, body: object = {}) => base('post', path).send(body),
      patch: (path: string, body: object = {}) =>
        base('patch', path).send(body),
      del: (path: string) => base('delete', path),
    };
  };

  /** Moves `joiner` into the Family of `owner`. */
  async function join(joiner: string, owner: string) {
    const { inviteCode } = (await as(owner).get('/family').expect(200))
      .body as { inviteCode: string };
    await as(joiner).post('/family/join', { code: inviteCode }).expect(201);
  }

  const create = async (
    cookie: string,
    name: string,
    lines: object[] = [],
  ): Promise<Template> =>
    (
      await as(cookie)
        .post('/shopping-templates?locale=en', { name, lines })
        .expect(201)
    ).body as Template;

  const read = async (cookie: string, id: string): Promise<Template> =>
    (await as(cookie).get(`/shopping-templates/${id}?locale=en`).expect(200))
      .body as Template;

  const lineNames = (template: Template) => template.lines.map((l) => l.name);

  describe('CRUD', () => {
    it('creates, lists, reads, renames, edits lines and deletes; every Family Member sees them', async () => {
      const ana = await signUp();
      const bob = await signUp();
      await join(bob, ana);

      const made = await create(ana, 'Weekly basics', [
        { ingredientId: parmesan, quantity: 200, unit: 'g' },
        { name: `Zzq mystery ${stamp}`, quantity: 2 },
      ]);
      expect(made.name).toBe('Weekly basics');
      expect(made.lines).toMatchObject([
        { name: 'Parmesan', quantity: 200, unit: 'g', unmatched: false },
        {
          name: `Zzq mystery ${stamp}`,
          quantity: 2,
          unit: null,
          unmatched: true,
          aisle: null,
        },
      ]);
      expect(made.lines[0].aisle?.name).toBeTruthy();

      const listed = (
        await as(bob).get('/shopping-templates?locale=en').expect(200)
      ).body as { templates: Summary[] };
      expect(listed.templates).toEqual([
        { id: made.id, name: 'Weekly basics', lineCount: 2 },
      ]);

      const edited = (
        await as(bob)
          .patch(`/shopping-templates/${made.id}?locale=en`, {
            name: 'Taco night',
            lines: [{ ingredientId: parmesan }],
          })
          .expect(200)
      ).body as Template;
      expect(edited.name).toBe('Taco night');
      expect(lineNames(edited)).toEqual(['Parmesan']);
      expect(await read(ana, made.id)).toEqual(edited);

      await as(bob).del(`/shopping-templates/${made.id}`).expect(204);
      const missing = await as(ana)
        .get(`/shopping-templates/${made.id}?locale=en`)
        .expect(404);
      expect(missing.body).toEqual({
        code: 'shopping.template_not_found',
        params: {},
      });
    });

    it("does not show another Family's Templates", async () => {
      const ana = await signUp();
      const eve = await signUp();
      const made = await create(ana, 'Private');
      await as(eve).get(`/shopping-templates/${made.id}?locale=en`).expect(404);
      await as(eve).del(`/shopping-templates/${made.id}`).expect(404);
      await as(eve)
        .patch(`/shopping-templates/${made.id}?locale=en`, { name: 'x' })
        .expect(404);
      const listed = (
        await as(eve).get('/shopping-templates?locale=en').expect(200)
      ).body as { templates: Summary[] };
      expect(listed.templates).toEqual([]);
    });

    it('rejects an unknown Ingredient, a blank name and an empty patch', async () => {
      const ana = await signUp();
      const unknown = await as(ana)
        .post('/shopping-templates?locale=en', {
          name: 'Bad',
          lines: [{ ingredientId: '00000000-0000-4000-8000-000000000000' }],
        })
        .expect(404);
      expect(unknown.body).toEqual({
        code: 'shopping.ingredient_not_found',
        params: {},
      });
      await as(ana)
        .post('/shopping-templates?locale=en', { name: '  ' })
        .expect(400);
      const made = await create(ana, 'Fine');
      await as(ana)
        .patch(`/shopping-templates/${made.id}?locale=en`, {})
        .expect(400);
    });
  });

  describe('limits', () => {
    it('allows 100 lines and refuses the 101st with a coded error', async () => {
      const ana = await signUp();
      const lines = (n: number) =>
        Array.from({ length: n }, (_, i) => ({
          name: `Zzq line ${i} ${stamp}`,
        }));
      const made = await create(ana, 'Big', lines(100));
      expect(made.lines).toHaveLength(100);

      const over = await as(ana)
        .post('/shopping-templates?locale=en', {
          name: 'Over',
          lines: lines(101),
        })
        .expect(400);
      expect(over.body).toEqual({
        code: 'shopping.template_too_many_lines',
        params: { max: 100 },
      });
      const overPatch = await as(ana)
        .patch(`/shopping-templates/${made.id}?locale=en`, {
          lines: lines(101),
        })
        .expect(400);
      expect((overPatch.body as Body).code).toBe(
        'shopping.template_too_many_lines',
      );
    });

    it('allows 50 Templates per Family and refuses the 51st', async () => {
      const email = `tpl-limit-${stamp}@example.com`;
      const ana = await signUp(email);
      const [{ familyId }] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, email));
      await database
        .insert(shoppingTemplates)
        .values(
          Array.from({ length: 49 }, (_, i) => ({ familyId, name: `T${i}` })),
        );
      // The 50th goes through the API so the success path stays covered.
      await create(ana, 'T49');

      const over = await as(ana)
        .post('/shopping-templates?locale=en', { name: 'T50' })
        .expect(409);
      expect(over.body).toEqual({
        code: 'shopping.template_limit_reached',
        params: { max: 50 },
      });
      const fromList = await as(ana)
        .post('/shopping-templates/from-list?locale=en', { name: 'T50' })
        .expect(409);
      expect((fromList.body as Body).code).toBe(
        'shopping.template_limit_reached',
      );
    });
  });

  describe('save current list as template', () => {
    it("copies the active list's items, checked or not, without their checked state", async () => {
      const ana = await signUp();
      const first = (
        await as(ana)
          .post('/shopping-list/items?locale=en', {
            ingredientId: parmesan,
            quantity: 200,
            unit: 'g',
          })
          .expect(200)
      ).body as { groups: Array<{ items: Array<{ id: string }> }> };
      await as(ana)
        .post('/shopping-list/items?locale=en', {
          name: `Zzq thing ${stamp}`,
          quantity: 3,
          unit: 'pcs',
        })
        .expect(200);
      await as(ana)
        .patch(
          `/shopping-list/items/${first.groups[0].items[0].id}?locale=en`,
          {
            checked: true,
          },
        )
        .expect(200);

      const made = (
        await as(ana)
          .post('/shopping-templates/from-list?locale=en', {
            name: 'From list',
          })
          .expect(201)
      ).body as Template;
      expect(made.name).toBe('From list');
      expect(made.lines).toHaveLength(2);
      expect(made.lines).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Parmesan',
            quantity: 200,
            unit: 'g',
          }),
          expect.objectContaining({
            name: `Zzq thing ${stamp}`,
            quantity: 3,
            unit: 'pcs',
            unmatched: true,
          }),
        ]),
      );
      const list = (await as(ana).get('/shopping-list?locale=en').expect(200))
        .body as { summary: { checked: number; remaining: number } };
      expect(list.summary).toEqual({ checked: 1, remaining: 1 });
    });

    it('refuses a list with more than 100 items', async () => {
      const ana = await signUp();
      for (let batch = 0; batch < 2; batch++) {
        await as(ana)
          .post('/shopping-list/items/bulk?locale=en', {
            items: Array.from({ length: 51 }, (_, i) => ({
              name: `Zzq bulk ${batch}-${i} ${stamp}`,
            })),
          })
          .expect(200);
      }
      const response = await as(ana)
        .post('/shopping-templates/from-list?locale=en', { name: 'Too big' })
        .expect(400);
      expect((response.body as Body).code).toBe(
        'shopping.template_too_many_lines',
      );
    });
  });

  describe('Pantry presence', () => {
    it('flags lines whose Ingredient has an unexpired Batch', async () => {
      const ana = await signUp();
      const made = await create(ana, 'Check', [
        { ingredientId: parmesan },
        { ingredientId: milk },
        { name: `Zzq nothing ${stamp}` },
      ]);
      const flags = (template: Template) =>
        Object.fromEntries(template.lines.map((l) => [l.name, l.inPantry]));
      expect(Object.values(flags(made))).toEqual([false, false, false]);

      const batch = (ingredientId: string, expiryDate: string) =>
        as(ana)
          .post('/pantry/batches?locale=en', {
            ingredientId,
            quantity: 1,
            unit: 'pcs',
            location: 'fridge',
            expiryDate,
          })
          .expect(201);
      await batch(parmesan, '2099-01-01');
      await batch(milk, '2000-01-01');

      expect(flags(await read(ana, made.id))).toEqual({
        Parmesan: true,
        Milk: false,
        [`Zzq nothing ${stamp}`]: false,
      });
    });

    it('counts a Batch with no expiry date or expiring today as present', async () => {
      const email = `tpl-presence-${stamp}@example.com`;
      const ana = await signUp(email);
      const [{ familyId }] = await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, email));
      const made = await create(ana, 'Edges', [
        { ingredientId: parmesan },
        { ingredientId: milk },
      ]);
      const leafOf = async (ingredientId: string) =>
        (
          await database
            .select({ leaf: ingredients.leafCategoryId })
            .from(ingredients)
            .where(eq(ingredients.id, ingredientId))
        )[0].leaf;
      const today = new Date().toISOString().slice(0, 10);
      await database.insert(batches).values([
        {
          familyId,
          ingredientId: parmesan,
          leafCategoryId: await leafOf(parmesan),
          location: 'fridge',
          expiryDate: null,
        },
        {
          familyId,
          ingredientId: milk,
          leafCategoryId: await leafOf(milk),
          location: 'fridge',
          expiryDate: today,
        },
      ]);

      const flags = (template: Template) =>
        Object.fromEntries(template.lines.map((l) => [l.name, l.inPantry]));
      expect(flags(await read(ana, made.id))).toEqual({
        Parmesan: true,
        Milk: true,
      });
      // The Member's own date decides: tomorrow, today's milk has expired.
      const tomorrow = new Date(Date.now() + 86_400_000)
        .toISOString()
        .slice(0, 10);
      const later = (
        await as(ana)
          .get(`/shopping-templates/${made.id}?locale=en&today=${tomorrow}`)
          .expect(200)
      ).body as Template;
      expect(flags(later)).toEqual({ Parmesan: true, Milk: false });
    });
  });

  describe('Catalog curation', () => {
    it('relinks Unmatched Template lines when an Admin resolves the name', async () => {
      const email = `tpl-admin-${stamp}@example.com`;
      const admin = await signUp(email);
      await promoteToAdmin(database, email);
      const ana = await signUp();
      const raw = `Zzq relink ${stamp}`;
      const made = await create(ana, 'Relink', [
        { name: raw, quantity: 2, unit: 'pcs' },
      ]);
      // The name reaches the Admin queue through a Shopping Item.
      await as(ana)
        .post('/shopping-list/items?locale=en', { name: raw })
        .expect(200);

      const resolved = await as(admin)
        .post('/admin/unmatched/resolve', {
          normalizedName: raw.toLowerCase(),
          ingredientId: parmesan,
        })
        .expect(201);
      expect(resolved.body).toMatchObject({ relinkedTemplateLines: 1 });

      expect((await read(ana, made.id)).lines).toMatchObject([
        {
          ingredientId: parmesan,
          name: 'Parmesan',
          quantity: 2,
          unit: 'pcs',
          unmatched: false,
        },
      ]);
    });

    it('keeps an Ingredient used by a Template from being deleted', async () => {
      const email = `tpl-admin-${stamp}-b@example.com`;
      const admin = await signUp(email);
      await promoteToAdmin(database, email);
      const ana = await signUp();
      const created = (
        await as(admin)
          .post('/admin/catalog/ingredients', {
            leafCategoryId: seedId.leaf('hard-cheese'),
            name: `Zzq guarded ${stamp}`,
            defaultUnit: 'pcs',
          })
          .expect(201)
      ).body as { id: string };
      const template = await create(ana, 'Guard', [
        { ingredientId: created.id },
      ]);

      const refused = await as(admin)
        .del(`/admin/catalog/ingredients/${created.id}`)
        .expect(409);
      expect(refused.body).toEqual({
        code: 'catalog.ingredient_in_use',
        params: {},
      });
      await as(ana).del(`/shopping-templates/${template.id}`).expect(204);
      await as(admin)
        .del(`/admin/catalog/ingredients/${created.id}`)
        .expect(204);
    });
  });

  it('is deleted with the Family when its last Member joins another Family', async () => {
    const ana = await signUp();
    const bob = await signUp();
    const made = await create(ana, 'Gone');

    await join(ana, bob);

    const rows = await database
      .select({ id: shoppingTemplates.id })
      .from(shoppingTemplates)
      .where(eq(shoppingTemplates.id, made.id));
    expect(rows).toEqual([]);
  });
});
