import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import {
  INGREDIENTS_SCAN_MAX_ITEMS,
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
    locale: CatalogLocale,
  ): Promise<IngredientsScanResult> {
    const catalog = await this.ingredientCatalog.getCatalogIn(locale);
    try {
      const response = await this.ai.generate({
        prompt: [
          'Identify every distinct edible grocery item visible in this photo. This is a photo of groceries or ingredients, not a receipt.',
          'The user locale is ' +
            locale +
            '; use it only as context for labels, and match catalog ingredients across languages. Return one item per distinct visible grocery product or ingredient. Do not include packaging, kitchen tools, household items, or obscured products. Do not duplicate items. Return at most ' +
            INGREDIENTS_SCAN_MAX_ITEMS +
            ' items.',
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
      if (result.items.length > INGREDIENTS_SCAN_MAX_ITEMS) {
        throw new ApiException(422, 'scan.too_many_items', {
          max: INGREDIENTS_SCAN_MAX_ITEMS,
        });
      }
      return {
        items: result.items.map((value) => ({
          ...value,
          ...this.ingredientCatalog.validateMatch(catalog, value),
        })),
      };
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(502, 'scan.result_invalid');
    }
  }
}
