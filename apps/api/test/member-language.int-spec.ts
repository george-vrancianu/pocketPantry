import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations, ingredients, user } from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

type Preferences = {
  locale: string | null;
  catalogLanguage: string | null;
  effectiveCatalogLanguage: string;
};
type Batch = {
  name: string;
  aisle: { name: string } | null;
};
type ShoppingList = {
  groups: Array<{
    aisle: { name: string } | null;
    items: Array<{ name: string; unmatched: boolean }>;
  }>;
};

describe('Member language: Catalog Language (integration)', () => {
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

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.11.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Language ${n}`,
        email: `language-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
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

  async function joinFamilyOf(owner: string, member: string) {
    const [{ familyId }] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.id, owner));
    await database
      .update(user)
      .set({ familyId, familyRole: 'member' })
      .where(eq(user.id, member));
  }

  const api = (
    method: 'get' | 'post' | 'put',
    cookie: string,
    path: string,
    locale = 'en',
  ) =>
    request(app.getHttpServer())
      [method](`/api${path}`)
      .query({ locale })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);

  const savePreferences = (cookie: string, body: object, locale?: string) =>
    api('put', cookie, '/settings/preferences', locale).send(body);

  const preferences = async (cookie: string, locale?: string) =>
    (await api('get', cookie, '/settings/preferences', locale).expect(200))
      .body as Preferences;

  const pantry = async (cookie: string, locale = 'en') =>
    (
      (await api('get', cookie, '/pantry', locale).expect(200)).body as {
        batches: Batch[];
      }
    ).batches;

  const shoppingList = async (cookie: string, locale = 'en') =>
    (await api('get', cookie, '/shopping-list', locale).expect(200))
      .body as ShoppingList;

  const stock = (cookie: string, body: object) =>
    api('post', cookie, '/pantry/batches').send(body).expect(201);

  const shop = (cookie: string, body: object) =>
    api('post', cookie, '/shopping-list/items').send(body).expect(200);

  const shoppingNames = (list: ShoppingList) =>
    list.groups.flatMap((group) => group.items.map((item) => item.name));

  describe('Member Preferences', () => {
    it('start with no Catalog Language, which follows the UI Language (English when none)', async () => {
      const { cookie } = await signUp();
      expect(await preferences(cookie)).toMatchObject({
        locale: null,
        catalogLanguage: null,
        effectiveCatalogLanguage: 'en',
      });
    });

    it('take the request locale as the UI Language when none is stored', async () => {
      const { cookie } = await signUp();
      expect(await preferences(cookie, 'ro')).toMatchObject({
        locale: null,
        catalogLanguage: null,
        effectiveCatalogLanguage: 'ro',
      });
      const saved = await savePreferences(cookie, { theme: 'dark' }, 'da');
      expect(saved.body).toMatchObject({ effectiveCatalogLanguage: 'da' });
    });

    it('follow the UI Language while the Catalog Language is empty', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { locale: 'ro' }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        locale: 'ro',
        catalogLanguage: null,
        effectiveCatalogLanguage: 'ro',
      });
    });

    it('save a Catalog Language apart from the UI Language, and clear it again with null', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { locale: 'en' }).expect(200);

      const saved = (
        await savePreferences(cookie, { catalogLanguage: 'ro' }).expect(200)
      ).body as Preferences;
      expect(saved).toMatchObject({
        locale: 'en',
        catalogLanguage: 'ro',
        effectiveCatalogLanguage: 'ro',
      });
      expect(await preferences(cookie)).toEqual(saved);

      await savePreferences(cookie, { catalogLanguage: null }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        locale: 'en',
        catalogLanguage: null,
        effectiveCatalogLanguage: 'en',
      });
    });

    it('keep the Catalog Language when only another preference is saved', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { catalogLanguage: 'da' }).expect(200);
      await savePreferences(cookie, { theme: 'dark' }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        catalogLanguage: 'da',
        theme: 'dark',
      });
    });

    it('reject a language that is not a catalog language', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { catalogLanguage: 'fr' }).expect(400);
      expect((await preferences(cookie)).catalogLanguage).toBeNull();
    });

    it('are private to the Member, not shared with the Family', async () => {
      const ana = await signUp();
      const mihai = await signUp();
      await joinFamilyOf(ana.userId, mihai.userId);
      await savePreferences(ana.cookie, { catalogLanguage: 'ro' }).expect(200);
      expect((await preferences(mihai.cookie)).catalogLanguage).toBeNull();
    });
  });

  describe('Pantry and Shopping List names', () => {
    it('show Romanian names to a Member with an English UI and a Romanian Catalog Language', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { locale: 'en', catalogLanguage: 'ro' });
      await stock(cookie, { ingredientId: seedId.ingredient('milk') });
      await shop(cookie, { ingredientId: seedId.ingredient('parmesan') });

      const [batch] = await pantry(cookie, 'en');
      expect(batch.name).toBe('Lapte');
      expect(batch.aisle?.name).toBe('Lactate și ouă');

      const list = await shoppingList(cookie, 'en');
      expect(shoppingNames(list)).toEqual(['Parmezan']);
      expect(list.groups[0].aisle?.name).toBe('Lactate și ouă');
    });

    it('show a mixed-language Family the same linked Shopping Item in each Member own Catalog Language', async () => {
      const ana = await signUp();
      const mihai = await signUp();
      await joinFamilyOf(ana.userId, mihai.userId);
      await savePreferences(ana.cookie, { catalogLanguage: 'da' });
      await savePreferences(mihai.cookie, { catalogLanguage: 'ro' });

      await shop(ana.cookie, { ingredientId: seedId.ingredient('milk') });
      await stock(mihai.cookie, { ingredientId: seedId.ingredient('milk') });

      expect(shoppingNames(await shoppingList(ana.cookie))).toEqual(['Mælk']);
      expect(shoppingNames(await shoppingList(mihai.cookie))).toEqual([
        'Lapte',
      ]);
      expect((await pantry(ana.cookie))[0].name).toBe('Mælk');
      expect((await pantry(mihai.cookie))[0].name).toBe('Lapte');
    });

    it('leave free-text Shopping Items and Unmatched Batch names as typed', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { catalogLanguage: 'ro' });
      await shop(cookie, { name: 'Mystery sauce' });
      await stock(cookie, { rawName: 'Mystery jam', location: 'spices' });

      const list = await shoppingList(cookie);
      expect(shoppingNames(list)).toEqual(['Mystery sauce']);
      expect(list.groups[0].items[0].unmatched).toBe(true);
      expect((await pantry(cookie)).map((b) => b.name)).toEqual([
        'Mystery jam',
      ]);
    });

    it('fall back from the Catalog Language to English, then to the canonical name', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { catalogLanguage: 'ro' });
      const leafCategoryId = seedId.leaf('hard-cheese');
      const english = {
        id: randomUUID(),
        canonical: `Canonical ${randomUUID()}`,
      };
      const bare = { id: randomUUID(), canonical: `Bare ${randomUUID()}` };
      await database.insert(ingredients).values(
        [english, bare].map(({ id, canonical }) => ({
          id,
          leafCategoryId,
          name: canonical,
          normalizedName: canonical.toLowerCase(),
          defaultUnit: 'g' as const,
        })),
      );
      const englishName = `English ${randomUUID()}`;
      await database.insert(catalogTranslations).values({
        id: randomUUID(),
        entityType: 'ingredient',
        entityId: english.id,
        locale: 'en',
        kind: 'name',
        value: englishName,
        normalizedValue: englishName.toLowerCase(),
      });
      await shop(cookie, { ingredientId: english.id });
      await shop(cookie, { ingredientId: bare.id });

      expect(shoppingNames(await shoppingList(cookie)).sort()).toEqual(
        [englishName, bare.canonical].sort(),
      );
    });

    it('follow the UI Language while the Catalog Language is empty', async () => {
      const { cookie } = await signUp();
      await stock(cookie, { ingredientId: seedId.ingredient('milk') });
      await shop(cookie, { ingredientId: seedId.ingredient('milk') });

      await savePreferences(cookie, { locale: 'ro' });
      expect((await pantry(cookie, 'en'))[0].name).toBe('Lapte');
      expect(shoppingNames(await shoppingList(cookie, 'en'))).toEqual([
        'Lapte',
      ]);

      await savePreferences(cookie, { locale: 'da' });
      expect((await pantry(cookie, 'en'))[0].name).toBe('Mælk');
      expect(shoppingNames(await shoppingList(cookie, 'en'))).toEqual(['Mælk']);
    });

    it('use the request locale only when the Member has stored no UI Language', async () => {
      const { cookie } = await signUp();
      await stock(cookie, { ingredientId: seedId.ingredient('milk') });
      expect((await pantry(cookie, 'ro'))[0].name).toBe('Lapte');
    });
  });
});
