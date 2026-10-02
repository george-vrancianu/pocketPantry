import { z } from 'zod';
import { imageDataUrlSchema } from './product-scan.schemas';
import { MAX_QUANTITY } from '../common/quantity';

/** Plate Scan step one: the photo of the dish. */
export const plateScanSchema = z.object({ plateImage: imageDataUrlSchema });
export type PlateScanInput = z.infer<typeof plateScanSchema>;

/** Plate Scan step two: the dish the Member picked. Free text, so it is bounded and quoted into the prompt. */
export const plateDishSchema = z.object({
  dishTitle: z.string().trim().min(1).max(120),
  /** The token Plate Scan step one returned; proves the dish was guessed for this Member. */
  plateToken: z.string().max(2000).optional(),
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
  // Same ceiling as a Shopping Item, so a line the Member confirms is never a 400.
  quantity: z.number().positive().max(MAX_QUANTITY).nullable(),
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
/** What step one returns: the guesses, and the short-lived token that unlocks step two for them. */
export type PlateDishesResponse = PlateDishes & { token: string };
