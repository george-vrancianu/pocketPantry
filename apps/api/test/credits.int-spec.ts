import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { and, eq } from 'drizzle-orm';
import request from 'supertest';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { CreditsService } from '../src/credits/credits.service';
import { ApiException } from '../src/common/api-exception';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { scanUsage } from '../src/database/schema';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';
import { setBalance } from './support/credits';

const IMAGE = 'data:image/jpeg;base64,YQ==';
const milk = seedId.ingredient('milk');

const productResult = {
  productName: 'Grana Padano 200g',
  productType: 'Hard cheese',
  matchedIngredientId: seedId.ingredient('parmesan'),
  matchedCategory: 'Hard cheese',
  matchConfidence: 0.92,
  fallbackIngredientName: 'Grana Padano',
  expiryDate: '2026-12-24',
  expiryText: 'BBE 24/12/26',
  netQuantity: null,
  netUnit: null,
  confidence: 0.95,
};
const ingredientItem = {
  productName: 'Parmesan wedge',
  productType: 'Hard cheese',
  matchedIngredientId: seedId.ingredient('parmesan'),
  matchedCategory: 'Hard cheese',
  matchConfidence: 0.92,
  fallbackIngredientName: 'Parmesan',
  confidence: 0.95,
};
const receiptLine = {
  lineNumber: 1,
  sourceText: 'LAPTE UHT 1L',
  lineType: 'product',
  includeInPantry: true,
  exclusionReason: null,
  productName: 'Lapte UHT',
  productType: 'Lactate',
  matchedIngredientId: milk,
  matchedCategory: null,
  matchConfidence: 0.93,
  fallbackIngredientName: 'Lapte',
  matchExplanation: 'Milk.',
  quantityType: 'package_size',
  purchasedCount: 2,
  quantityPerItem: 1,
  quantityUnit: 'l',
  confidence: 0.95,
};
const receiptResult = {
  merchantName: 'Piata',
  purchaseDate: '2026-09-25',
  lines: [receiptLine],
};
const plateRecipe = {
  title: 'Pancakes',
  servings: 4,
  tagIndexes: [],
  ingredients: [
    {
      nameAsWritten: 'Milk',
      ingredientId: milk,
      matchConfidence: 0.9,
      quantity: 200,
      unit: 'ml',
      preparation: null,
      optional: false,
    },
  ],
  steps: [{ text: 'Whisk.', timerMinutes: null }],
  tips: [],
};
const dishes = { matches: [{ title: 'Pancakes', confidence: 0.7 }] };

