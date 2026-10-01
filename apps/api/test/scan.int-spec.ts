import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { ApiException } from '../src/common/api-exception';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
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

  const scan = (cookie: string, body: object, locale = 'en') =>
    request(app.getHttpServer())
      .post('/api/scan/product')
      .query({ locale })
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
          unmatched: false,
          lowConfidence: false,
          matchConfidence: 0.92,
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

  it('hands the model the Catalog in the Member locale and returns names in it', async () => {
    respondWith(parmesan());
    prompts.length = 0;
    const body = (
      await scan(await signUp(), { productImage: IMAGE }, 'ro').expect(201)
    ).body as unknown;
    expect(prompts[0].prompt).toContain("The user's locale is ro");
    expect(prompts[0].images).toEqual([IMAGE]);
    const lines = (body as { lines: { match: { name: string } }[] }).lines;
    expect(lines[0].match.name).not.toBe('Parmesan');
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
          unmatched: true,
          matchConfidence: 0,
          name: 'Grana Padano',
        },
      ],
    });
  });

  it('marks a line Unmatched when the model gives no identifier, or one not in the Catalog', async () => {
    const cookie = await signUp();
    respondWith(parmesan({ matchedIngredientId: null, matchConfidence: 0 }));
    const none = await scan(cookie, { productImage: IMAGE }).expect(201);
    expect(none.body).toMatchObject({
      lines: [{ match: null, unmatched: true }],
    });

    respondWith(
      parmesan({ matchedIngredientId: '4b3f1f0a-0000-4000-8000-000000000000' }),
    );
    const invented = await scan(cookie, { productImage: IMAGE }).expect(201);
    expect(invented.body).toMatchObject({
      lines: [{ match: null, unmatched: true }],
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
      lines: [{ lowConfidence: true, unmatched: false }],
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
