import { randomUUID } from 'node:crypto';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations, ingredients, user } from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Preferences = {
  locale: string | null;
  catalogLanguage: string | null;
  effectiveCatalogLanguage: string;
  scanLanguage: string | null;
  effectiveScanLanguage: string;
  spokenLanguage: string | null;
  effectiveSpokenLanguage: string;
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

    it('ignore the request locale: with nothing stored the Catalog Language is English', async () => {
      const { cookie } = await signUp();
      expect(await preferences(cookie, 'ro')).toMatchObject({
        locale: null,
        catalogLanguage: null,
        effectiveCatalogLanguage: 'en',
      });
      const saved = await savePreferences(cookie, { theme: 'dark' }, 'da');
      expect(saved.body).toMatchObject({ effectiveCatalogLanguage: 'en' });
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

  describe('Member Preferences: Scan Language', () => {
    it('start with no Scan Language, which follows the UI Language (English when none)', async () => {
      const { cookie } = await signUp();
      expect(await preferences(cookie)).toMatchObject({
        scanLanguage: null,
        effectiveScanLanguage: 'en',
      });
      expect(await preferences(cookie, 'ro')).toMatchObject({
        scanLanguage: null,
        effectiveScanLanguage: 'en',
      });
      await savePreferences(cookie, { locale: 'da' }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        scanLanguage: null,
        effectiveScanLanguage: 'da',
      });
    });

    it('save a Scan Language apart from the UI and Catalog Languages, and clear it again with null', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { locale: 'en' }).expect(200);
      const saved = (
        await savePreferences(cookie, { scanLanguage: 'ro' }).expect(200)
      ).body as Preferences;
      expect(saved).toMatchObject({
        locale: 'en',
        catalogLanguage: null,
        effectiveCatalogLanguage: 'en',
        scanLanguage: 'ro',
        effectiveScanLanguage: 'ro',
      });
      expect(await preferences(cookie)).toEqual(saved);

      await savePreferences(cookie, { scanLanguage: null }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        scanLanguage: null,
        effectiveScanLanguage: 'en',
      });
    });

    it('keep the Scan Language when only another preference is saved', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { scanLanguage: 'da' }).expect(200);
      await savePreferences(cookie, { theme: 'dark', catalogLanguage: 'ro' });
      expect(await preferences(cookie)).toMatchObject({
        scanLanguage: 'da',
        effectiveScanLanguage: 'da',
        theme: 'dark',
      });
    });

    it('reject a language that is not a Scan Language', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { scanLanguage: 'fr' }).expect(400);
      expect((await preferences(cookie)).scanLanguage).toBeNull();
    });

    it('are private to the Member, not shared with the Family', async () => {
      const ana = await signUp();
      const mihai = await signUp();
      await joinFamilyOf(ana.userId, mihai.userId);
      await savePreferences(ana.cookie, { scanLanguage: 'ro' }).expect(200);
      expect((await preferences(mihai.cookie)).scanLanguage).toBeNull();
    });
  });

  describe('Member Preferences: Spoken Language', () => {
    it('start with no Spoken Language, which follows the UI Language (English when none)', async () => {
      const { cookie } = await signUp();
      expect(await preferences(cookie)).toMatchObject({
        spokenLanguage: null,
        effectiveSpokenLanguage: 'en',
      });
      expect(await preferences(cookie, 'ro')).toMatchObject({
        spokenLanguage: null,
        effectiveSpokenLanguage: 'en',
      });
      await savePreferences(cookie, { locale: 'da' }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        spokenLanguage: null,
        effectiveSpokenLanguage: 'da',
      });
    });

    it('save a Spoken Language apart from the Scan Language, and clear it again with null', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, {
        locale: 'en',
        scanLanguage: 'da',
      }).expect(200);
      const saved = (
        await savePreferences(cookie, { spokenLanguage: 'ro' }).expect(200)
      ).body as Preferences;
      expect(saved).toMatchObject({
        scanLanguage: 'da',
        effectiveScanLanguage: 'da',
        spokenLanguage: 'ro',
        effectiveSpokenLanguage: 'ro',
      });
      expect(await preferences(cookie)).toEqual(saved);

      await savePreferences(cookie, { spokenLanguage: null }).expect(200);
      expect(await preferences(cookie)).toMatchObject({
        scanLanguage: 'da',
        spokenLanguage: null,
        effectiveSpokenLanguage: 'en',
      });
    });

    it('keep the Spoken Language when only another preference is saved, and the Scan Language when it is saved', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { spokenLanguage: 'da' }).expect(200);
      await savePreferences(cookie, { theme: 'dark', scanLanguage: 'ro' });
      expect(await preferences(cookie)).toMatchObject({
        spokenLanguage: 'da',
        effectiveSpokenLanguage: 'da',
        scanLanguage: 'ro',
        theme: 'dark',
      });
    });

    it('reject a language that is not a Scan Language', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { spokenLanguage: 'fr' }).expect(400);
      expect((await preferences(cookie)).spokenLanguage).toBeNull();
    });

    it('are private to the Member, not shared with the Family', async () => {
      const ana = await signUp();
      const mihai = await signUp();
      await joinFamilyOf(ana.userId, mihai.userId);
      await savePreferences(ana.cookie, { spokenLanguage: 'ro' }).expect(200);
      expect((await preferences(mihai.cookie)).spokenLanguage).toBeNull();
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

    it('ignore the request locale: a Member with nothing stored gets English', async () => {
      const { cookie } = await signUp();
      await stock(cookie, { ingredientId: seedId.ingredient('milk') });
      expect((await pantry(cookie, 'da'))[0].name).toBe('Milk');
    });

    it('ignore the request locale: a Member with only a UI Language gets that one', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { locale: 'ro' }).expect(200);
      await stock(cookie, { ingredientId: seedId.ingredient('milk') });
      expect((await pantry(cookie, 'da'))[0].name).toBe('Lapte');
    });

    it('ignore the request locale: a Romanian Catalog Language beats ?locale=da', async () => {
      const { cookie } = await signUp();
      await savePreferences(cookie, { catalogLanguage: 'ro' }).expect(200);
      await stock(cookie, { ingredientId: seedId.ingredient('milk') });
      expect((await pantry(cookie, 'da'))[0].name).toBe('Lapte');
      const found = (
        await api('get', cookie, '/catalog/search', 'da')
          .query({ q: 'lapte' })
          .expect(200)
      ).body as { results: Array<{ name: string }> };
      expect(found.results.map((row) => row.name)).toContain('Lapte');
    });
  });

  describe('Admin routes keep the explicit locale', () => {
    it('honours the locale an Admin names, whatever the Admin has stored for their own screens', async () => {
      const admin = await signUp();
      const [{ email }] = await database
        .select({ email: user.email })
        .from(user)
        .where(eq(user.id, admin.userId));
      await promoteToAdmin(database, email);
      await savePreferences(admin.cookie, {
        locale: 'en',
        catalogLanguage: 'ro',
      }).expect(200);
      const adminApi = (method: 'get' | 'post', path: string) =>
        request(app.getHttpServer())
          [method](`/api/admin/catalog${path}`)
          .set('origin', TEST_ORIGIN)
          .set('cookie', admin.cookie);
      const stamp = Date.now();
      const created = await adminApi('post', '/ingredients')
        .send({
          leafCategoryId: seedId.leaf('hard-cheese'),
          name: `Preview ${stamp}`,
          defaultUnit: 'g',
        })
        .expect(201);
      const id = (created.body as { id: string }).id;
      await adminApi('post', '/translations')
        .send({
          entityType: 'ingredient',
          entityId: id,
          locale: 'da',
          kind: 'name',
          value: `Forhåndsvisning ${stamp}`,
        })
        .expect(201);
      await adminApi('post', '/translations')
        .send({
          entityType: 'ingredient',
          entityId: id,
          locale: 'ro',
          kind: 'name',
          value: `Previzualizare ${stamp}`,
        })
        .expect(201);
      // The same Admin, reading as a Member, gets their stored Catalog Language (Romanian), not Danish.
      const found = (
        await request(app.getHttpServer())
          .get('/api/catalog/search')
          .set('origin', TEST_ORIGIN)
          .set('cookie', admin.cookie)
          .query({ q: `Previzualizare ${stamp}` })
          .expect(200)
      ).body as { results: Array<{ id: string; name: string }> };
      expect(found.results.find((row) => row.id === id)?.name).toBe(
        `Previzualizare ${stamp}`,
      );
      const overview = (await adminApi('get', '').expect(200)).body as {
        ingredients: Array<{
          id: string;
          translations: Array<{ locale: string; value: string }>;
        }>;
      };
      expect(
        overview.ingredients
          .find((row) => row.id === id)
          ?.translations.map((t) => [t.locale, t.value]),
      ).toContainEqual(['da', `Forhåndsvisning ${stamp}`]);
    });
  });
});
