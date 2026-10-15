import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, inArray, like } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { normalizeName } from '../src/catalog/normalize';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import {
  batches,
  catalogTranslations,
  ingredients,
  ingredientStockHistory,
  recipeIngredientLines,
  scanUsage,
  shoppingItems,
  shoppingTemplateLines,
  unmatchedEntries,
  user,
} from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Result = {
  id: string;
  name: string;
  owner: 'catalog' | 'family';
  leafCategory: { id: string; name: string };
};
type Json = Record<string, unknown>;

const IMAGE = 'data:image/jpeg;base64,YQ==';

// Contract: /home/giu/projects/notes-263/contract-273.md. Everything made here
// carries the run's stamp in its name, so afterAll can sweep it. Shared rows
// (the clash Ingredient, the promoted copy) sit under Ground spices, never Dairy.
describe('Family Synonyms (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let respond: Json = {};
  const prompts: StructuredOutputRequest[] = [];
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;

  let a: ReturnType<typeof client>;
  let a2: ReturnType<typeof client>;
  let b: ReturnType<typeof client>;
  let admin: ReturnType<typeof client>;
  const email = (label: string) => `fsyn-${label}-${stamp}@example.com`;

  const GROUND_SPICES = seedId.leaf('ground-spices');
  const parmesan = seedId.ingredient('parmesan');
  const cheddar = seedId.ingredient('cheddar');

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input) => {
        prompts.push(input);
        return Promise.resolve({ data: respond, requestId: 'fake-request' });
      },
    });
    database = app.get<Database>(DATABASE);
    await seedCatalog(database);
    a = client(app, await signUp(app, email('a'), 'A'), '/api');
    const cookieA2 = await signUp(app, email('a2'), 'A2');
    a2 = client(app, cookieA2, '/api');
    b = client(app, await signUp(app, email('b'), 'B'), '/api');
    await promoteToAdmin(database, await adminEmail());
    const invite = (await a.get('/family').expect(200)).body as {
      inviteCode: string;
    };
    await a2.post('/family/join', { code: invite.inviteCode }).expect(201);
  });

  async function adminEmail() {
    const address = email('admin');
    admin = client(app, await signUp(app, address, 'Admin'), '/api');
    return address;
  }

  beforeEach(async () => {
    await database.delete(scanUsage).where(
      inArray(
        scanUsage.memberId,
        database
          .select({ id: user.id })
          .from(user)
          .where(like(user.email, `fsyn-%-${stamp}@example.com`)),
      ),
    );
  });

  afterAll(async () => {
    await database
      .delete(catalogTranslations)
      .where(like(catalogTranslations.value, `%${stamp}-%`));
    await app.close();
  });

  const link = (who: typeof a, body: object, locale = 'en') =>
    who.post(`/catalog/family-synonyms?locale=${locale}`, body);
  async function linked(
    who: typeof a,
    name: string,
    ingredientId = parmesan,
    locale = 'en',
  ) {
    const res = await link(who, { name, ingredientId }, locale);
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    return res.body as Result;
  }
  async function madeIngredient(
    who: typeof a,
    name: string,
    leafCategoryId = GROUND_SPICES,
  ) {
    const res = await who.post('/catalog/family-ingredients?locale=en', {
      name,
      leafCategoryId,
      defaultUnit: 'g',
    });
    expect([res.status, res.body]).toEqual([201, expect.anything()]);
    return res.body as Result;
  }
  const search = async (who: typeof a, q: string, extra = '') =>
    (
      (await who.get(`/catalog/search?q=${encodeURIComponent(q)}${extra}`))
        .body as { results: Result[] }
    ).results;
  const familyIdOf = async (label: string) =>
    (
      await database
        .select({ familyId: user.familyId })
        .from(user)
        .where(eq(user.email, email(label)))
    )[0].familyId;
  const sharedIngredient = async (name: string, id = randomUUID()) => {
    await database.insert(ingredients).values({
      id,
      leafCategoryId: GROUND_SPICES,
      name,
      normalizedName: normalizeName(name),
      defaultUnit: 'g',
      amountScale: 'medium',
    });
    return id;
  };
  const sharedSynonym = async (value: string, entityId = cheddar) => {
    const id = randomUUID();
    await database.insert(catalogTranslations).values({
      id,
      entityType: 'ingredient',
      entityId,
      locale: 'en',
      kind: 'synonym',
      value,
      normalizedValue: normalizeName(value),
    });
    return id;
  };

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/catalog/family-synonyms')
      .set('origin', TEST_ORIGIN)
      .send({ name: 'x', ingredientId: parmesan })
      .expect(401);
  });

  describe('creating', () => {
    it('answers 201 with the target Ingredient as a search result, and records the Family and the locale on the Synonym', async () => {
      const name = unique('Fsyn Created');
      const res = await link(
        a,
        { name: `  ${name}  `, ingredientId: parmesan },
        'ro',
      );

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        id: parmesan,
        owner: 'catalog',
        leafCategory: { id: seedId.leaf('hard-cheese') },
      });
      const rows = await database
        .select()
        .from(catalogTranslations)
        .where(
          and(
            eq(catalogTranslations.entityId, parmesan),
            eq(catalogTranslations.normalizedValue, normalizeName(name)),
          ),
        );
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        kind: 'synonym',
        value: name,
        locale: 'ro',
        ownerFamilyId: await familyIdOf('a'),
      });
    });

    it('defaults the locale to en, and lets any Member of the Family link', async () => {
      const name = unique('Fsyn By Second Member');
      await linked(a2, name);

      const [row] = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.normalizedValue, normalizeName(name)));
      expect(row.locale).toBe('en');
      expect((await search(a, name)).map((r) => r.id)).toContain(parmesan);
    });

    it('can target a Family Ingredient of the Family', async () => {
      const own = await madeIngredient(a, unique('Fsyn Own Target'));
      const name = unique('Fsyn For Own');

      const res = await link(a, { name, ingredientId: own.id });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({ id: own.id, owner: 'family' });
    });

    it('validates the payload', async () => {
      await link(a, { name: '', ingredientId: parmesan }).expect(400);
      await link(a, { name: '   ', ingredientId: parmesan }).expect(400);
      await link(a, { name: 'x'.repeat(101), ingredientId: parmesan }).expect(
        400,
      );
      await link(a, { name: 'x', ingredientId: 'nope' }).expect(400);
      await link(a, { ingredientId: parmesan }).expect(400);
      await link(a, { name: 'x' }).expect(400);
    });

    it("answers 404 catalog.not_found for an unknown Ingredient and for another Family's Family Ingredient", async () => {
      const theirs = await madeIngredient(b, unique('Fsyn Their Secret'));
      for (const ingredientId of [randomUUID(), theirs.id]) {
        const res = await link(a, {
          name: unique('Fsyn Nowhere'),
          ingredientId,
        });
        expect(res.status).toBe(404);
        expect(res.body).toMatchObject({ code: 'catalog.not_found' });
      }
    });

    it("answers 409 catalog.family_synonym_exists with the target when the name already is the Ingredient's name, in any locale, ignoring case and accents", async () => {
      for (const typed of ['PARMESAN', 'Pârmesan', 'parmezan']) {
        const res = await link(a, { name: typed, ingredientId: parmesan });

        expect(res.status).toBe(409);
        expect(res.body).toMatchObject({
          code: 'catalog.family_synonym_exists',
          params: { existing: { id: parmesan, owner: 'catalog' } },
        });
      }
    });

    it("answers 409 when the name already is one of the Ingredient's shared Synonyms", async () => {
      const value = unique('Fsyn Shared Syn');
      const synonymId = await sharedSynonym(value, parmesan);
      try {
        const res = await link(a, { name: value, ingredientId: parmesan });

        expect(res.status).toBe(409);
        expect(res.body).toMatchObject({
          code: 'catalog.family_synonym_exists',
          params: { existing: { id: parmesan } },
        });
      } finally {
        await database
          .delete(catalogTranslations)
          .where(eq(catalogTranslations.id, synonymId));
      }
    });

    it('answers 409 when the Family already has that Synonym on the Ingredient, whatever the locale it was typed in', async () => {
      const name = unique('Fsyn Twice');
      await linked(a, name, parmesan, 'en');

      const again = await link(
        a,
        { name: name.toUpperCase(), ingredientId: parmesan },
        'da',
      );

      expect(again.status).toBe(409);
      expect(again.body).toMatchObject({
        code: 'catalog.family_synonym_exists',
        params: { existing: { id: parmesan } },
      });
    });

    it("answers 409 with the other Ingredient when the name already is another of the Family's own names or Synonyms", async () => {
      const own = await madeIngredient(a, unique('Fsyn Own Name'));
      const ownRes = await link(a, { name: own.name, ingredientId: parmesan });
      expect(ownRes.status).toBe(409);
      expect(ownRes.body).toMatchObject({
        code: 'catalog.family_synonym_exists',
        params: { existing: { id: own.id, owner: 'family' } },
      });

      const name = unique('Fsyn Own Syn');
      await linked(a, name, cheddar);
      const synRes = await link(a, { name, ingredientId: parmesan });
      expect(synRes.status).toBe(409);
      expect(synRes.body).toMatchObject({
        params: { existing: { id: cheddar } },
      });
    });

    it('also stops the Family creating a Family Ingredient with a name that is one of its Synonyms, offering the Synonym target', async () => {
      const name = unique('Fsyn Then Ingredient');
      await linked(a, name, cheddar);

      const res = await a.post('/catalog/family-ingredients', {
        name,
        leafCategoryId: GROUND_SPICES,
        defaultUnit: 'g',
      });

      expect(res.status).toBe(409);
      expect(res.body).toMatchObject({
        code: 'catalog.family_ingredient_exists',
        params: { existing: { id: cheddar } },
      });
    });

    it("allows a name that is another Ingredient's shared name or Synonym: the Family's choice wins there", async () => {
      const sharedId = await sharedIngredient(unique('Fsyn Shared Other'));
      const [shared] = await database
        .select()
        .from(ingredients)
        .where(eq(ingredients.id, sharedId));
      const synonymValue = unique('Fsyn Shared Other Syn');
      const synonymId = await sharedSynonym(synonymValue, cheddar);
      try {
        for (const name of [shared.name, synonymValue]) {
          const res = await link(a, { name, ingredientId: parmesan });
          expect(res.status).toBe(201);
        }
      } finally {
        await database
          .delete(catalogTranslations)
          .where(eq(catalogTranslations.id, synonymId));
        await database.delete(ingredients).where(eq(ingredients.id, sharedId));
      }
    });

    it('lets two Families give the same name to different Ingredients', async () => {
      const name = unique('Fsyn Two Families');

      await linked(a, name, parmesan);
      await linked(b, name, cheddar);

      expect((await search(a, name)).map((r) => r.id)).toContain(parmesan);
      expect((await search(b, name)).map((r) => r.id)).toContain(cheddar);
      expect((await search(b, name)).map((r) => r.id)).not.toContain(parmesan);
    });
  });

  describe('the Family Synonym tier in clash lookups', () => {
    it("offers the Synonym's target, not a shared Ingredient of the same name, when creating a Family Ingredient", async () => {
      const name = unique('Fsyn Tier Clash');
      // The lowest possible id, so an id tiebreak alone would offer it first.
      const sharedId = await sharedIngredient(
        name,
        '00000000-0000-4000-8000-00000000fa11',
      );
      try {
        await linked(a, name, cheddar);

        const res = await a.post('/catalog/family-ingredients', {
          name,
          leafCategoryId: GROUND_SPICES,
          defaultUnit: 'g',
        });

        expect(res.status).toBe(409);
        expect(res.body).toMatchObject({
          params: { existing: { id: cheddar } },
        });
      } finally {
        await database.delete(ingredients).where(eq(ingredients.id, sharedId));
      }
    });
  });

  describe('when Admin deletes a shared Ingredient', () => {
    it("removes the Families' Synonyms on it", async () => {
      const id = await sharedIngredient(unique('Fsyn Doomed'));
      const name = unique('Fsyn Doomed Alias');
      await linked(a, name, id);

      await admin.del(`/admin/catalog/ingredients/${id}`).expect(204);

      const rows = await database
        .select()
        .from(catalogTranslations)
        .where(eq(catalogTranslations.normalizedValue, normalizeName(name)));
      expect(rows).toEqual([]);
      expect(await search(a, name)).toEqual([]);
    });
  });

  describe('search', () => {
    it('finds the Ingredient by the Family Synonym, in every locale, for the Family only', async () => {
      const name = unique('Fsyn Searchable');
      await linked(a, name, parmesan, 'ro');

      for (const locale of ['en', 'ro', 'da']) {
        const mine = await search(a, name, `&locale=${locale}`);
        expect(mine.map((r) => r.id)).toContain(parmesan);
        const mate = await search(a2, name, `&locale=${locale}`);
        expect(mate.map((r) => r.id)).toContain(parmesan);
        expect(await search(b, name, `&locale=${locale}`)).toEqual([]);
      }
    });

    it('does not show it to shared-scope readers, even of the owning Family', async () => {
      const name = unique('Fsyn Not Shared');
      await linked(a, name);

      expect(await search(a, name, '&scope=shared')).toEqual([]);
    });

    it('keeps showing the Ingredient under its own name, unchanged by the Synonym', async () => {
      await linked(a, unique('Fsyn Name Unchanged'));

      const hit = (await search(a, 'parmesan')).find((r) => r.id === parmesan);
      expect(hit).toMatchObject({ name: 'Parmesan', owner: 'catalog' });
    });
  });

  describe('Scans', () => {
    const productJson = (name: string): Json => ({
      productName: name,
      productType: 'Cheese',
      matchedIngredientId: null,
      matchedCategory: null,
      matchConfidence: 0,
      fallbackIngredientName: 'Something else',
      expiryDate: null,
      expiryText: null,
      confidence: 0.95,
    });
    const scanProduct = async (who: typeof a, name: string) => {
      respond = productJson(name);
      prompts.length = 0;
      const res = await who.post('/scan/product', { productImage: IMAGE });
      expect(res.status).toBe(201);
      return (res.body as { lines: { match: { id: string } | null }[] })
        .lines[0].match;
    };

    it("matches a line the model left Unmatched by the Family Synonym, even when the Family's Scan Catalog was already warm, and not for another Family", async () => {
      await scanProduct(a, 'warm up');
      const name = unique('Fsyn Scanned');
      await linked(a, name, parmesan, 'ro');

      expect(await scanProduct(a, name)).toMatchObject({ id: parmesan });
      expect(await scanProduct(b, name)).toBeNull();
    });

    it('matches an Ingredients Scan item and a Receipt Scan line by the Family Synonym', async () => {
      const name = unique('Fsyn Multi Scan');
      await linked(a, name, parmesan);
      respond = {
        items: [
          {
            productName: name,
            productType: 'Cheese',
            matchedIngredientId: null,
            matchedCategory: null,
            matchConfidence: 0,
            fallbackIngredientName: 'Other',
            confidence: 0.9,
          },
        ],
      };
      const items = await a.post('/scan/ingredients', {
        ingredientsImage: IMAGE,
      });
      expect(items.status).toBe(201);
      expect(items.body).toMatchObject({
        lines: [{ match: { id: parmesan } }],
      });

      respond = {
        merchantName: 'Piata',
        purchaseDate: '2026-09-25',
        lines: [
          {
            lineNumber: 1,
            sourceText: name,
            lineType: 'product',
            includeInPantry: true,
            exclusionReason: null,
            productName: 'Thing',
            productType: 'Cheese',
            matchedIngredientId: null,
            matchedCategory: null,
            matchConfidence: 0,
            fallbackIngredientName: 'Unknown thing',
            matchExplanation: 'None.',
            quantityType: 'package_size',
            purchasedCount: 1,
            quantityPerItem: 1,
            quantityUnit: 'g',
            confidence: 0.9,
          },
        ],
      };
      const receipt = await a.post('/scan/receipt', { receiptImage: IMAGE });
      expect(receipt.status).toBe(201);
      expect(receipt.body).toMatchObject({
        lines: [{ match: { id: parmesan } }],
      });
    });

    it('prefers the Family Synonym over a shared Ingredient of the same name, which another Family still gets', async () => {
      const name = unique('Fsyn Clash Name');
      const sharedId = await sharedIngredient(name);
      try {
        await linked(a, name, parmesan);

        expect(await scanProduct(a, name)).toMatchObject({ id: parmesan });
        expect(await scanProduct(b, name)).toMatchObject({ id: sharedId });
      } finally {
        await database.delete(ingredients).where(eq(ingredients.id, sharedId));
      }
    });

    it('prefers the Family Synonym over a shared Synonym of the same name, which another Family still gets', async () => {
      const name = unique('Fsyn Clash Syn');
      const synonymId = await sharedSynonym(name, cheddar);
      try {
        await linked(a, name, parmesan);

        expect(await scanProduct(a, name)).toMatchObject({ id: parmesan });
        expect(await scanProduct(b, name)).toMatchObject({ id: cheddar });
      } finally {
        await database
          .delete(catalogTranslations)
          .where(eq(catalogTranslations.id, synonymId));
      }
    });
  });

  describe("relinking the Family's Unmatched items", () => {
    async function unmatchedEverywhere(who: typeof a, raw: string) {
      await who
        .post('/pantry/batches/bulk?locale=en', {
          batches: [
            { rawName: raw, quantity: 1, unit: 'pcs', location: 'fridge' },
          ],
        })
        .expect(201);
      await who
        .post('/shopping-list/items?locale=en', { name: raw })
        .expect(200);
      await who
        .post('/shopping-templates', {
          name: unique('Template'),
          lines: [{ name: raw }],
        })
        .expect(201);
      await who
        .post('/recipes', {
          title: unique('Recipe'),
          servings: 2,
          locale: 'en',
          parentId: null,
          lines: [{ rawName: raw }],
          steps: [{ text: 'Stir' }],
        })
        .expect(201);
    }
    const key = (raw: string) => normalizeName(raw);
    const entriesFor = (raw: string) =>
      database
        .select()
        .from(unmatchedEntries)
        .where(eq(unmatchedEntries.normalizedName, key(raw)));
    const batchesNamed = (raw: string) =>
      database.select().from(batches).where(eq(batches.rawName, raw));
    const itemsNamed = (raw: string) =>
      database
        .select()
        .from(shoppingItems)
        .where(eq(shoppingItems.normalizedName, key(raw)));
    const templateLinesNamed = (raw: string) =>
      database
        .select()
        .from(shoppingTemplateLines)
        .where(eq(shoppingTemplateLines.normalizedName, key(raw)));
    const recipeLinesNamed = (raw: string) =>
      database
        .select()
        .from(recipeIngredientLines)
        .where(eq(recipeIngredientLines.normalizedName, key(raw)));

    it("relinks every kind of the Family's Unmatched item to the target, and moves Batches into its Leaf Category", async () => {
      const raw = unique('Fsyn Relink');
      await unmatchedEverywhere(a, raw);
      const [batch] = await batchesNamed(raw);
      const [item] = await itemsNamed(raw);

      await linked(a, raw.toUpperCase());

      const [relinkedBatch] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, batch.id));
      expect(relinkedBatch).toMatchObject({
        ingredientId: parmesan,
        leafCategoryId: seedId.leaf('hard-cheese'),
        unmatched: false,
        rawName: null,
      });
      const [relinkedItem] = await database
        .select()
        .from(shoppingItems)
        .where(eq(shoppingItems.id, item.id));
      expect(relinkedItem).toMatchObject({
        ingredientId: parmesan,
        name: null,
        normalizedName: null,
      });
      expect(await itemsNamed(raw)).toEqual([]);
      expect(await templateLinesNamed(raw)).toEqual([]);
      expect(await recipeLinesNamed(raw)).toEqual([]);
      expect(await entriesFor(raw)).toEqual([]);
    });

    it('records stock history for the relinked Batches', async () => {
      const raw = unique('Fsyn History');
      await unmatchedEverywhere(a, raw);
      const [batch] = await batchesNamed(raw);

      await linked(a, raw);

      const history = await database
        .select()
        .from(ingredientStockHistory)
        .where(
          and(
            eq(ingredientStockHistory.ingredientId, parmesan),
            eq(ingredientStockHistory.familyId, batch.familyId),
          ),
        );
      expect(history).toHaveLength(1);
      expect(history[0].usedUpAt).toBeNull();
    });

    it("leaves another Family's items of the same name untouched", async () => {
      const raw = unique('Fsyn Other Family');
      await unmatchedEverywhere(a, raw);
      await unmatchedEverywhere(b, raw);

      await linked(a, raw);

      const familyB = await familyIdOf('b');
      const theirs = await batchesNamed(raw);
      expect(theirs).toHaveLength(1);
      expect(theirs[0]).toMatchObject({
        familyId: familyB,
        ingredientId: null,
        unmatched: true,
      });
      expect(await itemsNamed(raw)).toHaveLength(1);
      expect(await templateLinesNamed(raw)).toHaveLength(1);
      expect(await recipeLinesNamed(raw)).toHaveLength(1);
      expect((await entriesFor(raw)).length).toBeGreaterThanOrEqual(3);
    });

    it('relinks nothing when the request is rejected', async () => {
      const raw = unique('Fsyn Rejected');
      await unmatchedEverywhere(a, raw);

      await link(a, { name: raw, ingredientId: randomUUID() }).expect(404);

      expect((await batchesNamed(raw))[0]).toMatchObject({ unmatched: true });
      expect(await itemsNamed(raw)).toHaveLength(1);
    });
  });

  describe('another Family', () => {
    it('is unaffected: it cannot see the Synonym, and may create its own Family Ingredient of that name', async () => {
      const name = unique('Fsyn Unaffected');
      await linked(a, name);

      expect(await search(b, name)).toEqual([]);
      const mine = await b.post('/catalog/family-ingredients', {
        name,
        leafCategoryId: GROUND_SPICES,
        defaultUnit: 'g',
      });
      expect(mine.status).toBe(201);
    });
  });

  describe('when Admin promotes a Family Ingredient that merges other Families copies', () => {
    it("keeps the merged copy's Family Synonyms, pointing at the promoted Ingredient and still private to their Family", async () => {
      const copyName = unique('Fsyn Promoted');
      const keep = await madeIngredient(a, copyName);
      const copyB = await madeIngredient(b, copyName);
      const synonym = unique('Fsyn Promoted Alias');
      await linked(b, synonym, copyB.id, 'ro');
      try {
        const res = await admin.post('/admin/family-ingredients/promote', {
          ingredientId: keep.id,
        });
        expect(res.status).toBe(200);

        const rows = await database
          .select()
          .from(catalogTranslations)
          .where(
            eq(catalogTranslations.normalizedValue, normalizeName(synonym)),
          );
        expect(rows).toHaveLength(1);
        expect(rows[0]).toMatchObject({
          entityId: keep.id,
          kind: 'synonym',
          locale: 'ro',
          ownerFamilyId: await familyIdOf('b'),
        });
        const found = await search(b, synonym);
        expect(found.map((r) => ({ id: r.id, owner: r.owner }))).toContainEqual(
          {
            id: keep.id,
            owner: 'catalog',
          },
        );
        expect(await search(a, synonym)).toEqual([]);
        expect(await search(admin, synonym)).toEqual([]);
      } finally {
        await database
          .delete(catalogTranslations)
          .where(eq(catalogTranslations.entityId, keep.id));
        await database.delete(ingredients).where(eq(ingredients.id, keep.id));
      }
    });
  });
});
