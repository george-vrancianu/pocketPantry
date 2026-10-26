import { z } from 'zod';
import { ingredientUnit } from '../database/schema';
import {
  catalogIndexSchema,
  ingredientIdAt,
  type IngredientCatalog,
} from '../ingredients/ingredient-catalog';

/** Structured-output schema name of a Recipe from Link reading. */
export const LINK_READING_SCHEMA_NAME = 'recipe_from_link_reading';

/**
 * What the model returns for a page (ADR 0024): a reading in this schema, never
 * a Recipe. Our code turns it into the draft (`link-reading-mapping.ts`), so
 * every field is loosely typed here and judged there; a value out of range
 * must not fail the whole read.
 */
export const linkReadingSchema = z.object({
  /** False when the page holds no recipe to read. */
  recipeFound: z.boolean(),
  /** The language the page is written in, as a code such as "en"; null when unsure. Normalised by `detectedLanguage`. */
  sourceLanguage: z.string().nullable(),
  title: z.string(),
  servings: z.number().nullable(),
  prepMinutes: z.number().nullable(),
  cookMinutes: z.number().nullable(),
  cuisineId: z.string().nullable(),
  methodId: z.string().nullable(),
  steps: z.array(
    z.object({
      text: z.string(),
      timerMinutes: z.number().nullable(),
    }),
  ),
  ingredients: z.array(
    z.object({
      /** The ingredient's name as written in the output language chosen in the prompt. */
      nameAsWritten: z.string(),
      /** The Catalog index the model chose; `withIngredientIds` turns it into an Ingredient id. */
      ingredientId: catalogIndexSchema,
      matchConfidence: z.number(),
      quantity: z.number().nullable(),
      unit: z.enum(ingredientUnit.enumValues).nullable(),
      originalAmount: z.string().nullable(),
      preparation: z.string().nullable(),
      optional: z.boolean(),
    }),
  ),
});
/** What the model returned: Ingredients named by their index in the Catalog text. */
export type LinkReadingAnswer = z.infer<typeof linkReadingSchema>;
type AnswerLine = LinkReadingAnswer['ingredients'][number];
/** The reading with each proposed Ingredient as an id (`withIngredientIds`). */
export type LinkReading = Omit<LinkReadingAnswer, 'ingredients'> & {
  ingredients: (Omit<AnswerLine, 'ingredientId'> & {
    ingredientId: string | null;
  })[];
};

/**
 * The reading with each Ingredient index turned into its id. `catalog` must be
 * the one whose text the prompt sent; an index it does not hold is no proposal.
 */
export function withIngredientIds(
  reading: LinkReadingAnswer,
  catalog: IngredientCatalog,
): LinkReading {
  return {
    ...reading,
    ingredients: reading.ingredients.map((line) => ({
      ...line,
      ingredientId: ingredientIdAt(catalog, line.ingredientId),
    })),
  };
}

export const linkReadingJsonSchema = z.toJSONSchema(linkReadingSchema, {
  target: 'draft-7',
});

/** The detected language as a lower-case base code ("pt-BR" -> "pt"), or null when empty or not a code. */
export function detectedLanguage(
  raw: string | null | undefined,
): string | null {
  const base = raw?.trim().toLowerCase().split(/[-_]/)[0] ?? '';
  return /^[a-z]{2,3}$/.test(base) ? base : null;
}
