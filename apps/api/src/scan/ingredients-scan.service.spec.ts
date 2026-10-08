import type { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { ApiException } from '../common/api-exception';
import { validateCatalogMatch } from '../ingredients/ingredient-catalog';
import type { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { INGREDIENTS_SCAN_MAX_ITEMS } from './ingredients-scan.schemas';
import { IngredientsScanService } from './ingredients-scan.service';

const milkId = 'be0ef2e7-75ea-47d8-b9bf-fc890d64db8e';
const inventedId = '4b3f1f0a-0000-4000-8000-000000000000';
const IMAGE = 'data:image/jpeg;base64,YQ==';

const item = (overrides: Record<string, unknown> = {}) => ({
  productName: 'Whole milk',
  productType: 'Dairy',
  matchedIngredientId: milkId,
  matchedCategory: 'Dairy',
  matchConfidence: 0.9,
  fallbackIngredientName: 'Milk',
  confidence: 0.95,
  ...overrides,
});

describe('IngredientsScanService', () => {
  const catalog = {
    categories: ['Dairy'],
    ingredients: [
      { id: milkId, name: 'Milk', category: 'Dairy', defaultUnit: 'ml' },
    ],
  };
  let generate: jest.Mock;
  let service: IngredientsScanService;

  beforeEach(() => {
    generate = jest.fn();
    service = new IngredientsScanService(
      { generate } as unknown as StructuredOutputAiService,
      {
        getCatalogIn: jest.fn().mockResolvedValue(catalog),
        toPrompt: jest.fn().mockReturnValue(JSON.stringify(catalog)),
        validateMatch: validateCatalogMatch,
      } as unknown as IngredientCatalogService,
    );
  });

  const respond = (data: unknown) =>
    generate.mockResolvedValue({ data, requestId: 'r' });
  const analyze = () =>
    service.analyze({ ingredientsImage: IMAGE }, 'en', 'en');

  it('parses every recognised item and sends the photo and Catalog to the provider', async () => {
    respond({ items: [item(), item({ productName: 'Eggs' })] });
    const result = await analyze();
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      matchedIngredientId: milkId,
      matchedIngredientName: 'Milk',
    });
    const [[request]] = generate.mock.calls as [
      [{ images: string[]; prompt: string }],
    ];
    expect(request.images).toEqual([IMAGE]);
    expect(request.prompt).toContain(milkId);
  });

  it('returns no items for an empty result', async () => {
    respond({ items: [] });
    expect(await analyze()).toEqual({ items: [] });
  });

  it('drops an identifier the model invented, keeping the item', async () => {
    respond({ items: [item({ matchedIngredientId: inventedId })] });
    const [first] = (await analyze()).items;
    expect(first).toMatchObject({
      matchedIngredientId: null,
      matchedIngredientName: null,
      matchConfidence: 0,
      fallbackIngredientName: 'Milk',
    });
  });

  it('rejects output that breaks the schema with scan.result_invalid', async () => {
    for (const data of [
      { items: [item({ confidence: 2 })] },
      { items: [item({ matchedIngredientId: 'not-a-uuid' })] },
      { items: [{ productName: 'Milk' }] },
      { nothing: true },
      'text',
    ]) {
      respond(data);
      await expect(analyze()).rejects.toMatchObject({
        status: 502,
        code: 'scan.result_invalid',
      });
    }
  });

  it('handles up to the item limit', async () => {
    respond({
      items: Array.from({ length: INGREDIENTS_SCAN_MAX_ITEMS }, () => item()),
    });
    expect((await analyze()).items).toHaveLength(INGREDIENTS_SCAN_MAX_ITEMS);
  });

  it('tells the client when there are more items than the limit', async () => {
    respond({
      items: Array.from({ length: INGREDIENTS_SCAN_MAX_ITEMS + 1 }, () =>
        item(),
      ),
    });
    const failure = await analyze().catch((error: unknown) => error);
    expect(failure).toBeInstanceOf(ApiException);
    expect(failure).toMatchObject({
      status: 422,
      code: 'scan.too_many_items',
      params: { max: INGREDIENTS_SCAN_MAX_ITEMS },
    });
  });

  it('tells the client for a very large count too, not a result_invalid', async () => {
    respond({
      items: Array.from({ length: 1000 }, () => item()),
    });
    await expect(analyze()).rejects.toMatchObject({
      status: 422,
      code: 'scan.too_many_items',
      params: { max: INGREDIENTS_SCAN_MAX_ITEMS },
    });
  });

  it('passes a provider failure through unchanged', async () => {
    generate.mockRejectedValue(
      new ApiException(502, 'scan.provider_unavailable'),
    );
    await expect(analyze()).rejects.toMatchObject({
      code: 'scan.provider_unavailable',
    });
  });
});
