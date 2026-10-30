import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike, isNull } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { ingredients, recipes } from '../src/database/schema';
import type {
  AdminRecipeDetail,
  FamilyRecipeEdit,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

jest.setTimeout(30_000);

type Matches = {
  matches: {
    id: string;
    title: string;
    score: number;
    familyCopyId: string | null;
  }[];
};

describe('Plate Scan matches (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  let ing: string[];
  const stamp = Date.now();

  const line = (i: number) => ({
    ingredientId: ing[i],
    quantity: 100,
    unit: 'g',
  });

  async function catalogBase(title: string, ingredientIdx: number[]) {
    const res = await admin.post('', {
      title,
      servings: 4,
      lines: ingredientIdx.map((i) => line(i)),
      steps: [{ text: 'Cook' }],
    });
    expect(res.status).toBe(201);
    return res.body as AdminRecipeDetail;
  }

  const closestBases = async (dishTitle: string, ingredientIds: string[]) =>
    (
      await member
        .post('/plate-matches', { locale: 'en', dishTitle, ingredientIds })
        .expect(200)
    ).body as Matches;

  async function romanianCatalogMember(label: string) {
    const cookie = await signUp(app, `${label}-${stamp}@example.com`, 'C');
    await client(app, cookie, '/api/settings')
      .put('/preferences', {
        locale: 'en',
        catalogLanguage: 'ro',
        scanLanguage: 'da',
      })
      .expect(200);
    return client(app, cookie, '/api/recipes');
  }

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const adminEmail = `plate-rec-admin-${stamp}@example.com`;
    const adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, adminCookie, '/api/admin/recipes');
    member = client(
      app,
      await signUp(app, `plate-rec-m-${stamp}@example.com`, 'M'),
      '/api/recipes',
    );
    ing = (
      await database
        .select({ id: ingredients.id })
        .from(ingredients)
        .where(isNull(ingredients.ownerFamilyId))
        .orderBy(ingredients.id)
        .limit(5)
    ).map((r) => r.id);
  });

  afterAll(async () => {
    const like = `%${stamp}%`;
    const all = await database
      .select({ id: recipes.id, parentId: recipes.parentId })
      .from(recipes)
      .where(ilike(recipes.title, like));
    for (const row of all.filter((r) => r.parentId)) {
      await database.delete(recipes).where(eq(recipes.id, row.id));
    }
    await database.delete(recipes).where(ilike(recipes.title, like));
    await app.close();
  });

  describe('matches', () => {
    it('ranks a Recipe sharing Ingredients above one that does not, and skips archived, Family and Variant Recipes', async () => {
      const word = `Qzx${stamp}`;
      const near = await catalogBase(`${word} near`, [0, 1]);
      const far = await catalogBase(`${word} far`, [3, 4]);
      const archived = await catalogBase(`${word} archived`, [0, 1]);
      await admin.post(`/${archived.id}/archive`).expect(200);
      const variant = (
        await admin.post(`/${near.id}/variants`, {
          title: `${word} variant`,
        })
      ).body as AdminRecipeDetail;
      const own = (
        await member
          .post('', {
            title: `${word} own`,
            servings: 2,
            locale: 'en',
            parentId: null,
            lines: [line(0), line(1)],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;

      const { matches } = await closestBases(word, [ing[0], ing[1]]);
      const ids = matches.map((m) => m.id);
      expect(ids).not.toContain(archived.id);
      expect(ids).not.toContain(variant.id);
      expect(ids).not.toContain(own.id);
      expect(ids).toContain(near.id);
      expect(ids.indexOf(near.id)).toBeLessThan(
        ids.includes(far.id) ? ids.indexOf(far.id) : Infinity,
      );
      expect(matches.find((m) => m.id === near.id)).toMatchObject({
        title: `${word} near`,
      });
      expect(matches.length).toBeLessThanOrEqual(5);
    });

    it('names the Family live copy of a match in familyCopyId, null without one', async () => {
      const word = `Fcp${stamp}`;
      const copied = await catalogBase(`${word} copied`, [0, 1]);
      const plain = await catalogBase(`${word} plain`, [0, 1]);
      const copyId = (
        (await member.post(`/${copied.id}/copy`).expect(200)).body as {
          id: string;
        }
      ).id;
      const { matches } = await closestBases(word, [ing[0], ing[1]]);
      const copyOf = (id: string) =>
        matches.find((m) => m.id === id)!.familyCopyId;
      expect(copyOf(copied.id)).toBe(copyId);
      expect(copyOf(plain.id)).toBeNull();
      await member.post(`/${copyId}/archive`).expect(200);
      const after = await closestBases(word, [ing[0], ing[1]]);
      expect(
        after.matches.find((m) => m.id === copied.id)!.familyCopyId,
      ).toBeNull();
    });

    it('shows the locale title and still ranks on the source title', async () => {
      const word = `Wvk${stamp}`;
      const base = await catalogBase(`${word} source`, [3]);
      await admin
        .put(`/${base.id}/translations/ro`, { title: `Tocana ${stamp}` })
        .expect(200);
      // A signed-in request's `?locale=` is ignored: the stored languages decide.
      const romanian = await romanianCatalogMember('plate-rec-ro1');
      const { matches } = await romanian
        .post('/plate-matches', {
          dishTitle: `${word} source`,
          ingredientIds: [],
        })
        .expect(200)
        .then((r) => r.body as Matches);
      expect(matches.find((s) => s.id === base.id)).toMatchObject({
        title: `Tocana ${stamp}`,
      });
    });

    it('is empty when nothing matches', async () => {
      expect(
        await closestBases(`nothingmatches${stamp}`, [crypto.randomUUID()]),
      ).toEqual({ matches: [], hiddenByAllergiesCount: 0 });
    });

    it('refuses a malformed body', async () => {
      await member
        .post('/plate-matches', { locale: 'en', dishTitle: 'x' })
        .expect(400);
    });
  });

  describe('with a Catalog Language Preference', () => {
    it('matches Plate Scan dishes with the Catalog Language titles', async () => {
      const romanian = await romanianCatalogMember('plate-rec-cm');
      const base = await catalogBase(`Plate ro base ${stamp}`, [0, 1]);
      await admin
        .put(`/${base.id}/translations/ro`, { title: `Placinta ${stamp}` })
        .expect(200);
      const { matches } = (
        await romanian
          .post('/plate-matches', {
            locale: 'en',
            dishTitle: `Placinta ${stamp}`,
            ingredientIds: [ing[0], ing[1]],
          })
          .expect(200)
      ).body as Matches;
      expect(matches.find((m) => m.id === base.id)?.title).toBe(
        `Placinta ${stamp}`,
      );
    });
  });
});
