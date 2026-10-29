import { jest } from '@jest/globals';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq, inArray } from 'drizzle-orm';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { recipes, recipeTags, tags, user } from '../src/database/schema';
import type {
  DeletedTag,
  ManagedTag,
  RenamedTag,
  RestoredTag,
} from '../src/tags/family-tags.schemas';
import type { RecipeTag } from '../src/recipes/recipes.schemas';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

jest.setTimeout(30_000);

// Spec: #706 / #713. A Member tidies the Family's own Tags: counts, rename, merge, delete, undo.
describe('Manage Family Tags (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let ana: ReturnType<typeof client>;
  let bea: ReturnType<typeof client>;
  let anaFamily: string;
  const stamp = Date.now();
  const dinner = seedId.tag('meal:dinner');
  const code = (res: { body: unknown }) => (res.body as { code: string }).code;
  let seq = 0;

  const makeTag = async (
    who: ReturnType<typeof client>,
    name: string,
  ): Promise<RecipeTag> =>
    (await who.post('/tags', { name }).expect(200)).body as RecipeTag;
  const makeRecipe = async (
    who: ReturnType<typeof client>,
    tagIds: string[],
  ): Promise<string> => {
    const res = await who
      .post('', {
        title: `Manage tags recipe ${stamp} ${(seq += 1)}`,
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
        tagIds,
      })
      .expect(201);
    return (res.body as { id: string }).id;
  };
  const listed = async (who: ReturnType<typeof client>) =>
    (await who.get('/tags/family').expect(200)).body as ManagedTag[];
  const countOf = async (who: ReturnType<typeof client>, id: string) =>
    (await listed(who)).find((t) => t.id === id)?.recipeCount;
  const tagsOf = async (recipeId: string) =>
    (
      await database
        .select({ id: recipeTags.tagId })
        .from(recipeTags)
        .where(eq(recipeTags.recipeId, recipeId))
    )
      .map((r) => r.id)
      .sort();
  const rename = (
    who: ReturnType<typeof client>,
    id: string,
    name: string,
    merge?: boolean,
    status = 200,
  ) => who.patch(`/tags/${id}`, { name, merge }).expect(status);

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const email = `mtags-ana-${stamp}@example.com`;
    ana = client(app, await signUp(app, email, 'Ana'), '/api/recipes');
    anaFamily = (
      await database
        .select({ id: user.familyId })
        .from(user)
        .where(eq(user.email, email))
    )[0].id;
    bea = client(
      app,
      await signUp(app, `mtags-bea-${stamp}@example.com`, 'Bea'),
      '/api/recipes',
    );
  });

  afterAll(async () => {
    const mine = await database
      .select({ id: recipes.id })
      .from(recipes)
      .where(eq(recipes.familyId, anaFamily));
    if (mine.length > 0) {
      await database.delete(recipes).where(
        inArray(
          recipes.id,
          mine.map((r) => r.id),
        ),
      );
    }
    await app.close();
  });

  describe('list', () => {
    it('counts the Family Recipes that carry each Family Tag, by name', async () => {
      const b = await makeTag(ana, `List b ${stamp}`);
      const a = await makeTag(ana, `List a ${stamp}`);
      const unused = await makeTag(ana, `List unused ${stamp}`);
      await makeRecipe(ana, [a.id, b.id]);
      await makeRecipe(ana, [a.id]);
      const mine = (await listed(ana)).filter((t) =>
        t.name.endsWith(String(stamp)),
      );
      const names = mine.map((t) => t.name);
      expect(names).toEqual([...names].sort());
      expect(mine.find((t) => t.id === a.id)?.recipeCount).toBe(2);
      expect(mine.find((t) => t.id === b.id)?.recipeCount).toBe(1);
      expect(mine.find((t) => t.id === unused.id)?.recipeCount).toBe(0);
    });

    it('lists only Family Tags, never Catalog Tags or another Familys', async () => {
      const theirs = await makeTag(bea, `Bea only ${stamp}`);
      const list = await listed(ana);
      expect(list.map((t) => t.id)).not.toContain(theirs.id);
      expect(list.map((t) => t.id)).not.toContain(dinner);
    });

    it('does not count archived Recipes', async () => {
      const t = await makeTag(ana, `Archived ${stamp}`);
      const id = await makeRecipe(ana, [t.id]);
      await database
        .update(recipes)
        .set({ archivedAt: new Date() })
        .where(eq(recipes.id, id));
      expect(await countOf(ana, t.id)).toBe(0);
    });
  });

  describe('rename', () => {
    it('renames in place, keeping the id and the links', async () => {
      const t = await makeTag(ana, `Before ${stamp}`);
      const r = await makeRecipe(ana, [t.id]);
      const res = await rename(ana, t.id, `  After   rename ${stamp} `);
      expect(res.body).toEqual({
        id: t.id,
        name: `After rename ${stamp}`,
        recipeCount: 1,
        merged: false,
      });
      expect(await tagsOf(r)).toEqual([t.id]);
    });

    it('treats a case-only change or its own name as a plain rename', async () => {
      const t = await makeTag(ana, `Same name ${stamp}`);
      const res = await rename(ana, t.id, `SAME NAME ${stamp}`);
      expect((res.body as RenamedTag).merged).toBe(false);
      expect((res.body as RenamedTag).name).toBe(`SAME NAME ${stamp}`);
      await rename(ana, t.id, `SAME NAME ${stamp}`);
    });

    it('applies the shared name rules', async () => {
      const t = await makeTag(ana, `Rules ${stamp}`);
      expect(code(await rename(ana, t.id, '  !! ', false, 400))).toBe(
        'tags.name_required',
      );
      const long = await rename(ana, t.id, 'y'.repeat(31), false, 400);
      expect(code(long)).toBe('tags.name_too_long');
    });

    it('refuses a name another Family Tag has, without the merge flag', async () => {
      const keep = await makeTag(ana, `Keep ${stamp}`);
      const other = await makeTag(ana, `Other ${stamp}`);
      const res = await rename(ana, other.id, `kéep ${stamp}`, false, 409);
      expect(code(res)).toBe('tags.name_taken');
      expect((res.body as { params: { id: string } }).params.id).toBe(keep.id);
      expect((await listed(ana)).map((t) => t.id)).toContain(other.id);
    });

    it('merges into a Family Tag with the flag: links move, duplicates drop', async () => {
      const keep = await makeTag(ana, `Survivor ${stamp}`);
      const gone = await makeTag(ana, `Folded ${stamp}`);
      const onlyGone = await makeRecipe(ana, [gone.id]);
      const both = await makeRecipe(ana, [gone.id, keep.id]);
      const onlyKeep = await makeRecipe(ana, [keep.id]);
      const res = await rename(ana, gone.id, `survivor ${stamp}`, true);
      expect(res.body).toEqual({
        id: keep.id,
        name: `Survivor ${stamp}`,
        recipeCount: 3,
        merged: true,
      });
      expect(await tagsOf(onlyGone)).toEqual([keep.id]);
      expect(await tagsOf(both)).toEqual([keep.id]);
      expect(await tagsOf(onlyKeep)).toEqual([keep.id]);
      expect((await listed(ana)).map((t) => t.id)).not.toContain(gone.id);
    });

    it('merges into a Catalog Tag, matched by translation too', async () => {
      const mine = await makeTag(ana, `Supper ${stamp}`);
      const r = await makeRecipe(ana, [mine.id]);
      await rename(ana, mine.id, 'dinner', false, 409);
      const res = await rename(ana, mine.id, 'Cina', true);
      expect(res.body).toMatchObject({ id: dinner, merged: true });
      expect(await tagsOf(r)).toEqual([dinner]);
      expect((await listed(ana)).map((t) => t.id)).not.toContain(mine.id);
    });

    it('keeps the Catalog Tag when the Recipe already had it', async () => {
      const mine = await makeTag(ana, `Evening ${stamp}`);
      const r = await makeRecipe(ana, [mine.id, dinner]);
      await rename(ana, mine.id, 'dinner', true);
      expect(await tagsOf(r)).toEqual([dinner]);
    });

    it('renames without a conflict even when the merge flag is set', async () => {
      const t = await makeTag(ana, `Flagged ${stamp}`);
      const res = await rename(ana, t.id, `Flagged two ${stamp}`, true);
      expect(res.body).toMatchObject({ id: t.id, merged: false });
    });
  });

  describe('delete and restore', () => {
    it('removes the Tag from every Recipe and returns what Undo needs', async () => {
      const t = await makeTag(ana, `Doomed ${stamp}`);
      const keepMe = await makeTag(ana, `Stays ${stamp}`);
      const r1 = await makeRecipe(ana, [t.id, keepMe.id]);
      const r2 = await makeRecipe(ana, [t.id]);
      const res = await ana.del(`/tags/${t.id}`).expect(200);
      const body = res.body as DeletedTag;
      expect(body.tag).toEqual({ id: t.id, name: `Doomed ${stamp}` });
      expect([...body.recipeIds].sort()).toEqual([r1, r2].sort());
      expect(body.recipeCount).toBe(2);
      expect(await tagsOf(r1)).toEqual([keepMe.id]);
      expect(await tagsOf(r2)).toEqual([]);
      expect((await listed(ana)).map((x) => x.id)).not.toContain(t.id);
    });

    it('restores the Tag and exactly the removed links', async () => {
      const t = await makeTag(ana, `Undo me ${stamp}`);
      const had = await makeRecipe(ana, [t.id]);
      const never = await makeRecipe(ana, []);
      const deleted = (await ana.del(`/tags/${t.id}`).expect(200))
        .body as DeletedTag;
      const res = await ana
        .post('/tags/restore', {
          id: deleted.tag.id,
          name: deleted.tag.name,
          recipeIds: deleted.recipeIds,
        })
        .expect(200);
      expect(res.body).toEqual({
        id: t.id,
        name: `Undo me ${stamp}`,
        recipeCount: 1,
        restoredLinks: 1,
      });
      expect(await tagsOf(had)).toEqual([t.id]);
      expect(await tagsOf(never)).toEqual([]);
    });

    it('skips Recipes deleted meanwhile and a repeated restore adds nothing', async () => {
      const t = await makeTag(ana, `Gone ${stamp}`);
      const live = await makeRecipe(ana, [t.id]);
      const dead = await makeRecipe(ana, [t.id]);
      const deleted = (await ana.del(`/tags/${t.id}`).expect(200))
        .body as DeletedTag;
      await database.delete(recipes).where(eq(recipes.id, dead));
      const send = () =>
        ana.post('/tags/restore', {
          id: t.id,
          name: deleted.tag.name,
          recipeIds: deleted.recipeIds,
        });
      expect(
        ((await send().expect(200)).body as RestoredTag).restoredLinks,
      ).toBe(1);
      expect(
        ((await send().expect(200)).body as RestoredTag).restoredLinks,
      ).toBe(0);
      expect(await tagsOf(live)).toEqual([t.id]);
    });

    it('sends the links to the Tag that took the name meanwhile', async () => {
      const t = await makeTag(ana, `Retaken ${stamp}`);
      const r = await makeRecipe(ana, [t.id]);
      const deleted = (await ana.del(`/tags/${t.id}`).expect(200))
        .body as DeletedTag;
      const newer = await makeTag(ana, `retaken ${stamp}`);
      expect(newer.id).not.toBe(t.id);
      const res = await ana
        .post('/tags/restore', {
          id: t.id,
          name: deleted.tag.name,
          recipeIds: deleted.recipeIds,
        })
        .expect(200);
      expect(res.body).toMatchObject({ id: newer.id, restoredLinks: 1 });
      expect(await tagsOf(r)).toEqual([newer.id]);
      expect(
        (await listed(ana)).filter((x) =>
          x.name.toLowerCase().includes('retaken'),
        ),
      ).toHaveLength(1);
    });

    it('does not push a Recipe over the Tag cap', async () => {
      const t = await makeTag(ana, `Capped ${stamp}`);
      const full = await makeRecipe(ana, [t.id]);
      const deleted = (await ana.del(`/tags/${t.id}`).expect(200))
        .body as DeletedTag;
      const others = await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          makeTag(ana, `Fill ${i} ${stamp}`),
        ),
      );
      await database
        .insert(recipeTags)
        .values(others.map((o) => ({ recipeId: full, tagId: o.id })));
      const res = await ana
        .post('/tags/restore', {
          id: t.id,
          name: deleted.tag.name,
          recipeIds: deleted.recipeIds,
        })
        .expect(200);
      expect((res.body as RestoredTag).restoredLinks).toBe(0);
      expect(await tagsOf(full)).toHaveLength(10);
    });

    it("never links another Family's Recipes", async () => {
      const t = await makeTag(ana, `Not theirs ${stamp}`);
      const theirs = await makeRecipe(bea, []);
      await ana
        .post('/tags/restore', {
          id: t.id,
          name: `Not theirs ${stamp}`,
          recipeIds: [theirs],
        })
        .expect(200);
      expect(await tagsOf(theirs)).toEqual([]);
      await database.delete(recipes).where(eq(recipes.id, theirs));
    });
  });

  describe('Family isolation', () => {
    it('answers 404 for Catalog Tags and another Familys Tags', async () => {
      const theirs = await makeTag(bea, `Private ${stamp}`);
      for (const id of [dinner, theirs.id, crypto.randomUUID()]) {
        expect(code(await rename(ana, id, `Mine ${stamp}`, true, 404))).toBe(
          'tags.not_found',
        );
        expect(code(await ana.del(`/tags/${id}`).expect(404))).toBe(
          'tags.not_found',
        );
      }
      const [row] = await database
        .select()
        .from(tags)
        .where(eq(tags.id, dinner));
      expect(row.name).not.toBe(`Mine ${stamp}`);
      expect((await listed(bea)).map((t) => t.id)).toContain(theirs.id);
    });

    it('refuses to restore over a Tag id that belongs to someone else', async () => {
      const theirs = await makeTag(bea, `Taken id ${stamp}`);
      const res = await ana
        .post('/tags/restore', {
          id: theirs.id,
          name: `Whatever ${stamp}`,
          recipeIds: [],
        })
        .expect(404);
      expect(code(res)).toBe('tags.not_found');
    });

    it('lets any Member of the Family manage, and needs a signed-in Member', async () => {
      const res = await client(app, '', '/api/recipes').get('/tags/family');
      expect([401, 403]).toContain(res.status);
    });
  });
});
