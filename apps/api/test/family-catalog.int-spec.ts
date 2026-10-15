import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { normalizeName } from '../src/catalog/normalize';
import { seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  catalogTranslations,
  ingredients,
  ingredientStockHistory,
  recipeIngredientLines,
  recipePairings,
  runningLow,
  shoppingItems,
  shoppingTemplateLines,
  staples,
  suggestionDismissals,
  unmatchedEntries,
  user,
} from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

type Result = {
  id: string;
  name: string;
  owner: 'catalog' | 'family';
  amountScale: string;
  leafCategory: { id: string; name: string };
  parentCategory: { id: string; name: string };
};
type Usage = {
  batches: number;
  shoppingItems: number;
  templateLines: number;
  recipeLines: number;
  staples: number;
};
type FamilyCatalog = {
  ingredients: Array<Result & { usage: Usage }>;
  synonyms: Array<{
    id: string;
    name: string;
    ingredient: { id: string; name: string };
  }>;
};

// Rows here belong to throwaway Families, so no other suite sees them.
describe('Family catalog (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;

  let a: ReturnType<typeof client>;
  let a2: ReturnType<typeof client>;
  let b: ReturnType<typeof client>;
  let familyA: string;

  const HARD_CHEESE = seedId.leaf('hard-cheese');
  const DAIRY_OTHER = seedId.leaf('dairy-other');
  const ROOT_VEG = seedId.leaf('root-vegetables');
  const parmesan = seedId.ingredient('parmesan');

  beforeAll(async () => {
    app = await createTestApp();
    database = app.get<Database>(DATABASE);
    const emailA = `fc-a-${stamp}@example.com`;
    a = client(app, await signUp(app, emailA, 'A'), '/api');
    a2 = client(
      app,
      await signUp(app, `fc-a2-${stamp}@example.com`, 'A2'),
      '/api',
    );
    b = client(
      app,
      await signUp(app, `fc-b-${stamp}@example.com`, 'B'),
      '/api',
    );
    const invite = (await a.get('/family').expect(200)).body as {
      inviteCode: string;
    };
    await a2.post('/family/join', { code: invite.inviteCode }).expect(201);
    const [row] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, emailA));
    familyA = row.familyId;
  });

  afterAll(async () => {
    await app.close();
  });

  async function made(who: typeof a, name: string, leaf = HARD_CHEESE) {
    const res = await who.post('/catalog/family-ingredients?locale=en', {
      name,
      leafCategoryId: leaf,
      defaultUnit: 'g',
    });
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    return res.body as Result;
  }
  const catalogOf = async (who: typeof a, locale = 'en') =>
    (await who.get(`/catalog/family?locale=${locale}`).expect(200))
      .body as FamilyCatalog;
  const synonymOf = async (
    who: typeof a,
    name: string,
    ingredientId: string,
  ) => {
    await who
      .post('/catalog/family-synonyms?locale=en', { name, ingredientId })
      .expect(201);
    const found = (await catalogOf(who)).synonyms.find((s) => s.name === name);
    if (!found) throw new Error('synonym not listed');
    return found;
  };
  const searchIds = async (who: typeof a, q: string) =>
    (
      (await who.get(`/catalog/search?q=${encodeURIComponent(q)}`)).body as {
        results: Result[];
      }
    ).results.map((r) => r.id);

  it('requires authentication', async () => {
    const anon = client(app, '', '/api');
    await anon.get('/catalog/family').expect(401);
  });

  describe('listing', () => {
    it('lists the Family Ingredients and Family Synonyms, only for the owning Family', async () => {
      const name = unique('Lister');
      const created = await made(a, name);
      const synonym = await synonymOf(a, unique('Lister alias'), created.id);

      for (const who of [a, a2]) {
        const listed = await catalogOf(who);
        const row = listed.ingredients.find((i) => i.id === created.id);
        expect(row).toMatchObject({
          name,
          owner: 'family',
          leafCategory: { id: HARD_CHEESE },
          parentCategory: { name: 'Dairy' },
          usage: {
            batches: 0,
            shoppingItems: 0,
            templateLines: 0,
            recipeLines: 0,
            staples: 0,
          },
        });
        expect(listed.synonyms.find((s) => s.id === synonym.id)).toMatchObject({
          name: synonym.name,
          ingredient: { id: created.id, name },
        });
      }
      const other = await catalogOf(b);
      expect(other.ingredients.map((i) => i.id)).not.toContain(created.id);
      expect(other.synonyms.map((s) => s.id)).not.toContain(synonym.id);
    });

    it('lists a Synonym of a shared Ingredient with that Ingredient', async () => {
      const alias = unique('Parm alias');
      const synonym = await synonymOf(a, alias, parmesan);
      expect(synonym.ingredient).toMatchObject({
        id: parmesan,
        name: 'Parmesan',
      });
      // Never listed as a Family Ingredient.
      expect((await catalogOf(a)).ingredients.map((i) => i.id)).not.toContain(
        parmesan,
      );
    });

    it('counts what uses each Family Ingredient', async () => {
      const created = await made(a, unique('Counted'));
      await a
        .post('/pantry/batches', {
          ingredientId: created.id,
          quantity: 1,
          unit: 'g',
        })
        .expect(201);
      await a
        .post('/pantry/batches', {
          ingredientId: created.id,
          quantity: 2,
          unit: 'g',
        })
        .expect(201);
      await a
        .post('/staples?locale=en', { ingredientId: created.id })
        .expect(201);
      await a
        .post('/shopping-list/items', { ingredientId: created.id })
        .expect(200);
      await a
        .post('/shopping-templates', {
          name: unique('T'),
          lines: [{ ingredientId: created.id }],
        })
        .expect(201);
      await a
        .post('/recipes', {
          title: unique('R'),
          servings: 2,
          locale: 'en',
          parentId: null,
          lines: [{ ingredientId: created.id, quantity: 5, unit: 'g' }],
          steps: [{ text: 'Stir' }],
        })
        .expect(201);

      const row = (await catalogOf(a)).ingredients.find(
        (i) => i.id === created.id,
      );
      expect(row?.usage).toEqual({
        batches: 2,
        shoppingItems: 1,
        templateLines: 1,
        recipeLines: 1,
        staples: 1,
      });
    });
  });

  describe('renaming and recategorising', () => {
    const patch = (who: typeof a, id: string, body: object, locale = 'en') =>
      who.patch(`/catalog/family-ingredients/${id}?locale=${locale}`, body);

    it('renames the same Ingredient, so searching finds the new name only', async () => {
      const created = await made(a, unique('Kombuchaa'));
      const name = unique('Kombucha');

      const res = await patch(a2, created.id, { name: `  ${name} ` });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ id: created.id, name, owner: 'family' });
      expect(await searchIds(a, name)).toContain(created.id);
      expect(await searchIds(a, created.name)).not.toContain(created.id);
    });

    it('allows changing only the case or accents of its own name', async () => {
      const created = await made(a, unique('Crème'));
      const res = await patch(a, created.id, {
        name: created.name.toUpperCase(),
      });
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ name: created.name.toUpperCase() });
    });

    it('rejects a shared name with 409 and the existing Ingredient', async () => {
      const created = await made(a, unique('Clasher'));
      const res = await patch(a, created.id, { name: 'PARMESAN' });
      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: 'catalog.family_ingredient_exists',
        params: { existing: { id: parmesan, owner: 'catalog' } },
      });
    });

    it("rejects the Family's other Ingredient and Synonym names", async () => {
      const first = await made(a, unique('First'));
      const second = await made(a, unique('Second'));
      const alias = unique('Alias');
      await synonymOf(a, alias, first.id);

      const sameName = await patch(a, second.id, { name: first.name });
      expect(sameName.status).toBe(409);
      expect(sameName.body).toMatchObject({
        params: { existing: { id: first.id } },
      });
      const sameSynonym = await patch(a, second.id, { name: alias });
      expect(sameSynonym.status).toBe(409);
      expect(sameSynonym.body).toMatchObject({
        params: { existing: { id: first.id } },
      });
    });

    it('lets another Family use a name the first Family no longer holds', async () => {
      const created = await made(a, unique('Freed'));
      await patch(a, created.id, { name: unique('Renamed') }).expect(200);
      await made(b, created.name);
    });

    it('recategorises, moving its Batches and refreshing its Aisle and scale', async () => {
      const created = await made(a, unique('Mover'));
      const batch = (
        await a
          .post('/pantry/batches', {
            ingredientId: created.id,
            quantity: 1,
            unit: 'g',
          })
          .expect(201)
      ).body as { id: string };

      const res = await patch(a, created.id, { leafCategoryId: ROOT_VEG });

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: created.id,
        name: created.name,
        leafCategory: { id: ROOT_VEG },
        parentCategory: { name: 'Produce' },
      });
      const [row] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, batch.id));
      expect(row.leafCategoryId).toBe(ROOT_VEG);
    });

    it('validates the payload and the Leaf Category', async () => {
      const created = await made(a, unique('Valid'));
      await patch(a, created.id, {}).expect(400);
      await patch(a, created.id, { name: '' }).expect(400);
      const ghost = await patch(a, created.id, {
        leafCategoryId: randomUUID(),
      });
      expect(ghost.status).toBe(404);
    });

    it('answers 404 for a shared Ingredient, a missing one and another Family', async () => {
      const created = await made(a, unique('Private'));
      expect(
        (await patch(a, parmesan, { name: unique('Hijack') })).status,
      ).toBe(404);
      expect(
        (await patch(a, randomUUID(), { name: unique('Nope') })).status,
      ).toBe(404);
      expect(
        (await patch(b, created.id, { name: unique('Steal') })).status,
      ).toBe(404);
      expect(
        (await patch(b, created.id, { leafCategoryId: ROOT_VEG })).status,
      ).toBe(404);
      const [row] = await database
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, created.id));
      expect(row).toMatchObject({
        name: created.name,
        leafCategoryId: HARD_CHEESE,
      });
    });
  });

  describe('deleting a Family Ingredient', () => {
    const remove = (who: typeof a, id: string) =>
      who.del(`/catalog/family-ingredients/${id}`);

    it('turns every reference kind into Unmatched under its name, without queue entries', async () => {
      const name = unique('Doomed');
      const created = await made(a, name);
      const key = normalizeName(name);
      const batch = (
        await a
          .post('/pantry/batches', {
            ingredientId: created.id,
            quantity: 3,
            unit: 'g',
          })
          .expect(201)
      ).body as { id: string };
      await a
        .post('/shopping-list/items', { ingredientId: created.id })
        .expect(200);
      await a
        .post('/shopping-templates', {
          name: unique('T'),
          lines: [{ ingredientId: created.id }],
        })
        .expect(201);
      const recipe = (
        await a
          .post('/recipes', {
            title: unique('R'),
            servings: 2,
            locale: 'en',
            parentId: null,
            lines: [{ ingredientId: created.id, quantity: 5, unit: 'g' }],
            steps: [{ text: 'Stir' }],
          })
          .expect(201)
      ).body as { id: string };
      await database.insert(recipePairings).values({
        id: randomUUID(),
        recipeId: recipe.id,
        position: 0,
        kind: 'food',
        label: 'With it',
        reason: 'Because',
        linkedIngredientId: created.id,
      });
      await a
        .post('/staples?locale=en', { ingredientId: created.id })
        .expect(201);
      await database
        .insert(runningLow)
        .values({ familyId: familyA, ingredientId: created.id });
      await database
        .insert(suggestionDismissals)
        .values({ familyId: familyA, ingredientId: created.id });
      // Creating the Batch recorded stock history.
      await synonymOf(a, unique('Doomed alias'), created.id);

      await remove(a2, created.id).expect(204);

      const [movedBatch] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, batch.id));
      expect(movedBatch).toMatchObject({
        ingredientId: null,
        unmatched: true,
        rawName: name,
        leafCategoryId: DAIRY_OTHER,
      });
      const [item] = await database
        .select()
        .from(shoppingItems)
        .where(eq(shoppingItems.normalizedName, key));
      expect(item).toMatchObject({ ingredientId: null, name });
      const [line] = await database
        .select()
        .from(shoppingTemplateLines)
        .where(eq(shoppingTemplateLines.normalizedName, key));
      expect(line).toMatchObject({ ingredientId: null, name });
      const [recipeLine] = await database
        .select()
        .from(recipeIngredientLines)
        .where(eq(recipeIngredientLines.normalizedName, key));
      expect(recipeLine).toMatchObject({ ingredientId: null, rawName: name });
      const [pairing] = await database
        .select()
        .from(recipePairings)
        .where(eq(recipePairings.recipeId, recipe.id));
      expect(pairing).toMatchObject({
        linkedIngredientId: null,
        label: 'With it',
      });

      for (const table of [
        staples,
        runningLow,
        suggestionDismissals,
        ingredientStockHistory,
      ]) {
        expect(
          await database
            .select()
            .from(table)
            .where(eq(table.ingredientId, created.id)),
        ).toEqual([]);
      }
      expect(
        await database
          .select()
          .from(ingredients)
          .where(eq(ingredients.id, created.id)),
      ).toEqual([]);
      expect(
        await database
          .select()
          .from(catalogTranslations)
          .where(eq(catalogTranslations.entityId, created.id)),
      ).toEqual([]);
      expect(
        await database
          .select()
          .from(unmatchedEntries)
          .where(eq(unmatchedEntries.normalizedName, key)),
      ).toEqual([]);
      expect((await catalogOf(a)).ingredients.map((i) => i.id)).not.toContain(
        created.id,
      );
      expect(await searchIds(a, name)).not.toContain(created.id);
    });

    it('keeps the Pantry showing the Batch under its name', async () => {
      const name = unique('Still here');
      const created = await made(a, name);
      await a
        .post('/pantry/batches', {
          ingredientId: created.id,
          quantity: 1,
          unit: 'g',
        })
        .expect(201);
      await remove(a, created.id).expect(204);
      const pantry = (await a.get('/pantry?locale=en').expect(200)).body as {
        batches: Array<{ name: string; unmatched: boolean }>;
      };
      expect(pantry.batches.find((x) => x.name === name)).toMatchObject({
        unmatched: true,
      });
    });

    it('answers 404 for a shared Ingredient, a missing one and another Family, deleting nothing', async () => {
      const created = await made(a, unique('Protected'));
      expect((await remove(a, parmesan)).status).toBe(404);
      expect((await remove(a, randomUUID())).status).toBe(404);
      expect((await remove(b, created.id)).status).toBe(404);
      expect((await catalogOf(a)).ingredients.map((i) => i.id)).toContain(
        created.id,
      );
      expect((await remove(a, created.id)).status).toBe(204);
      expect((await remove(a, created.id)).status).toBe(404);
    });
  });

  describe('deleting a Family Synonym', () => {
    it('stops it matching immediately and leaves the Ingredient', async () => {
      const created = await made(a, unique('Target'));
      const alias = unique('Zorbalia');
      const synonym = await synonymOf(a, alias, created.id);
      expect(await searchIds(a, alias)).toContain(created.id);

      await a2.del(`/catalog/family-synonyms/${synonym.id}`).expect(204);

      expect(await searchIds(a, alias)).not.toContain(created.id);
      expect((await catalogOf(a)).synonyms.map((s) => s.id)).not.toContain(
        synonym.id,
      );
      expect((await catalogOf(a)).ingredients.map((i) => i.id)).toContain(
        created.id,
      );
    });

    it('answers 404 for another Family, a shared Synonym and a missing one', async () => {
      const created = await made(a, unique('Target'));
      const synonym = await synonymOf(a, unique('Mine'), created.id);
      const [shared] = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.entityId, parmesan))
        .limit(1);

      expect(
        (await b.del(`/catalog/family-synonyms/${synonym.id}`)).status,
      ).toBe(404);
      expect(
        (await a.del(`/catalog/family-synonyms/${shared.id}`)).status,
      ).toBe(404);
      expect(
        (await a.del(`/catalog/family-synonyms/${randomUUID()}`)).status,
      ).toBe(404);
      const [still] = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.id, shared.id));
      expect(still).toBeDefined();
      expect((await catalogOf(a)).synonyms.map((s) => s.id)).toContain(
        synonym.id,
      );
    });
  });
});
