import { z } from 'zod';
import { imageDataUrlSchema } from './product-scan.schemas';

/** Plate Scan step one: the photo of the dish. */
export const plateScanSchema = z.object({ plateImage: imageDataUrlSchema });
export type PlateScanInput = z.infer<typeof plateScanSchema>;

/** Plate Scan step two: the dish the Member picked. Free text, so it is bounded and quoted into the prompt. */
export const plateDishSchema = z.object({
  dishTitle: z.string().trim().min(1).max(120),
});
export type PlateDishInput = z.infer<typeof plateDishSchema>;

export const MAX_DISH_GUESSES = 5;

export const plateDishesModelResultSchema = z.object({
  matches: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(120),
        confidence: z.number().min(0).max(1),
      }),
    )
    .min(1)
    .max(MAX_DISH_GUESSES + 5),
});
export const plateDishesJsonSchema = z.toJSONSchema(
  plateDishesModelResultSchema,
  { target: 'draft-7' },
);

const plateItemSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  matchedIngredientId: z.uuid().nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80),
  quantityType: z.enum(['count', 'measured']).nullable(),
  quantity: z.number().positive().max(1_000_000).nullable(),
  unit: z.string().trim().min(1).max(30).nullable(),
  confidence: z.number().min(0).max(1),
});
export const plateIngredientsModelResultSchema = z.object({
  items: z.array(plateItemSchema).max(100),
});
export const plateIngredientsJsonSchema = z.toJSONSchema(
  plateIngredientsModelResultSchema,
  { target: 'draft-7' },
);

export type DishGuess = { title: string; confidence: number };
export type PlateDishes = { dishes: DishGuess[] };
