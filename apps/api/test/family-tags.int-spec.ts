import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, inArray } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes, tagGroups, tags, user } from '../src/database/schema';
import type { RecipeTag } from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';
import { storeLanguages } from './support/stored-language';

jest.setTimeout(30_000);

// Spec: #706 / #710. A Member makes a Family Tag from the Tag field: one name, one Tag.
describe('Family Tags (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let ana: ReturnType<typeof client>;
  let anaCookie: string;
  let bea: ReturnType<typeof client>;
  let admin: ReturnType<typeof client>;
  let anaFamily: string;
  const stamp = Date.now();
  const dinner = seedId.tag('meal:dinner');
  const made: string[] = [];

  const resolve = async (
    who: ReturnType<typeof client>,
    name: unknown,
    status = 200,
  ) => who.post('/tags', { name }).expect(status);
  const tag = async (who: ReturnType<typeof client>, name: string) => {
    const res = await resolve(who, name);
    const body = res.body as RecipeTag;
    if (body.kind === 'family') made.push(body.id);
    return body;
  };
  const code = (res: { body: unknown }) => (res.body as { code: string }).code;
  const familyTagRows = (familyId: string) =>
    database.select().from(tags).where(eq(tags.familyId, familyId));

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const anaEmail = `ftags-ana-${stamp}@example.com`;
    anaCookie = await signUp(app, anaEmail, 'Ana');
    ana = client(app, anaCookie, '/api/recipes');
    anaFamily = (
      await database
        .select({ id: user.familyId })
        .from(user)
        .where(eq(user.email, anaEmail))
    )[0].id;
    bea = client(
      app,
      await signUp(app, `ftags-bea-${stamp}@example.com`, 'Bea'),
      '/api/recipes',
    );
    const adminEmail = `ftags-admin-${stamp}@example.com`;
    const adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, adminCookie, '/api/admin/recipes');
  });

  afterAll(async () => {
    await database.delete(recipes).where(
      inArray(
        recipes.id,
        (
          await database
            .select({ id: recipes.id })
            .from(recipes)
            .where(eq(recipes.familyId, anaFamily))
        ).map((r) => r.id),
      ),
    );
    if (made.length > 0) {
      await database.delete(tags).where(inArray(tags.id, made));
    }
    await app.close();
  });

  describe('resolving a name', () => {
    it('creates a Family Tag for a name nothing matches', async () => {
      const created = await tag(ana, `Sunday roast ${stamp}`);
      expect(created).toMatchObject({
        kind: 'family',
        name: `Sunday roast ${stamp}`,
        groupId: null,
        groupName: null,
      });
      const rows = await familyTagRows(anaFamily);
      expect(rows.map((r) => r.id)).toContain(created.id);
    });

    it('trims and collapses the name it stores', async () => {
      const created = await tag(ana, `  Slow   cooker ${stamp} `);
      expect(created.name).toBe(`Slow cooker ${stamp}`);
    });

    it('reuses the Family Tag when the name differs only in case, accents, spaces or hyphens', async () => {
      const first = await tag(ana, `Crème-brûlée ${stamp}`);
      for (const again of [
        `creme brulee ${stamp}`,
        `CRÈME   BRÛLÉE ${stamp}`,
        `creme-brulee-${stamp}`,
      ]) {
        const next = await tag(ana, again);
        expect(next.id).toBe(first.id);
        expect(next.name).toBe(`Crème-brûlée ${stamp}`);
      }
      const same = (await familyTagRows(anaFamily)).filter(
        (r) => r.normalizedName === `creme brulee ${stamp}`,
      );
      expect(same).toHaveLength(1);
    });

    it('creates one Tag when two requests race for the same name', async () => {
      const name = `Race ${stamp}`;
      const results = await Promise.all([tag(ana, name), tag(ana, name)]);
      expect(results[0].id).toBe(results[1].id);
    });

    it('prefers a Catalog Tag whose source name matches', async () => {
      const found = await tag(ana, ' dinner ');
      expect(found).toMatchObject({ id: dinner, kind: 'catalog' });
      expect(found.groupName).not.toBeNull();
      expect((await familyTagRows(anaFamily)).map((r) => r.name)).not.toContain(
        'dinner',
      );
    });

    it('prefers a Catalog Tag whose translation matches, in any language', async () => {
      const ro = await tag(ana, 'CINA');
      expect(ro).toMatchObject({ id: dinner, kind: 'catalog' });
      const da = await tag(ana, 'aftensmad');
      expect(da.id).toBe(dinner);
    });

    it('names the Catalog Tag in the Catalog Language of the Member', async () => {
      await storeLanguages(app, anaCookie, { catalogLanguage: 'da' });
      try {
        expect((await tag(ana, 'dinner')).name).toBe('Aftensmad');
      } finally {
        await storeLanguages(app, anaCookie, { catalogLanguage: null });
      }
    });

    it('takes the Catalog Tag over a Family Tag with the same normalized name', async () => {
      const mine = crypto.randomUUID();
      const clash = `Brunch ${stamp}`;
      await database.insert(tags).values({
        id: mine,
        name: clash,
        normalizedName: clash.toLowerCase(),
        familyId: anaFamily,
      });
      made.push(mine);
      // The Catalog Tag is made after the Family one, which stays but stops matching.
      const catalogId = crypto.randomUUID();
      const [group] = await database.select().from(tagGroups).limit(1);
      await database.insert(tags).values({
        id: catalogId,
        name: clash,
        normalizedName: clash.toLowerCase(),
        groupId: group.id,
      });
      try {
        expect((await tag(ana, clash)).id).toBe(catalogId);
      } finally {
        await database.delete(tags).where(eq(tags.id, catalogId));
      }
      expect((await tag(ana, clash)).id).toBe(mine);
    });

    it('caps a name at 30 characters', async () => {
      const ok = await tag(ana, `${'x'.repeat(22)}${stamp}`.slice(0, 30));
      expect(ok.name).toHaveLength(30);
      const res = await resolve(ana, 'y'.repeat(31), 400);
      expect(code(res)).toBe('tags.name_too_long');
      expect((res.body as { params: unknown }).params).toEqual({ max: 30 });
    });

    it('counts the trimmed name, not the spaces around it', async () => {
      const name = `z${stamp}`.padEnd(30, 'z');
      const ok = await tag(ana, `   ${name}   `);
      expect(ok.name).toBe(name);
    });

    it.each(['', '   ', '!!!', '---'])(
      'refuses the empty name %j',
      async (n) => {
        expect(code(await resolve(ana, n, 400))).toBe('tags.name_required');
      },
    );

    it('refuses a body without a name', async () => {
      await ana.post('/tags', {}).expect(400);
      await ana.post('/tags', { name: 4 }).expect(400);
    });

    it('flags a Family Tag that claims an Allergen is absent, in the list too', async () => {
      const free = await tag(ana, 'Gluten-free');
      expect(free.claimsAllergenFree).toBe(true);
      const plain = await tag(ana, `Plain ${stamp}`);
      expect(plain.claimsAllergenFree).toBeUndefined();
      const list = (await ana.get('/tags').expect(200)).body as RecipeTag[];
      expect(list.find((t) => t.id === free.id)?.claimsAllergenFree).toBe(true);
      expect(
        list.find((t) => t.id === dinner)?.claimsAllergenFree,
      ).toBeUndefined();
    });
  });

  describe('Family isolation', () => {
    it('gives each Family its own Tag for the same name', async () => {
      const a = await tag(ana, `Shared name ${stamp}`);
      const b = await tag(bea, `shared NAME ${stamp}`);
      expect(b.id).not.toBe(a.id);
      expect(b.name).toBe(`shared NAME ${stamp}`);
    });

    it("never lists another Family's Tags", async () => {
      const mine = await tag(ana, `Only ana ${stamp}`);
      const theirs = (await bea.get('/tags').expect(200)).body as RecipeTag[];
      expect(theirs.map((t) => t.id)).not.toContain(mine.id);
      const own = (await ana.get('/tags').expect(200)).body as RecipeTag[];
      expect(own[0].kind).toBe('family');
      expect(own.map((t) => t.id)).toContain(mine.id);
    });

    it('lets a Family Recipe carry the new Tag and refuses it to another Family', async () => {
      const mine = await tag(ana, `Carry ${stamp}`);
      const doc = {
        title: `Carry recipe ${stamp}`,
        servings: 2,
        lines: [
          {
            ingredientId: seedId.ingredient('flour'),
            quantity: 100,
            unit: 'g',
          },
        ],
        steps: [{ text: 'Mix' }],
        locale: 'en',
        parentId: null,
        tagIds: [mine.id],
      };
      await ana.post('', doc).expect(201);
      const res = await bea.post('', doc).expect(404);
      expect(code(res)).toBe('recipes.tag_not_found');
    });

    it('refuses a Family Tag on a Catalog Recipe', async () => {
      const mine = await tag(ana, `Catalog no ${stamp}`);
      const res = await admin
        .post('', {
          title: `Cat no ${stamp}`,
          servings: 2,
          lines: [
            {
              ingredientId: seedId.ingredient('flour'),
              quantity: 100,
              unit: 'g',
            },
          ],
          steps: [{ text: 'Mix' }],
          tagIds: [mine.id],
        })
        .expect(404);
      expect(code(res)).toBe('recipes.tag_not_found');
    });
  });

  it('needs a signed-in Member', async () => {
    const res = await client(app, '', '/api/recipes').post('/tags', {
      name: 'x',
    });
    expect([401, 403]).toContain(res.status);
  });
});
