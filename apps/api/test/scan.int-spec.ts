import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { ApiException } from '../src/common/api-exception';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { scanUsage } from '../src/database/schema';
import { ScanCapService } from '../src/scan/scan-cap.service';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

const IMAGE = 'data:image/jpeg;base64,YQ==';

type ModelResult = Record<string, unknown>;

const parmesan = (overrides: ModelResult = {}): ModelResult => ({
  productName: 'Grana Padano 200g',
  productType: 'Hard cheese',
  matchedIngredientId: seedId.ingredient('parmesan'),
  matchedCategory: 'Hard cheese',
  matchConfidence: 0.92,
  fallbackIngredientName: 'Grana Padano',
  expiryDate: '2026-12-24',
  expiryText: 'BBE 24/12/26',
  confidence: 0.95,
  ...overrides,
});

describe('Product Scan (integration)', () => {
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

  const respondWith = (data: ModelResult) => {
    next = () => Promise.resolve({ data, requestId: 'fake-request' });
  };

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.12.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Scan ${n}`,
        email: `scan-${Date.now()}-${n}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    return [response.headers['set-cookie'] ?? []]
      .flat()
      .map((c) => c.split(';')[0])
      .join('; ');
  }

  const scan = (
    cookie: string,
    body: object,
    locale = 'en',
    scanLanguage?: string,
  ) =>
    request(app.getHttpServer())
      .post('/api/scan/product')
      .query({ locale, ...(scanLanguage ? { scanLanguage } : {}) })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send(body);

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/scan/product')
      .send({ productImage: IMAGE })
      .expect(401);
  });

  it('proposes one matched line with its Catalog defaults, description and best-before date', async () => {
    respondWith(parmesan());
    const body = (
      await scan(await signUp(), {
        productImage: IMAGE,
        expiryImage: IMAGE,
      }).expect(201)
    ).body as unknown;
    expect(body).toMatchObject({
      lines: [
        {
          name: 'Grana Padano',
          sourceText: 'Grana Padano 200g',
          lowConfidence: false,
          expiryDate: '2026-12-24',
          productDescription: 'Grana Padano 200g',
          match: {
            id: seedId.ingredient('parmesan'),
            name: 'Parmesan',
            defaults: { location: 'fridge', expiryDays: 60 },
          },
        },
      ],
    });
  });

  describe('Family Default Expiry overrides', () => {
    const setOverride = (cookie: string, categoryId: string, days: number) =>
      request(app.getHttpServer())
        .put(`/api/settings/family/expiry-overrides/${categoryId}`)
        .set('origin', TEST_ORIGIN)
        .set('cookie', cookie)
        .send({ days })
        .expect(200);

    const proposedExpiryDays = async (cookie: string) => {
      respondWith(parmesan());
      const body = (await scan(cookie, { productImage: IMAGE }).expect(201))
        .body as { lines: { match: { defaults: { expiryDays: number } } }[] };
      return body.lines[0].match.defaults.expiryDays;
    };

    it('uses the Family Leaf override over the Catalog default', async () => {
      const cookie = await signUp();
      await setOverride(cookie, seedId.leaf('hard-cheese'), 14);
      expect(await proposedExpiryDays(cookie)).toBe(14);
    });

    it('uses the Family Parent override when the Leaf has none', async () => {
      const cookie = await signUp();
      await setOverride(cookie, seedId.parent('dairy'), 6);
      expect(await proposedExpiryDays(cookie)).toBe(6);
    });

    it('prefers the Family Leaf override over the Family Parent override', async () => {
      const cookie = await signUp();
      await setOverride(cookie, seedId.parent('dairy'), 6);
      await setOverride(cookie, seedId.leaf('hard-cheese'), 14);
      expect(await proposedExpiryDays(cookie)).toBe(14);
    });
  });

  it('hands the model the Catalog in the Member locale and returns names in it', async () => {
    respondWith(parmesan());
    prompts.length = 0;
    const body = (
      await scan(await signUp(), { productImage: IMAGE }, 'ro').expect(201)
    ).body as unknown;
    expect(prompts[0].prompt).toContain('fallbackIngredientName in Romanian');
    expect(prompts[0].images).toEqual([IMAGE]);
    const lines = (body as { lines: { match: { name: string } }[] }).lines;
    expect(lines[0].match.name).not.toBe('Parmesan');
  });

  it('reads the package in the Scan Language while the UI locale still names the Ingredients and the fallback', async () => {
    respondWith(parmesan());
    prompts.length = 0;
    const body = (
      await scan(await signUp(), { productImage: IMAGE }, 'ro', 'da').expect(
        201,
      )
    ).body as { lines: { match: { name: string } }[] };
    expect(prompts[0].prompt).toMatch(/packages is in Danish/);
    expect(prompts[0].prompt).toContain('fallbackIngredientName in Romanian');
    expect(body.lines[0].match.name).not.toBe('Parmesan');
  });

  it('reads the package in the UI locale when no Scan Language is given', async () => {
    respondWith(parmesan());
    prompts.length = 0;
    await scan(await signUp(), { productImage: IMAGE }, 'ro').expect(201);
    expect(prompts[0].prompt).toMatch(/packages is in Romanian/);
  });

  it('rejects a Scan Language outside the supported list', async () => {
    await scan(await signUp(), { productImage: IMAGE }, 'en', 'fr').expect(400);
  });

  it('marks a Match below the confidence threshold Unmatched', async () => {
    respondWith(parmesan({ matchConfidence: 0.3 }));
    const body = (
      await scan(await signUp(), {
        productImage: IMAGE,
      }).expect(201)
    ).body as unknown;
    expect(body).toMatchObject({
      lines: [
        {
          match: null,
          name: 'Grana Padano',
        },
      ],
    });
  });

  it('matches a line the model left Unmatched when the printed product name is exactly a Catalog name or Synonym', async () => {
    // "Parmezan" is Parmesan's Romanian display name.
    respondWith(
      parmesan({
        productName: 'Parmezan',
        matchedIngredientId: null,
        matchConfidence: 0,
      }),
    );
    const response = await scan(await signUp(), {
      productImage: IMAGE,
    }).expect(201);
    expect(response.body).toMatchObject({
      lines: [{ match: { id: seedId.ingredient('parmesan') } }],
    });
  });

  it('keeps a valid model Match over a different exact hit on the printed name', async () => {
    respondWith(
      parmesan({
        productName: 'Parmezan',
        matchedIngredientId: seedId.ingredient('milk'),
      }),
    );
    const response = await scan(await signUp(), {
      productImage: IMAGE,
    }).expect(201);
    expect(response.body).toMatchObject({
      lines: [{ match: { id: seedId.ingredient('milk') } }],
    });
  });

  it('marks a line Unmatched when the model gives no identifier, or one not in the Catalog', async () => {
    const cookie = await signUp();
    respondWith(parmesan({ matchedIngredientId: null, matchConfidence: 0 }));
    const none = await scan(cookie, { productImage: IMAGE }).expect(201);
    expect(none.body).toMatchObject({
      lines: [{ match: null }],
    });

    respondWith(
      parmesan({ matchedIngredientId: '4b3f1f0a-0000-4000-8000-000000000000' }),
    );
    const invented = await scan(cookie, { productImage: IMAGE }).expect(201);
    expect(invented.body).toMatchObject({
      lines: [{ match: null }],
    });
  });

  it('flags a shaky image read as low-confidence', async () => {
    respondWith(parmesan({ confidence: 0.2 }));
    const body = (
      await scan(await signUp(), {
        productImage: IMAGE,
      }).expect(201)
    ).body as unknown;
    expect(body).toMatchObject({
      lines: [
        { lowConfidence: true, match: { id: seedId.ingredient('parmesan') } },
      ],
    });
  });

  it('stops at the Scan Cap with a specific code, before calling the provider', async () => {
    const cookie = await signUp();
    respondWith(parmesan());
    for (let i = 0; i < 3; i++) {
      await scan(cookie, { productImage: IMAGE }).expect(201);
    }
    prompts.length = 0;
    const blocked = await scan(cookie, { productImage: IMAGE }).expect(429);
    expect(blocked.body).toEqual({
      code: 'scan.cap_reached',
      params: { cap: 3 },
    });
    expect(prompts).toHaveLength(0);

    // The cap is per Member.
    await scan(await signUp(), { productImage: IMAGE }).expect(201);
  });

  it('does not charge the Member for a provider failure', async () => {
    const cookie = await signUp();
    next = () =>
      Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
    for (let i = 0; i < 4; i++) {
      const failed = await scan(cookie, { productImage: IMAGE }).expect(502);
      expect(failed.body).toEqual({
        code: 'scan.provider_unavailable',
        params: {},
      });
    }
    respondWith(parmesan());
    await scan(cookie, { productImage: IMAGE }).expect(201);
  });

  it('refunds a failed Scan against the day it was counted, even after UTC midnight', async () => {
    const cap = app.get(ScanCapService);
    const database = app.get<Database>(DATABASE);
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', '10.13.0.1')
      .send({
        name: 'Midnight',
        email: `midnight-${Date.now()}@example.com`,
        password: 'correct-horse-staple',
      })
      .expect(200);
    const memberId = (response.body as { user: { id: string } }).user.id;

    const day = await cap.consume(memberId, new Date('2020-03-01T23:59:59Z'));
    expect(day).toBe('2020-03-01');
    // The provider call straddles midnight: the refund lands on the original day.
    await cap.refund(memberId, day);
    const rows = await database
      .select({ day: scanUsage.day, count: scanUsage.count })
      .from(scanUsage)
      .where(eq(scanUsage.memberId, memberId));
    expect(rows).toEqual([{ day: '2020-03-01', count: 0 }]);
  });

  it('rejects a result the model got wrong with a stable code', async () => {
    respondWith({ productName: 'Milk', confidence: 2 });
    const failed = await scan(await signUp(), { productImage: IMAGE }).expect(
      502,
    );
    expect(failed.body).toEqual({ code: 'scan.result_invalid', params: {} });
  });

  describe('payload rules', () => {
    it('rejects a non-image payload', async () => {
      const cookie = await signUp();
      for (const productImage of [
        'data:text/plain;base64,YQ==',
        'not a data url',
        42,
      ]) {
        const response = await scan(cookie, { productImage }).expect(400);
        expect(response.body).toEqual({
          code: 'scan.image_invalid',
          params: { field: 'productImage' },
        });
      }
      const expiry = await scan(cookie, {
        productImage: IMAGE,
        expiryImage: 'data:text/plain;base64,YQ==',
      }).expect(400);
      expect(expiry.body).toMatchObject({ code: 'scan.image_invalid' });
    });

    it('rejects an oversized image', async () => {
      const huge = `data:image/jpeg;base64,${'A'.repeat(7_100_000)}`;
      const response = await scan(await signUp(), {
        productImage: huge,
      }).expect(413);
      expect(response.body).toEqual({
        code: 'scan.image_too_large',
        params: { field: 'productImage' },
      });
    });

    it('requires the product image', async () => {
      const response = await scan(await signUp(), {}).expect(400);
      expect(response.body).toMatchObject({ code: 'validation_failed' });
    });

    it('does not use up a Scan on a rejected payload', async () => {
      const cookie = await signUp();
      respondWith(parmesan());
      for (let i = 0; i < 5; i++) {
        await scan(cookie, { productImage: 'nope' }).expect(400);
      }
      await scan(cookie, { productImage: IMAGE }).expect(201);
    });
  });
});
