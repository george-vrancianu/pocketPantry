import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { inArray, like } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { normalizeName } from '../src/catalog/normalize';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { catalogTranslations, scanUsage, user } from '../src/database/schema';
import { client, signUp } from './support/admin-session';
import { createTestApp } from './support/create-test-app';

const IMAGE = 'data:image/jpeg;base64,YQ==';
type Json = Record<string, unknown>;

// Scans see the Family's own Ingredients (ADR 0011): in the prompt and in the
// exact-name fallback, where the Family tier beats a shared clash.
describe('Family Ingredients in Scans (integration)', () => {
  let app: NestFastifyApplication;
  let database: Database;
  let respond: Json = {};
  const prompts: StructuredOutputRequest[] = [];
  const stamp = Date.now();
  let n = 0;
  const unique = (label: string) => `${label} ${stamp}-${++n}`;
  let a: ReturnType<typeof client>;
  let b: ReturnType<typeof client>;

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input) => {
        prompts.push(input);
        return Promise.resolve({ data: respond, requestId: 'fake-request' });
      },
    });
    database = app.get<Database>(DATABASE);
    await seedCatalog(database);
    a = client(
      app,
      await signUp(app, `fis-a-${stamp}@example.com`, 'A'),
      '/api',
    );
    b = client(
      app,
      await signUp(app, `fis-b-${stamp}@example.com`, 'B'),
      '/api',
    );
  });

  // Each test scans a few times; the Scan Cap is not what is under test.
  beforeEach(async () => {
    await database.delete(scanUsage).where(
      inArray(
        scanUsage.memberId,
        database
          .select({ id: user.id })
          .from(user)
          .where(like(user.email, `fis-%-${stamp}@example.com`)),
      ),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  const addFamilyIngredient = async (who: typeof a, name: string) => {
    const res = await who.post('/catalog/family-ingredients', {
      name,
      leafCategoryId: seedId.leaf('hard-cheese'),
      defaultUnit: 'g',
    });
    expect(res.status).toBe(201);
    return (res.body as { id: string }).id;
  };

  const sharedSynonym = (value: string) =>
    database.insert(catalogTranslations).values({
      id: randomUUID(),
      entityType: 'ingredient',
      entityId: seedId.ingredient('parmesan'),
      locale: 'en',
      kind: 'synonym',
      value,
      normalizedValue: normalizeName(value),
    });

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
    return (res.body as { lines: { match: { id: string } | null }[] }).lines[0]
      .match;
  };

  it("hands the model this Family's Ingredients, even ones added after its Catalog was first loaded, and no other Family's", async () => {
    await scanProduct(a, 'warm up');
    const mine = unique('Fis Prompt Mine');
    const theirs = unique('Fis Prompt Theirs');
    await addFamilyIngredient(a, mine);
    await addFamilyIngredient(b, theirs);

    await scanProduct(a, 'anything');

    expect(prompts[0].prompt).toContain(mine);
    expect(prompts[0].prompt).not.toContain(theirs);
  });

  it('matches a Product Scan line the model left Unmatched to a Family Ingredient by its exact name', async () => {
    const name = unique('Fis Product');
    const id = await addFamilyIngredient(a, name);

    expect(await scanProduct(a, name)).toMatchObject({ id });
  });

  it('prefers the Family Ingredient over a shared Synonym with the same name', async () => {
    const name = unique('Fis Clash');
    const id = await addFamilyIngredient(a, name);
    await sharedSynonym(name);

    expect(await scanProduct(a, name)).toMatchObject({ id });
    // Another Family still sees the shared Synonym alone.
    expect(await scanProduct(b, name)).toMatchObject({
      id: seedId.ingredient('parmesan'),
    });
  });

  it("does not match another Family's Ingredient", async () => {
    const name = unique('Fis Private');
    await addFamilyIngredient(a, name);

    expect(await scanProduct(b, name)).toBeNull();
  });

  it('matches an Ingredients Scan item by a Family Ingredient name', async () => {
    const name = unique('Fis Ingredients');
    const id = await addFamilyIngredient(a, name);
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

    const res = await a.post('/scan/ingredients', { ingredientsImage: IMAGE });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ lines: [{ match: { id } }] });
  });

  it('matches a Receipt Scan line by a Family Ingredient name or the printed text, and not for another Family', async () => {
    const byName = unique('Fis Receipt Name');
    const byPrint = unique('Fis Receipt Print');
    const nameId = await addFamilyIngredient(a, byName);
    const printId = await addFamilyIngredient(a, byPrint);
    const line = (
      lineNumber: number,
      sourceText: string,
      fallback: string,
    ) => ({
      lineNumber,
      sourceText,
      lineType: 'product',
      includeInPantry: true,
      exclusionReason: null,
      productName: 'Thing',
      productType: 'Cheese',
      matchedIngredientId: null,
      matchedCategory: null,
      matchConfidence: 0,
      fallbackIngredientName: fallback,
      matchExplanation: 'None.',
      quantityType: 'package_size',
      purchasedCount: 1,
      quantityPerItem: 1,
      quantityUnit: 'g',
      confidence: 0.9,
    });
    respond = {
      merchantName: 'Piata',
      purchaseDate: '2026-09-25',
      lines: [line(1, 'XX1', byName), line(2, byPrint, 'Unknown thing')],
    };
    const scan = (who: typeof a) =>
      who.post('/scan/receipt', { receiptImage: IMAGE });

    const mine = (await scan(a)).body as {
      lines: { match: { id: string } | null }[];
    };
    expect(mine.lines.map((l) => l.match?.id)).toEqual([nameId, printId]);

    const theirs = (await scan(b)).body as { lines: { match: unknown }[] };
    expect(theirs.lines.map((l) => l.match)).toEqual([null, null]);
  });
});
