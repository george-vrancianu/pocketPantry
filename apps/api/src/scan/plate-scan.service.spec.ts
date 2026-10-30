import type { MeteredAiService } from '../usage/metered-ai.service';
import { ApiException } from '../common/api-exception';
import {
  catalogIndexInstruction,
  catalogPrompt,
  validateIndexedMatch,
} from '../ingredients/ingredient-catalog';
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

describe('PlateScanService', () => {
  let generate: jest.Mock;
  let service: PlateScanService;

  beforeEach(() => {
    generate = jest.fn();
    service = new PlateScanService(
      { generate } as unknown as MeteredAiService,
      {
        getCatalogIn: jest.fn().mockResolvedValue(catalog),
        toPrompt: catalogPrompt,
        validateMatch: validateIndexedMatch,
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

  describe('writeRecipe', () => {
    const written = (overrides: Record<string, unknown> = {}) => ({
      title: 'Pizza',
      servings: 4,
      tagIndexes: [],
      ingredients: [
        {
          nameAsWritten: 'Milk',
          // Milk, by its index in the Catalog text.
          ingredientIndex: 0,
          matchConfidence: 0.9,
          quantity: 200,
          unit: 'ml',
          preparation: null,
          optional: false,
        },
      ],
      steps: [{ text: 'Bake.', timerMinutes: 10 }],
      tips: [],
      ...overrides,
    });
    const write = () =>
      service.writeRecipe('Pizza', 'en', 'family-1', { tags: [] });

    it('asks about the dish without an image, and names Catalog Ingredients by id', async () => {
      provider(written());
      const result = await write();
      expect(result.ingredientIds).toEqual([milkId]);
      const request = sent();
      expect(request.images ?? []).toEqual([]);
      expect(request.prompt).toContain('"Pizza"');
      expect(request.prompt).toContain('[0,"Milk","Dairy"]');
      expect(request.prompt).toContain(
        catalogIndexInstruction('ingredientIndex'),
      );
      expect(request.prompt).not.toContain(milkId);
    });

    it('never trusts an index the Catalog does not hold, or a value that is not an index', async () => {
      for (const index of [1, -1, 0.5, strangerId, 'milk']) {
        provider(
          written({
            ingredients: [
              { ...written().ingredients[0], ingredientIndex: index },
            ],
          }),
        );
        expect((await write()).ingredientIds).toEqual([null]);
      }
    });

    it('rejects output that breaks the schema', async () => {
      provider(written({ servings: 'four' }));
      await expect(write()).rejects.toMatchObject({
        code: 'scan.result_invalid',
      });
    });

    it('rejects more than a recipe could hold', async () => {
      provider(
        written({
          ingredients: Array.from(
            { length: 101 },
            () => written().ingredients[0],
          ),
        }),
      );
      await expect(write()).rejects.toMatchObject({
        code: 'scan.result_invalid',
      });
    });
  });
});
