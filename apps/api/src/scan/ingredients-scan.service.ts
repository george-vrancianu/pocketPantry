import { BadGatewayException, Injectable } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import {
  ingredientsScanModelJsonSchema,
  ingredientsScanModelResultSchema,
  type IngredientsScanInput,
  type IngredientsScanResult,
} from './ingredients-scan.schemas';

@Injectable()
export class IngredientsScanService {
  constructor(
    private readonly ai: StructuredOutputAiService,
    private readonly ingredientCatalog: IngredientCatalogService,
  ) {}
  async analyze(
    input: IngredientsScanInput,
    locale: string,
  ): Promise<IngredientsScanResult> {
    const catalog = await this.ingredientCatalog.getCatalog();
    try {
      const response = await this.ai.generate({
        prompt: [
          'Identify every distinct edible grocery item visible in this photo. This is a photo of groceries or ingredients, not a receipt.',
          'Use locale ' +
            locale +
            ' only as context for labels. Return one item per distinct visible grocery product or ingredient. Do not include packaging, kitchen tools, household items, or obscured products. Do not duplicate items.',
          'Use a concise consumer-facing productName and broad food productType. Do not invent a brand, quantity, expiry date, or details not visible.',
          'Match each item against the application catalog. Ingredient tuples are [id, name, category]. Return matchedIngredientId only when that exact ID is present and is a reasonable match. Never invent IDs. Return matchedCategory only from catalog categories. matchConfidence measures catalog match confidence, not image-reading confidence. Use null when no catalog ingredient is a good match.',
          'Always return fallbackIngredientName as a short generic ingredient name suitable for catalog search or creation. confidence is per-item recognition confidence from 0 to 1.',
          'Application catalog: ' + this.ingredientCatalog.toPrompt(catalog),
        ].join(' '),
        images: [input.ingredientsImage],
        schemaName: 'grocery_ingredients_photo_scan',
        schema: ingredientsScanModelJsonSchema,
        maxOutputTokens: 8000,
      });
      const result = ingredientsScanModelResultSchema.parse(response.data);
      return {
        items: result.items.map((value) => ({
          ...value,
          ...this.ingredientCatalog.validateMatch(catalog, value),
        })),
      };
    } catch {
      throw new BadGatewayException(
        'The ingredient photo result was invalid. Please try a clearer photo.',
      );
    }
  }
}
