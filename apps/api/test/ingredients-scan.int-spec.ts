import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { ApiException } from '../src/common/api-exception';
import type { StructuredOutputRequest } from '../src/ai/structured-output-ai.service';
import { seedCatalog, seedId } from '../src/catalog/seed/seed-catalog';
import { DATABASE } from '../src/database/database.constants';
import type { Database } from '../src/database/database.types';
import { INGREDIENTS_SCAN_MAX_ITEMS } from '../src/scan/ingredients-scan.schemas';
import { createTestApp, TEST_ORIGIN } from './support/create-test-app';

const IMAGE = 'data:image/jpeg;base64,YQ==';

type ModelItem = Record<string, unknown>;

const item = (overrides: ModelItem = {}): ModelItem => ({
  productName: 'Parmesan wedge',
  productType: 'Hard cheese',
  matchedIngredientId: seedId.ingredient('parmesan'),
  matchedCategory: 'Hard cheese',
  matchConfidence: 0.92,
  fallbackIngredientName: 'Parmesan',
  confidence: 0.95,
  ...overrides,
});

describe('Ingredients Scan (integration)', () => {
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

  const respondWith = (items: ModelItem[]) => {
    next = () =>
      Promise.resolve({ data: { items }, requestId: 'fake-request' });
  };

  async function signUp() {
    const n = ++counter;
    const response = await request(app.getHttpServer())
      .post('/api/auth/sign-up/email')
      .set('origin', TEST_ORIGIN)
      .set('x-forwarded-for', `10.14.${Math.floor(n / 250)}.${n % 250}`)
      .send({
        name: `Ingredients ${n}`,
        email: `ingredients-scan-${Date.now()}-${n}@example.com`,
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
      .post('/api/scan/ingredients')
      .query({ locale })
      .set('origin', TEST_ORIGIN)
      .set('cookie', cookie)
      .send(body);

  it('requires authentication', async () => {
    await request(app.getHttpServer())
      .post('/api/scan/ingredients')
      .send({ ingredientsImage: IMAGE })
      .expect(401);
  });

  it('proposes one line per item, matched ones with their Catalog defaults', async () => {
    respondWith([
      item(),
      item({
        productName: 'Mystery root',
        matchedIngredientId: null,
        matchedCategory: null,
        matchConfidence: 0,
        fallbackIngredientName: 'Mystery root',
      }),
    ]);
    const body = (
      await scan(await signUp(), { ingredientsImage: IMAGE }).expect(201)
    ).body as { lines: unknown[] };
    expect(body.lines).toHaveLength(2);
    expect(body).toMatchObject({
      lines: [
        {
          name: 'Parmesan',
          quantity: null,
          unit: null,
          expiryDate: null,
          productDescription: 'Parmesan wedge',
          match: {
            id: seedId.ingredient('parmesan'),
            defaults: { location: 'fridge', expiryDays: 60 },
          },
        },
        { name: 'Mystery root', match: null },
      ],
    });
  });

  it('returns no lines when nothing is recognised', async () => {
    respondWith([]);
    const response = await scan(await signUp(), {
      ingredientsImage: IMAGE,
    }).expect(201);
    expect(response.body).toEqual({ lines: [] });
  });

  it('hands the model the photo and the Catalog in the Member locale', async () => {
    respondWith([item()]);
    prompts.length = 0;
    const body = (
      await scan(await signUp(), { ingredientsImage: IMAGE }, 'ro').expect(201)
    ).body as { lines: { match: { name: string } }[] };
    expect(prompts[0].images).toEqual([IMAGE]);
    expect(prompts[0].prompt).toContain('locale is ro');
    expect(body.lines[0].match.name).not.toBe('Parmesan');
  });

  it('never trusts the model: an invented identifier or a low Match becomes Unmatched', async () => {
    respondWith([
      item({ matchedIngredientId: '4b3f1f0a-0000-4000-8000-000000000000' }),
      item({ matchConfidence: 0.2 }),
    ]);
    const body = (
      await scan(await signUp(), { ingredientsImage: IMAGE }).expect(201)
    ).body as unknown;
    expect(body).toMatchObject({
      lines: [{ match: null }, { match: null }],
    });
  });

  it('rejects malformed model output with a stable code and refunds the Scan', async () => {
    const cookie = await signUp();
    next = () =>
      Promise.resolve({
        data: { items: [{ productName: 'x' }] },
        requestId: null,
      });
    for (let i = 0; i < 4; i++) {
      const failed = await scan(cookie, { ingredientsImage: IMAGE }).expect(
        502,
      );
      expect(failed.body).toEqual({ code: 'scan.result_invalid', params: {} });
    }
    respondWith([item()]);
    await scan(cookie, { ingredientsImage: IMAGE }).expect(201);
  });

  it('handles the item limit and tells the client beyond it, without charging the Scan', async () => {
    const cookie = await signUp();
    respondWith(
      Array.from({ length: INGREDIENTS_SCAN_MAX_ITEMS }, () => item()),
    );
    const ok = (await scan(cookie, { ingredientsImage: IMAGE }).expect(201))
      .body as { lines: unknown[] };
    expect(ok.lines).toHaveLength(INGREDIENTS_SCAN_MAX_ITEMS);

    respondWith(
      Array.from({ length: INGREDIENTS_SCAN_MAX_ITEMS + 1 }, () => item()),
    );
    for (let i = 0; i < 3; i++) {
      const tooMany = await scan(cookie, { ingredientsImage: IMAGE }).expect(
        422,
      );
      expect(tooMany.body).toEqual({
        code: 'scan.too_many_items',
        params: { max: INGREDIENTS_SCAN_MAX_ITEMS },
      });
    }
    respondWith(Array.from({ length: 1000 }, () => item()));
    const huge = await scan(cookie, { ingredientsImage: IMAGE }).expect(422);
    expect(huge.body).toEqual({
      code: 'scan.too_many_items',
      params: { max: INGREDIENTS_SCAN_MAX_ITEMS },
    });
    respondWith([item()]);
    await scan(cookie, { ingredientsImage: IMAGE }).expect(201);
  });

  it('shares the Scan Cap with the other Scan Modes', async () => {
    const cookie = await signUp();
    respondWith([item()]);
    for (let i = 0; i < 3; i++) {
      await scan(cookie, { ingredientsImage: IMAGE }).expect(201);
    }
    prompts.length = 0;
    const blocked = await scan(cookie, { ingredientsImage: IMAGE }).expect(429);
    expect(blocked.body).toEqual({
      code: 'scan.cap_reached',
      params: { cap: 3 },
    });
    expect(prompts).toHaveLength(0);
  });

  it('does not charge the Member for a provider failure', async () => {
    const cookie = await signUp();
    next = () =>
      Promise.reject(new ApiException(502, 'scan.provider_unavailable'));
    for (let i = 0; i < 4; i++) {
      await scan(cookie, { ingredientsImage: IMAGE }).expect(502);
    }
    respondWith([item()]);
    await scan(cookie, { ingredientsImage: IMAGE }).expect(201);
  });

  describe('payload rules', () => {
    it('rejects a non-image and an oversized image with specific codes', async () => {
      const cookie = await signUp();
      const invalid = await scan(cookie, {
        ingredientsImage: 'data:text/plain;base64,YQ==',
      }).expect(400);
      expect(invalid.body).toEqual({
        code: 'scan.image_invalid',
        params: { field: 'ingredientsImage' },
      });
      const huge = `data:image/jpeg;base64,${'A'.repeat(7_100_000)}`;
      const large = await scan(cookie, { ingredientsImage: huge }).expect(413);
      expect(large.body).toEqual({
        code: 'scan.image_too_large',
        params: { field: 'ingredientsImage' },
      });
    });

    it('requires the image, and a rejected payload does not use up a Scan', async () => {
      const cookie = await signUp();
      const missing = await scan(cookie, {}).expect(400);
      expect(missing.body).toMatchObject({ code: 'validation_failed' });
      respondWith([item()]);
      for (let i = 0; i < 5; i++) {
        await scan(cookie, { ingredientsImage: 'nope' }).expect(400);
      }
      await scan(cookie, { ingredientsImage: IMAGE }).expect(201);
    });
  });
});
