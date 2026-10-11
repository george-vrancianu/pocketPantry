import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, ilike } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { ingredients, recipes, unmatchedEntries } from '../src/database/schema';
import type {
  AdminRecipeDetail,
  FamilyRecipeEdit,
} from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

const code = (res: { body: unknown }) => (res.body as { code: string }).code;

jest.setTimeout(30_000);

type Suggestions = {
  suggestions: { id: string; title: string; score: number }[];
};

describe('Plate Scan as a Family Recipe (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let admin: ReturnType<typeof client>;
  let member: ReturnType<typeof client>;
  let ing: string[];
  const stamp = Date.now();

  const line = (i: number, quantity = 100) => ({
    ingredientId: ing[i],
    quantity,
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

  const suggest = async (dishTitle: string, ingredientIds: string[]) =>
    (
      await member
        .post('/plate-suggestions', { locale: 'en', dishTitle, ingredientIds })
        .expect(201)
    ).body as Suggestions;

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
      await database.select({ id: ingredients.id }).from(ingredients).limit(5)
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

  describe('suggestions', () => {
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

      const { suggestions } = await suggest(word, [ing[0], ing[1]]);
      const ids = suggestions.map((s) => s.id);
      expect(ids).not.toContain(archived.id);
      expect(ids).not.toContain(variant.id);
      expect(ids).not.toContain(own.id);
      expect(ids).toContain(near.id);
      expect(ids.indexOf(near.id)).toBeLessThan(
        ids.includes(far.id) ? ids.indexOf(far.id) : Infinity,
      );
      expect(suggestions.find((s) => s.id === near.id)).toMatchObject({
        title: `${word} near`,
      });
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('is empty when nothing matches', async () => {
      expect(
        await suggest(`nothingmatches${stamp}`, [crypto.randomUUID()]),
      ).toEqual({ suggestions: [] });
    });

    it('refuses a malformed body', async () => {
      await member
        .post('/plate-suggestions', { locale: 'en', dishTitle: 'x' })
        .expect(400);
    });
  });

  describe('save', () => {
    it('saves a Variant under a chosen Catalog base with servings 1 and queues an Unmatched name', async () => {
      const base = await catalogBase(`Plate base ${stamp}`, [0, 1]);
      const raw = `Zq plate herb ${stamp}`;
      const res = await member
        .post('/from-plate', {
          locale: 'ro',
          title: `Plate variant ${stamp}`,
          parentId: base.id,
          lines: [line(0, 150), { rawName: raw, quantity: 1, unit: 'pcs' }],
        })
        .expect(201);
      const saved = res.body as FamilyRecipeEdit;
      expect(saved).toMatchObject({
        parentId: base.id,
        servings: 1,
        title: `Plate variant ${stamp}`,
        steps: [],
      });
      expect(saved.lines).toHaveLength(2);
      const queued = await database
        .select()
        .from(unmatchedEntries)
        .where(eq(unmatchedEntries.ingredientLineId, saved.lines[1].id));
      expect(queued).toHaveLength(1);
      expect(queued[0]).toMatchObject({
        source: 'recipe',
        rawName: raw,
        locale: 'ro',
      });
    });

    it('saves a standalone Recipe with no parent and servings 1', async () => {
      const saved = (
        await member
          .post('/from-plate', {
            locale: 'en',
            title: `Plate solo ${stamp}`,
            parentId: null,
            lines: [line(2)],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;
      expect(saved).toMatchObject({ parentId: null, servings: 1 });
      expect(saved.lines).toHaveLength(1);
    });

    it('refuses a variant draft of a standalone Family Recipe', async () => {
      const solo = (
        await member
          .post('/from-plate', {
            locale: 'en',
            title: `Plate solo draft ${stamp}`,
            parentId: null,
            lines: [line(2)],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;
      const res = await member
        .get(`/${solo.id}/variant-draft?locale=en`)
        .expect(404);
      expect(code(res)).toBe('recipes.parent_not_found');
    });

    it('refuses an unknown parent, a Variant parent and a malformed body', async () => {
      const base = await catalogBase(`Plate base2 ${stamp}`, [0]);
      const fv = (
        await member
          .post('/from-plate', {
            locale: 'en',
            title: `Plate fv ${stamp}`,
            parentId: base.id,
            lines: [line(0)],
          })
          .expect(201)
      ).body as FamilyRecipeEdit;
      const body = (parentId: string) => ({
        locale: 'en',
        title: `Plate bad ${stamp}`,
        parentId,
        lines: [line(0)],
      });
      expect(
        code(
          await member
            .post('/from-plate', body(crypto.randomUUID()))
            .expect(404),
        ),
      ).toBe('recipes.parent_not_found');
      expect(
        code(await member.post('/from-plate', body(fv.id)).expect(409)),
      ).toBe('recipes.variant_of_variant');
      await member
        .post('/from-plate', { locale: 'en', title: 'x', lines: [] })
        .expect(400);
    });
  });
});
