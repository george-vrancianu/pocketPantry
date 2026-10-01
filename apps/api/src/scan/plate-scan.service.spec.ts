import type { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { ApiException } from '../common/api-exception';
import { validateCatalogMatch } from '../ingredients/ingredient-catalog';
import type { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { PlateScanService } from './plate-scan.service';

const IMAGE = 'data:image/jpeg;base64,YQ==';
const milkId = '2d0d9b7c-6f0e-4b7e-8d57-0a5b0c5f4c11';
const strangerId = '9b1f4c2a-0f6e-4a3c-9d0b-3c7d2f1e8a55';

const catalog = {
  categories: ['Dairy', 'Pasta'],
  ingredients: [
    { id: milkId, name: 'Milk', category: 'Dairy', defaultUnit: 'ml' },
  ],
};

const item = (overrides: Record<string, unknown> = {}) => ({
  productName: 'Milk',
  productType: 'Dairy',
  matchedIngredientId: milkId,
  matchedCategory: 'Dairy',
  matchConfidence: 0.9,
  fallbackIngredientName: 'Milk',
  quantityType: 'measured',
  quantity: 200,
  unit: 'ml',
  confidence: 0.9,
  ...overrides,
});

describe('PlateScanService', () => {
  let generate: jest.Mock;
  let service: PlateScanService;

  beforeEach(() => {
    generate = jest.fn();
    service = new PlateScanService(
      { generate } as unknown as StructuredOutputAiService,
      {
        getCatalogIn: jest.fn().mockResolvedValue(catalog),
        toPrompt: jest.fn().mockReturnValue(JSON.stringify(catalog)),
        validateMatch: validateCatalogMatch,
      } as unknown as IngredientCatalogService,
    );
  });

  const sent = () =>
    (generate.mock.calls as [{ prompt: string; images?: string[] }][])[0][0];
  const provider = (data: unknown) =>
    generate.mockResolvedValue({ data, requestId: 'r' });

  describe('findDishes', () => {
    it('sends the photo and returns the guesses, most confident first', async () => {
      provider({
        matches: [
          { title: 'Pasta carbonara', confidence: 0.4 },
          { title: 'Spaghetti bolognese', confidence: 0.8 },
        ],
      });
      const result = await service.findDishes({ plateImage: IMAGE }, 'en');
      expect(result.dishes).toEqual([
        { title: 'Spaghetti bolognese', confidence: 0.8 },
        { title: 'Pasta carbonara', confidence: 0.4 },
      ]);
      expect(sent()).toMatchObject({ images: [IMAGE] });
    });

    it('drops duplicate titles, keeping the most confident, and caps at five', async () => {
      provider({
        matches: [
          { title: 'Pizza', confidence: 0.3 },
          { title: 'pizza ', confidence: 0.7 },
          { title: 'A', confidence: 0.1 },
          { title: 'B', confidence: 0.1 },
          { title: 'C', confidence: 0.1 },
          { title: 'D', confidence: 0.1 },
        ],
      });
      const { dishes } = await service.findDishes({ plateImage: IMAGE }, 'en');
      expect(dishes).toHaveLength(5);
      expect(dishes[0]).toEqual({ title: 'pizza', confidence: 0.7 });
      expect(
        dishes.filter((d) => d.title.toLowerCase() === 'pizza'),
      ).toHaveLength(1);
    });

    it('rejects output that breaks the schema', async () => {
      provider({ matches: [{ title: 'Pizza', confidence: 7 }] });
      await expect(
        service.findDishes({ plateImage: IMAGE }, 'en'),
      ).rejects.toMatchObject({ code: 'scan.result_invalid' });
    });

    it('rejects an empty guess list', async () => {
      provider({ matches: [] });
      await expect(
        service.findDishes({ plateImage: IMAGE }, 'en'),
      ).rejects.toBeInstanceOf(ApiException);
    });

    it('passes a provider failure through unchanged', async () => {
      const failure = new ApiException(502, 'scan.provider_unavailable');
      generate.mockRejectedValue(failure);
      await expect(
        service.findDishes({ plateImage: IMAGE }, 'en'),
      ).rejects.toBe(failure);
    });
  });

  describe('findIngredients', () => {
    it('asks about the dish without an image and returns catalog-validated items', async () => {
      provider({ items: [item()] });
      const { items } = await service.findIngredients('Pizza', 'en');
      expect(items[0]).toMatchObject({
        matchedIngredientId: milkId,
        matchedIngredientName: 'Milk',
        quantity: 200,
        unit: 'ml',
      });
      const request = sent();
      expect(request.images ?? []).toEqual([]);
      expect(request.prompt).toContain('"Pizza"');
      expect(request.prompt).toContain(milkId);
    });

    it('never trusts an id the Catalog does not hold', async () => {
      provider({
        items: [
          item({ matchedIngredientId: strangerId, matchConfidence: 0.95 }),
        ],
      });
      const { items } = await service.findIngredients('Pizza', 'en');
      expect(items[0]).toMatchObject({
        matchedIngredientId: null,
        matchedIngredientName: null,
        matchConfidence: 0,
      });
    });

    it('rejects an id that is not a UUID, and a negative quantity', async () => {
      provider({ items: [item({ matchedIngredientId: 'milk' })] });
      await expect(
        service.findIngredients('Pizza', 'en'),
      ).rejects.toMatchObject({ code: 'scan.result_invalid' });
      provider({ items: [item({ quantity: -1 })] });
      await expect(
        service.findIngredients('Pizza', 'en'),
      ).rejects.toMatchObject({ code: 'scan.result_invalid' });
    });

    it('rejects more than a plate could hold', async () => {
      provider({ items: Array.from({ length: 101 }, () => item()) });
      await expect(
        service.findIngredients('Pizza', 'en'),
      ).rejects.toMatchObject({ code: 'scan.result_invalid' });
    });
  });
});
