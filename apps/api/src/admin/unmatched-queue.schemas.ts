import { z } from 'zod';
import { SCAN_LANGUAGES } from '../catalog/catalog.schemas';
import { ingredientCreate } from './admin-catalog.schemas';

export const unmatchedListQuery = z.object({
  status: z.enum(['open', 'dismissed']).default('open'),
});
export type UnmatchedListQuery = z.infer<typeof unmatchedListQuery>;

/** The queue is keyed by the normalised raw name, exactly as the list returns it. */
const normalizedName = z.string().trim().min(1).max(200);

export const unmatchedDismissBody = z.object({ normalizedName });
export type UnmatchedDismissBody = z.infer<typeof unmatchedDismissBody>;

/**
 * Resolve a queue entry to exactly one of an existing Ingredient or a new one.
 * `locale` is the language of the raw-name Synonym; it defaults to the locale
 * of the most recent Unmatched row.
 */
export const unmatchedResolveBody = z
  .object({
    normalizedName,
    ingredientId: z.uuid().optional(),
    newIngredient: ingredientCreate.optional(),
    locale: z.enum(SCAN_LANGUAGES).optional(),
    /** Also make a Synonym of the printed text, in its own Scan Language. */
    sourceSynonym: z.boolean().default(false),
  })
  .refine((body) => (body.ingredientId === undefined) !== !body.newIngredient, {
    message: 'exactly one of ingredientId or newIngredient',
    path: ['ingredientId'],
  });
export type UnmatchedResolveBody = z.infer<typeof unmatchedResolveBody>;

export type UnmatchedReference = {
  type: 'batch' | 'shopping_item';
  id: string;
  source: string;
  locale: string;
  rawName: string;
  /** The text as printed, and the Scan Language it was read in; null when not recorded. */
  sourceText: string | null;
  sourceLanguage: string | null;
};

export type UnmatchedQueueEntry = {
  normalizedName: string;
  /** The raw text as most recently saved. */
  rawName: string;
  /** Batches and Shopping Items carrying the name. */
  count: number;
  /** Locale of the most recent row. */
  locale: string;
  locales: string[];
  /** Printed text of the most recent row that has one, with its Scan Language. */
  sourceText: string | null;
  sourceLanguage: string | null;
  sources: string[];
  dismissed: boolean;
  /** Up to MAX_REFERENCES, newest first. */
  references: UnmatchedReference[];
};

export type UnmatchedResolution = {
  ingredientId: string;
  locale: string;
  relinkedBatches: number;
  relinkedShoppingItems: number;
  synonymAdded: boolean;
  /** A Synonym of the printed text was added (needs `sourceSynonym` and printed text). */
  sourceSynonymAdded: boolean;
};
