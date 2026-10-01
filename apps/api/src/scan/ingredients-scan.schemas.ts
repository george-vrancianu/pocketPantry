import { z } from 'zod';
import { imageDataUrlSchema } from './product-scan.schemas';

export const ingredientsScanSchema = z.object({
  ingredientsImage: imageDataUrlSchema,
});
/**
 * The most items one Ingredients Scan returns; a photo with more is rejected with
 * `scan.too_many_items`. Sized to the provider's `maxOutputTokens: 8000` budget
 * (each item is ~60-80 output tokens, so ~100-130 items fit): 50 leaves headroom
 * and keeps the Review screen usable.
 */
export const INGREDIENTS_SCAN_MAX_ITEMS = 50;

const item = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  matchedIngredientId: z.uuid().nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80),
  confidence: z.number().min(0).max(1),
});
export const ingredientsScanModelResultSchema = z.object({
  // No upper bound here: the cap above is enforced by the service with its own
  // error for any count, so a huge result is `too_many_items`, not `result_invalid`.
  items: z.array(item),
});
export const ingredientsScanResultSchema = z.object({
  items: z
    .array(
      item.extend({
        matchedIngredientName: z.string().trim().min(1).max(120).nullable(),
        matchedIngredientDefaultUnit: z
          .string()
          .trim()
          .min(1)
          .max(30)
          .nullable(),
      }),
    )
    .max(INGREDIENTS_SCAN_MAX_ITEMS),
});
export type IngredientsScanInput = z.infer<typeof ingredientsScanSchema>;
export type IngredientsScanResult = z.infer<typeof ingredientsScanResultSchema>;
export const ingredientsScanModelJsonSchema = z.toJSONSchema(
  ingredientsScanModelResultSchema,
  { target: 'draft-7' },
);
delete ingredientsScanModelJsonSchema.$schema;
