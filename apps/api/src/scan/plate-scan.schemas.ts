import { z } from 'zod';
import { modelJsonSchema } from '../ai/model-json-schema';
import { catalogIndexSchema } from '../ingredients/ingredient-catalog';
import { tagIndexesSchema } from '../tags/ai-tags';
import { imageDataUrlSchema } from './product-scan.schemas';
import { ingredientUnit } from '../database/schema';

/** Structured-output schema names of a Plate Scan's two requests: dish guesses, then the whole Recipe of the picked dish. */
export const PLATE_DISHES_SCHEMA_NAME = 'plate_recipe_suggestions';
export const PLATE_RECIPE_SCHEMA_NAME = 'plate_recipe_draft';

/** Plate Scan step one: the photo of the dish. */
export const plateScanSchema = z.object({ plateImage: imageDataUrlSchema });
export type PlateScanInput = z.infer<typeof plateScanSchema>;

/** Plate Scan step two: the dish the Member picked, to be written as a Recipe. Free text, so it is bounded and quoted into the prompt. */
export const plateRecipeSchema = z.object({
  dishTitle: z.string().trim().min(1).max(120),
  /** The token Plate Scan step one returned; proves the dish was guessed for this Member. */
  plateToken: z.string().max(2000).optional(),
});
export type PlateRecipeInput = z.infer<typeof plateRecipeSchema>;

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

/**
 * What the model writes for the picked dish (ADR 0035): the whole Recipe, loosely typed on purpose.
 * Our code judges it (`plate-recipe-draft.ts`): an index outside the Catalog, a weak Match or an
 * out-of-range number never fails the whole read.
 */
export const plateRecipeModelResultSchema = z.object({
  title: z.string(),
  /** What the dish usually makes, not one serving. */
  servings: z.number().nullable(),
  /** The allowed Tags the model chose for the dish, by index; the service turns them into Tag ids. Never a new Tag. */
  tagIndexes: tagIndexesSchema,
  ingredients: z
    .array(
      z.object({
        nameAsWritten: z.string(),
        /** The Catalog index the model chose; the service turns it into an Ingredient id. */
        ingredientIndex: catalogIndexSchema,
        matchConfidence: z.number(),
        quantity: z.number().nullable(),
        unit: z.enum(ingredientUnit.enumValues).nullable(),
        preparation: z.string().nullable(),
        optional: z.boolean(),
      }),
    )
    .max(100),
  steps: z
    .array(z.object({ text: z.string(), timerMinutes: z.number().nullable() }))
    .max(100),
  /** A Tip of the Recipe (`stepIndex` null) or of one Step (its zero-based position in `steps`). */
  tips: z
    .array(z.object({ stepIndex: z.number().nullable(), text: z.string() }))
    .max(50),
});
export type PlateRecipeAnswer = z.infer<typeof plateRecipeModelResultSchema>;
export const plateRecipeJsonSchema = modelJsonSchema(
  plateRecipeModelResultSchema,
);

export type DishGuess = { title: string; confidence: number };
export type PlateDishes = { dishes: DishGuess[] };
/** What step one returns: the guesses, and the short-lived token that unlocks step two for them. */
export type PlateDishesResponse = PlateDishes & { token: string };

/** What step two returns: the id of the Recipe Draft the server stored, as `POST /recipes/from-link` does. */
export type PlateRecipeResponse = { recipeDraftId: string };
