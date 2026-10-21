import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq, inArray } from 'drizzle-orm';
import { normalizeName } from '../src/catalog/normalize';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import type { OpenFoodFactsProduct } from '../src/barcode/open-food-facts.client';
import {
  batches,
  ingredients,
  ingredientStockHistory,
  knownBarcodes,
  user,
} from '../src/database/schema';
import { freshBarcode } from './support/fresh-barcode';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';
import { promoteToAdmin } from './support/promote-to-admin';

type Json = Record<string, unknown>;
type Who = ReturnType<typeof client>;

// Spec: #342 / #348, ADR 0013 (Known Barcodes), ADR 0011 (delete and merge). The
// Open Food Facts client is replaced, so no test reaches the network.
describe('Known Barcodes (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let a: Who;
  let b: Who;
  let admin: Who;
  let familyA: string;
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;
  const asked: string[] = [];
  let found: OpenFoodFactsProduct | null = null;
  const touched: string[] = [];

  const GROUND_SPICES = seedId.leaf('ground-spices');

  beforeAll(async () => {
    app = await createTestApp([], undefined, undefined, {
      fetchProduct: (barcode) => {
        asked.push(barcode);
        return Promise.resolve(found);
      },
    });
    database = app.get<Database>(DATABASE);
    await seedCatalog(database);
    const emailA = `kb-a-${stamp}@example.com`;
    a = client(app, await signUp(app, emailA, 'A'), '/api');
    b = client(
      app,
      await signUp(app, `kb-b-${stamp}@example.com`, 'B'),
      '/api',
    );
    const adminEmail = `kb-admin-${stamp}@example.com`;
    const adminCookie = await signUp(app, adminEmail, 'Admin');
    await promoteToAdmin(database, adminEmail);
    admin = client(app, adminCookie, '/api');
    const [row] = await database
      .select({ familyId: user.familyId })
      .from(user)
      .where(eq(user.email, emailA));
    familyA = row.familyId;
  });

  beforeEach(() => {
    asked.length = 0;
    found = null;
  });

  afterAll(async () => {
    if (touched.length > 0) {
      await database
        .delete(batches)
        .where(inArray(batches.ingredientId, touched));
      await database
        .delete(ingredientStockHistory)
        .where(inArray(ingredientStockHistory.ingredientId, touched));
      await database
        .delete(ingredients)
        .where(inArray(ingredients.id, touched));
    }
    await app.close();
  });

  const lookup = (who: Who, code: string) =>
    who.get(`/barcode-lookup/${code}?locale=en`);
  const knownOf = async (code: string) =>
    (
      await database
        .select()
        .from(knownBarcodes)
        .where(
          and(
            eq(knownBarcodes.familyId, familyA),
            eq(knownBarcodes.barcode, code),
          ),
        )
    )[0];
  const saveIngredient = (
    who: Who,
    code: string | undefined,
    extra: Json = {},
  ) =>
    who.post('/pantry/batches?locale=en', {
      ingredientId: seedId.ingredient('parmesan'),
      quantity: 1,
      unit: 'pcs',
      barcode: code,
      ...extra,
    });
  async function familyIngredient(
    who: Who,
    name = unique('Kb Thing'),
  ): Promise<string> {
    const res = await who.post('/catalog/family-ingredients?locale=en', {
      name,
      leafCategoryId: GROUND_SPICES,
      defaultUnit: 'g',
    });
    expect(res.status).toBe(201);
    const id = (res.body as { id: string }).id;
    touched.push(id);
    return id;
  }

  describe('saving a Batch with a barcode', () => {
    it('upserts the Known Barcode for an Ingredient, with the Product Description, and stores no barcode on the Batch', async () => {
      const code = freshBarcode();
      const res = await saveIngredient(a, code, {
        productDescription: 'Grana wedge',
      });
      expect(res.status).toBe(201);
      expect(res.body).not.toHaveProperty('barcode');
      expect(await knownOf(code)).toMatchObject({
        ingredientId: seedId.ingredient('parmesan'),
        rawName: null,
        productDescription: 'Grana wedge',
      });
      const [batch] = await database
        .select()
        .from(batches)
        .where(eq(batches.id, (res.body as { id: string }).id));
      expect(Object.keys(batch).join()).not.toMatch(/barcode/i);
    });

    it('upserts the Known Barcode for an Unmatched name', async () => {
      const code = freshBarcode();
      const rawName = unique('Zorblax');
      const res = await a.post('/pantry/batches?locale=en', {
        rawName,
        parentCategoryId: seedId.parent('dairy'),
        location: 'fridge',
        barcode: code,
        productDescription: 'Zorblax tub',
      });
      expect(res.status).toBe(201);
      expect(await knownOf(code)).toMatchObject({
        ingredientId: null,
        rawName,
        productDescription: 'Zorblax tub',
      });
    });

    it('lets the latest save win, switching between an Ingredient and a name', async () => {
      const code = freshBarcode();
      await saveIngredient(a, code, { productDescription: 'first' }).expect(
        201,
      );
      const rawName = unique('Second');
      await a
        .post('/pantry/batches?locale=en', {
          rawName,
          parentCategoryId: seedId.parent('dairy'),
          location: 'fridge',
          barcode: code,
          productDescription: 'second',
        })
        .expect(201);
      expect(await knownOf(code)).toMatchObject({
        ingredientId: null,
        rawName,
        productDescription: 'second',
      });
      await saveIngredient(a, code, { productDescription: 'third' }).expect(
        201,
      );
      expect(await knownOf(code)).toMatchObject({
        ingredientId: seedId.ingredient('parmesan'),
        rawName: null,
        productDescription: 'third',
      });
    });

    it('saves a Batch without a barcode as before', async () => {
      const before = await database.select().from(knownBarcodes);
      await saveIngredient(a, undefined).expect(201);
      expect(await database.select().from(knownBarcodes)).toHaveLength(
        before.length,
      );
    });

    it('remembers a UPC-A and its EAN-13 form as one Known Barcode', async () => {
      await saveIngredient(a, '036000291452', {
        productDescription: 'first',
      }).expect(201);
      await saveIngredient(a, '0036000291452', {
        productDescription: 'second',
      }).expect(201);
      const rows = await database
        .select()
        .from(knownBarcodes)
        .where(
          and(
            eq(knownBarcodes.familyId, familyA),
            eq(knownBarcodes.barcode, '0036000291452'),
          ),
        );
      expect(rows).toHaveLength(1);
      expect(rows[0].productDescription).toBe('second');
      expect(await knownOf('036000291452')).toBeUndefined();
      const body = (await lookup(a, '036000291452').expect(200)).body as Json;
      expect(body).toMatchObject({
        source: 'known_barcode',
        productDescription: 'second',
      });
    });

    it('rejects a barcode with a wrong check digit and saves nothing', async () => {
      const res = await saveIngredient(a, '3017620422004', {
        productDescription: 'bad check digit',
      });
      expect(res.status).toBe(400);
      expect(await knownOf('3017620422004')).toBeUndefined();
    });

    it.each(['abc', '123', '12345678901234', '30176 20422003'])(
      'rejects the invalid barcode %j and saves nothing',
      async (code) => {
        const res = await saveIngredient(a, code, {
          productDescription: `bad ${code}`,
        });
        expect(res.status).toBe(400);
        const rows = await database
          .select()
          .from(batches)
          .where(
            and(
              eq(batches.familyId, familyA),
              eq(batches.productDescription, `bad ${code}`),
            ),
          );
        expect(rows).toEqual([]);
      },
    );
  });

  describe('Barcode Lookup', () => {
    it('returns the Known Barcode ahead of Open Food Facts, with its own source', async () => {
      const code = freshBarcode();
      found = { ...offProduct(), productName: 'Parmesan' };
      await saveIngredient(a, code, { productDescription: 'Our wedge' });
      const res = await lookup(a, code).expect(200);
      expect(res.body).toMatchObject({
        found: true,
        source: 'known_barcode',
        match: { id: seedId.ingredient('parmesan') },
        productDescription: 'Our wedge',
      });
      expect(asked).toEqual([]);
    });

    it('re-reads the product allergens from the cache for a Known Barcode', async () => {
      const code = freshBarcode();
      found = {
        ...offProduct(),
        productName: 'Zorblax Spread',
        allergenTags: ['en:milk'],
      };
      await lookup(a, code).expect(200);
      await saveIngredient(a, code, { productDescription: 'Our wedge' });
      const res = await lookup(a, code).expect(200);
      expect(res.body).toMatchObject({
        source: 'known_barcode',
        allergens: [{ id: seedId.allergen('milk'), name: 'Milk' }],
      });
    });

    it('notes the cached allergens a matched Known Barcode Ingredient is not tagged with', async () => {
      const code = freshBarcode();
      // The Known Barcode is saved against Parmesan, which is tagged milk in the seed.
      found = {
        ...offProduct(),
        productName: 'Zorblax Spread',
        allergenTags: ['en:milk', 'en:gluten'],
      };
      await lookup(a, code).expect(200);
      await saveIngredient(a, code, {
        ingredientId: seedId.ingredient('parmesan'),
      });
      const res = await lookup(a, code).expect(200);
      expect(res.body).toMatchObject({
        source: 'known_barcode',
        missingAllergens: [{ id: seedId.allergen('gluten'), name: 'Gluten' }],
      });
    });

    it('returns an Unmatched Known Barcode as the exact typed name', async () => {
      const code = freshBarcode();
      const rawName = unique('Zorblax');
      await a
        .post('/pantry/batches?locale=en', {
          rawName,
          parentCategoryId: seedId.parent('dairy'),
          location: 'fridge',
          barcode: code,
          productDescription: 'Tub',
        })
        .expect(201);
      const res = await lookup(a, code).expect(200);
      expect(res.body).toMatchObject({
        found: true,
        source: 'known_barcode',
        match: null,
        unmatchedName: rawName,
        productDescription: 'Tub',
      });
      expect(asked).toEqual([]);
    });

    it('does not show another Family the Known Barcode', async () => {
      const code = freshBarcode();
      await saveIngredient(a, code, { productDescription: 'Ours' });
      found = null;
      const res = await lookup(b, code).expect(200);
      expect(res.body).toEqual({ found: false });
      expect(asked).toEqual([code]);
    });
  });

  describe('Family Ingredient lifecycle', () => {
    it('deletes the Known Barcode with the Family Ingredient it points to', async () => {
      const id = await familyIngredient(a);
      const code = freshBarcode();
      await a
        .post('/pantry/batches?locale=en', {
          ingredientId: id,
          quantity: 1,
          unit: 'g',
          location: 'cupboard',
          barcode: code,
        })
        .expect(201);
      expect(await knownOf(code)).toBeDefined();
      await a.del(`/catalog/family-ingredients/${id}`).expect(204);
      expect(await knownOf(code)).toBeUndefined();
    });

    it('re-points the Known Barcode when an Admin merges the Family Ingredient into a shared one', async () => {
      const id = await familyIngredient(a);
      const code = freshBarcode();
      await a
        .post('/pantry/batches?locale=en', {
          ingredientId: id,
          quantity: 1,
          unit: 'g',
          location: 'cupboard',
          barcode: code,
          productDescription: 'Merged tin',
        })
        .expect(201);
      const target = await admin.post('/admin/catalog/ingredients', {
        leafCategoryId: GROUND_SPICES,
        name: unique('Kb Target'),
        defaultUnit: 'g',
      });
      expect(target.status).toBe(201);
      const targetId = (target.body as { id: string }).id;
      touched.push(targetId);

      await admin
        .post('/admin/family-ingredients/merge', {
          ingredientId: id,
          targetIngredientId: targetId,
        })
        .expect(200);

      expect(await knownOf(code)).toMatchObject({
        ingredientId: targetId,
        productDescription: 'Merged tin',
      });
      expect((await lookup(a, code).expect(200)).body).toMatchObject({
        source: 'known_barcode',
        match: { id: targetId },
      });
    });
  });
  describe('relinking an Unmatched name', () => {
    const saveUnmatched = (raw: string, code: string) =>
      a
        .post('/pantry/batches?locale=en', {
          rawName: raw,
          parentCategoryId: seedId.parent('dairy'),
          location: 'fridge',
          barcode: code,
          productDescription: 'Relink tub',
        })
        .expect(201);

    it('relinks it to a Family Ingredient created with the same name', async () => {
      const raw = unique('Relink Thing');
      const code = freshBarcode();
      await saveUnmatched(raw, code);
      expect((await lookup(a, code).expect(200)).body).toMatchObject({
        unmatchedName: raw,
      });

      const res = await a.post('/catalog/family-ingredients?locale=en', {
        name: raw,
        leafCategoryId: GROUND_SPICES,
        defaultUnit: 'g',
      });
      expect(res.status).toBe(201);
      const id = (res.body as { id: string }).id;
      touched.push(id);

      const body = (await lookup(a, code).expect(200)).body as Json;
      expect(body).toMatchObject({
        source: 'known_barcode',
        match: { id },
        productDescription: 'Relink tub',
      });
      expect(body).not.toHaveProperty('unmatchedName');
    });

    it("leaves another Family's Unmatched Known Barcode alone", async () => {
      const raw = unique('Relink Other');
      const code = freshBarcode();
      await b
        .post('/pantry/batches?locale=en', {
          rawName: raw,
          parentCategoryId: seedId.parent('dairy'),
          location: 'fridge',
          barcode: code,
        })
        .expect(201);
      const id = await familyIngredient(a, raw);
      expect(id).toBeDefined();
      expect((await lookup(b, code).expect(200)).body).toMatchObject({
        match: null,
        unmatchedName: raw,
      });
    });

    it('relinks it when an Admin resolves the Unmatched queue to an Ingredient', async () => {
      const raw = unique('Relink Queue');
      const code = freshBarcode();
      await saveUnmatched(raw, code);
      const codeB = freshBarcode();
      await b
        .post('/pantry/batches?locale=en', {
          rawName: raw,
          parentCategoryId: seedId.parent('dairy'),
          location: 'fridge',
          barcode: codeB,
        })
        .expect(201);

      await admin
        .post('/admin/unmatched/resolve', {
          normalizedName: normalizeName(raw),
          ingredientId: seedId.ingredient('parmesan'),
        })
        .expect(201);

      const body = (await lookup(a, code).expect(200)).body as Json;
      expect(body).toMatchObject({
        match: { id: seedId.ingredient('parmesan') },
      });
      expect(body).not.toHaveProperty('unmatchedName');
      expect((await lookup(b, codeB).expect(200)).body).toMatchObject({
        match: { id: seedId.ingredient('parmesan') },
      });
    });
  });

  describe('promoting a Family Ingredient', () => {
    it("points another Family's Known Barcode at the promoted Ingredient", async () => {
      const name = unique('Kb Promote');
      const copyA = await familyIngredient(a, name);
      const copyB = await familyIngredient(b, name);
      const codeA = freshBarcode();
      const codeB = freshBarcode();
      const save = (who: Who, ingredientId: string, barcode: string) =>
        who
          .post('/pantry/batches?locale=en', {
            ingredientId,
            quantity: 1,
            unit: 'g',
            location: 'cupboard',
            barcode,
          })
          .expect(201);
      await save(a, copyA, codeA);
      await save(b, copyB, codeB);

      await admin
        .post('/admin/family-ingredients/promote', { ingredientId: copyA })
        .expect(200);

      expect((await lookup(a, codeA).expect(200)).body).toMatchObject({
        match: { id: copyA },
      });
      expect((await lookup(b, codeB).expect(200)).body).toMatchObject({
        match: { id: copyA },
      });
    });
  });
});

function offProduct(): OpenFoodFactsProduct {
  return {
    productName: null,
    productNames: {},
    genericName: null,
    genericNames: {},
    quantity: null,
  };
}