describe('Credits (integration)', () => {
  let app: NestFastifyApplication;
  let next: () => Promise<{ data: unknown; requestId: string | null }>;
  const prompts: StructuredOutputRequest[] = [];
  let counter = 0;

  beforeAll(async () => {
    app = await createTestApp([], {
      generate: (input) => {
        prompts.push(input);
        return next();
      },
    });
    await seedCatalog(app.get<Database>(DATABASE));
  });
  afterAll(async () => {
    await app.close();
  });

  const respondWith = (data: unknown) => {
    next = () => Promise.resolve({ data, requestId: 'fake-request' });
  };

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.31.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Credits ${n}`,
        email: `credits-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    const cookie = [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
    return { cookie, id: (response.body as { user: { id: string } }).user.id };
  }

  const post = (cookie: string, path: string, body: object) =>
    request(app.getHttpServer())
      .post(`/api/${path}`)
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send(body);
  const scanProduct = (cookie: string) =>
    post(cookie, 'scan/product', { productImage: IMAGE });

  const credits = (cookie: string) =>
    request(app.getHttpServer())
      .get('/api/credits')
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie);
  const balanceOf = async (cookie: string) =>
    ((await credits(cookie).expect(200)).body as { balance: number }).balance;
  const scansCounted = async (memberId: string) => {
    const rows = await app
      .get<Database>(DATABASE)
      .select({ count: scanUsage.count })
      .from(scanUsage)
      .where(and(eq(scanUsage.memberId, memberId), eq(scanUsage.kind, 'scan')));
    return rows.reduce((sum, row) => sum + row.count, 0);
  };

  it('requires authentication', async () => {
    await request(app.getHttpServer()).get('/api/credits').expect(401);
  });

  it('gives a new Household of One 100 Credits and shows the Credit Prices', async () => {
    const { cookie } = await signUp();
    const response = await credits(cookie).expect(200);
    expect(response.body).toMatchObject({
      balance: 100,
      lowBalanceThreshold: 10,
      prices: {
        scan: 1,
        voice: 1,
        assistant: 1,
        'link-page': 2,
        'link-text': 1,
        guidance: 1,
        'plate-recipe': 1,
      },
    });
  });

  describe('a successful Scan costs 1 Credit', () => {
    it('in Product Scan Mode', async () => {
      const { cookie } = await signUp();
      respondWith(productResult);
      await scanProduct(cookie).expect(201);
      expect(await balanceOf(cookie)).toBe(99);
    });

    it('in Ingredients Scan Mode', async () => {
      const { cookie } = await signUp();
      respondWith({ items: [ingredientItem] });
      await post(cookie, 'scan/ingredients', {
        ingredientsImage: IMAGE,
      }).expect(201);
      expect(await balanceOf(cookie)).toBe(99);
    });

    it('per Receipt Section', async () => {
      const { cookie } = await signUp();
      respondWith(receiptResult);
      await post(cookie, 'scan/receipt', { receiptImage: IMAGE }).expect(201);
      await post(cookie, 'scan/receipt', { receiptImage: IMAGE }).expect(201);
      expect(await balanceOf(cookie)).toBe(98);
    });

    it('on the Plate photo step, and its own Credit on writing the dish as a Recipe', async () => {
      const { cookie } = await signUp();
      respondWith(dishes);
      const { token } = (
        await post(cookie, 'scan/plate', { plateImage: IMAGE })
      ).body as { token: string };
      expect(await balanceOf(cookie)).toBe(99);

      respondWith(plateRecipe);
      await post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(201);
      expect(await balanceOf(cookie)).toBe(98);
    });

    it('shows the photo and the written Recipe as two spends in the Credit history, and counts only the photo against the Scan Cap', async () => {
      const { cookie, id } = await signUp();
      respondWith(dishes);
      const { token } = (
        await post(cookie, 'scan/plate', { plateImage: IMAGE })
      ).body as { token: string };
      respondWith(plateRecipe);
      await post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(201);
      const { history } = (await credits(cookie).expect(200)).body as {
        history: { kind: string; readKind: string | null; amount: number }[];
      };
      expect(history.map((e) => [e.kind, e.readKind, e.amount])).toEqual([
        ['spend', 'plate-recipe', -1],
        ['spend', 'scan', -1],
        ['welcome_grant', null, 100],
      ]);
      expect(await scansCounted(id)).toBe(1);
    });

    it('shared by the Family: it shows in the balance of the same Family', async () => {
      const { cookie } = await signUp();
      respondWith(productResult);
      await scanProduct(cookie).expect(201);
      await scanProduct(cookie).expect(201);
      expect(await balanceOf(cookie)).toBe(98);
    });
  });

  describe('a Scan that does not read costs nothing', () => {
    it('when the provider fails', async () => {
      const { cookie } = await signUp();
      next = () =>
        Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
      await scanProduct(cookie).expect(502);
      expect(await balanceOf(cookie)).toBe(100);
    });

    it('when the result is invalid', async () => {
      const { cookie } = await signUp();
      respondWith({ productName: 'Milk', confidence: 2 });
      await scanProduct(cookie).expect(502);
      expect(await balanceOf(cookie)).toBe(100);
    });
  });

  describe('with too few Credits', () => {
    it('refuses a Scan with credits.insufficient, without calling the provider or using the Scan Cap', async () => {
      const { cookie, id } = await signUp();
      await setBalance(app, id, 0);
      respondWith(productResult);
      prompts.length = 0;

      const refused = await scanProduct(cookie).expect(402);
      expect(refused.body).toEqual({
        code: 'credits.insufficient',
        params: { price: 1, balance: 0 },
      });
      expect(prompts).toHaveLength(0);
      expect(await scansCounted(id)).toBe(0);
      expect(await balanceOf(cookie)).toBe(0);
    });

    it('refuses every Scan Mode', async () => {
      const { cookie, id } = await signUp();
      await setBalance(app, id, 0);
      for (const [path, body] of [
        ['scan/ingredients', { ingredientsImage: IMAGE }],
        ['scan/receipt', { receiptImage: IMAGE }],
        ['scan/plate', { plateImage: IMAGE }],
      ] as const) {
        const refused = await post(cookie, path, body).expect(402);
        expect((refused.body as { code: string }).code).toBe(
          'credits.insufficient',
        );
      }
    });

    it('refuses writing a dish before the provider is called, and the same token can pick again once Credits are added', async () => {
      const { cookie, id } = await signUp();
      respondWith(dishes);
      const { token } = (
        await post(cookie, 'scan/plate', { plateImage: IMAGE })
      ).body as { token: string };
      // Everything but the photo is held away, to be given back below (Credits "added").
      const away = await app.get(CreditsService).hold(id, 'scan', 99);
      respondWith(plateRecipe);
      prompts.length = 0;

      const refused = await post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(402);
      expect(refused.body).toEqual({
        code: 'credits.insufficient',
        params: { price: 1, balance: 0 },
      });
      expect(prompts).toHaveLength(0);
      expect(await balanceOf(cookie)).toBe(0);

      await app.get(CreditsService).release(away!);
      await post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(201);
      expect(prompts).toHaveLength(1);
      expect(await balanceOf(cookie)).toBe(98);
    });

    it('gives the Credit of a failed writing step back, keeping the photo charged', async () => {
      const { cookie } = await signUp();
      respondWith(dishes);
      const { token } = (
        await post(cookie, 'scan/plate', { plateImage: IMAGE })
      ).body as { token: string };
      next = () =>
        Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
      await post(cookie, 'scan/plate/recipe', {
        dishTitle: 'Pancakes',
        plateToken: token,
      }).expect(502);
      expect(await balanceOf(cookie)).toBe(99);
    });

    it('lets exactly one of two concurrent Scans at a balance of 1 through', async () => {
      const { cookie, id } = await signUp();
      await setBalance(app, id, 1);
      respondWith(productResult);
      const responses = await Promise.all([
        scanProduct(cookie),
        scanProduct(cookie),
      ]);
      expect(responses.map((r) => r.status).sort()).toEqual([201, 402]);
      expect(await balanceOf(cookie)).toBe(0);
    });

    it('gives the Credit back when a read fails, so the next Scan can go ahead', async () => {
      const { cookie, id } = await signUp();
      await setBalance(app, id, 1);
      next = () =>
        Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
      await scanProduct(cookie).expect(502);
      respondWith(productResult);
      await scanProduct(cookie).expect(201);
      expect(await balanceOf(cookie)).toBe(0);
    });
  });

  it('refuses a read at its Cap with the Cap, and leaves the balance alone', async () => {
    const { cookie, id } = await signUp();
    respondWith(productResult);
    for (let i = 0; i < 3; i++) await scanProduct(cookie).expect(201);
    expect(await balanceOf(cookie)).toBe(97);

    const capped = await scanProduct(cookie).expect(429);
    expect(capped.body).toEqual({
      code: 'scan.cap_reached',
      params: { cap: 3 },
    });
    expect(await balanceOf(cookie)).toBe(97);

    // Out of Credits and at the Cap: the Cap speaks first.
    await setBalance(app, id, 0);
    await scanProduct(cookie).expect(429);
  });
});
