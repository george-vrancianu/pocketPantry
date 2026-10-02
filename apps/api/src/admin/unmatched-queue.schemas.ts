import { z } from 'zod';
import { CATALOG_LOCALES } from '../catalog/catalog.schemas';
import { ingredientCreate } from './admin-catalog.schemas';

export const MAX_PAGE_SIZE = 100;

export const unmatchedListQuery = z.object({
  status: z.enum(['open', 'dismissed']).default('open'),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(50),
  /** `nextCursor` of the previous page. */
  cursor: z.string().max(400).optional(),
});
export type UnmatchedListQuery = z.infer<typeof unmatchedListQuery>;

/** The queue is keyed by the normalised raw name, exactly as the list returns it. */
const normalizedName = z.string().trim().min(1).max(200);

export const unmatchedDismissBody = z.object({ normalizedName });
export type UnmatchedDismissBody = z.infer<typeof unmatchedDismissBody>;

/**
 * Resolve a queue entry to exactly one of an existing Ingredient or a new one.
 * `locale` is the language of the Synonym; it defaults to the locale of the
 * most recent Unmatched row.
 */
export const unmatchedResolveBody = z
  .object({
    normalizedName,
    ingredientId: z.uuid().optional(),
    newIngredient: ingredientCreate.optional(),
    locale: z.enum(CATALOG_LOCALES).optional(),
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
  sources: string[];
  dismissed: boolean;
  /** Up to MAX_REFERENCES, newest first. */
  references: UnmatchedReference[];
};

export type UnmatchedQueuePage = {
  entries: UnmatchedQueueEntry[];
  /** Pass as `cursor` for the next page; null on the last one. */
  nextCursor: string | null;
};

export type UnmatchedResolution = {
  ingredientId: string;
  locale: string;
  relinkedBatches: number;
  relinkedShoppingItems: number;
  synonymAdded: boolean;
};
