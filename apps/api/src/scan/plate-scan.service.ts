import { Injectable } from '@nestjs/common';
import { ApiException } from '../common/api-exception';
import { z } from 'zod';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { imageDataUrlSchema } from './product-scan.schemas';

export const plateScanSchema = z.object({ plateImage: imageDataUrlSchema });
export const plateRecipeSchema = z.object({
  recipeTitle: z.string().trim().min(1).max(120),
});
const matchesSchema = z.object({
  matches: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        confidence: z.number().min(0).max(1),
      }),
    )
    .min(1)
    .max(5),
});
const itemSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  matchedIngredientId: z.uuid().nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80),
  quantityType: z.enum(['count', 'measured']).nullable(),
  quantity: z.number().positive().max(1000000).nullable(),
  unit: z.string().trim().min(1).max(30).nullable(),
  confidence: z.number().min(0).max(1),
});
const ingredientsSchema = z.object({ items: z.array(itemSchema).max(100) });
@Injectable()
export class PlateScanService {
  constructor(
    private readonly ai: StructuredOutputAiService,
    private readonly catalog: IngredientCatalogService,
  ) {}
  private async ask(
    image: string | null,
    prompt: string,
    name: string,
    schema: Record<string, unknown>,
  ) {
    try {
      const response = await this.ai.generate({
        prompt,
        images: image ? [image] : [],
        schemaName: name,
        schema,
        maxOutputTokens: 4000,
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(502, 'scan.result_invalid');
    }
  }
  async findRecipes(input: z.infer<typeof plateScanSchema>) {
    return matchesSchema.parse(
      await this.ask(
        input.plateImage,
        'Identify the finished meal in this plate photo. Return up to five likely real-world recipe titles, ordered from most to least likely. These recipes do not need to exist in any application database. Use widely understood, concise recipe names and confidence as visual similarity, not certainty. Do not return ingredients, instructions, explanations, or duplicate titles.',
        'plate_recipe_suggestions',
        z.toJSONSchema(matchesSchema, { target: 'draft-7' }),
      ),
    );
  }
  async findIngredients(recipeTitle: string) {
    const catalog = await this.catalog.getCatalog();
    const raw = ingredientsSchema.parse(
      await this.ask(
        null,
        'List the core ingredients needed to cook exactly one portion of the selected recipe. Every quantity must be the amount for one plated serving, not a family recipe, package size, restaurant batch, or pantry purchase. Scale standard recipes down to one serving before returning values. Use modest, cookable amounts; if a reliable one-portion quantity is not possible, return quantity null instead of a large estimate. For each ingredient, return quantityType as count for discrete items and measured otherwise. When matchedIngredientId is set, quantity and unit must use that ingredient defaultUnit; convert common measures only when reliable, otherwise set quantity null and use the defaultUnit. Never invent IDs. Selected recipe: ' +
          recipeTitle +
          '. Catalog entries are [id, name, category, defaultUnit]: ' +
          JSON.stringify(
            catalog.ingredients.map((ingredient) => [
              ingredient.id,
              ingredient.name,
              ingredient.category,
              ingredient.defaultUnit,
            ]),
          ),
        'selected_recipe_ingredients',
        z.toJSONSchema(ingredientsSchema, { target: 'draft-7' }),
      ),
    );
    return {
      items: raw.items.map((item) => ({
        ...item,
        ...this.catalog.validateMatch(catalog, item),
      })),
    };
  }
}
