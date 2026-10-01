import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { ingredientUnit, storageLocation } from '../database/schema';

const isoDate = z.iso.date();

/** numeric(10,3) on batches: at least 0.001 and at most 3 decimals. */
const quantity = z
  .number()
  .min(0.001)
  .max(1_000_000)
  .refine((value) => Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6, {
    message: 'at most 3 decimals',
  });

export const finishProposalQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  /** The Member's local date (YYYY-MM-DD) Default Expiry counts from; defaults to the server's UTC date. */
  today: isoDate.optional(),
});
export type FinishProposalQuery = z.infer<typeof finishProposalQuery>;

/** One reviewed line: the Batch to create for a checked Shopping Item. */
export const finishLine = z
  .object({
    itemId: z.uuid(),
    quantity: quantity.nullable(),
    unit: z.enum(ingredientUnit.enumValues).nullable(),
    location: z.enum(storageLocation.enumValues),
    /** `null` means no expiry. */
    expiryDate: isoDate.nullable(),
    productDescription: z.string().trim().max(200).nullish(),
  })
  .refine((line) => line.quantity === null || line.unit !== null, {
    message: 'unit is required when quantity is set',
    path: ['unit'],
  });

/**
 * The reviewed result. Every checked item must appear exactly once, either in
 * `lines` (becomes a Batch) or in `droppedItemIds` (left out of the Pantry).
 */
export const finishShoppingBody = z.object({
  lines: z.array(finishLine).max(500),
  droppedItemIds: z.array(z.uuid()).max(500).default([]),
});
export type FinishShoppingBody = z.infer<typeof finishShoppingBody>;

export type FinishProposalLine = {
  itemId: string;
  /** Localised Ingredient name, or the typed name for an Unmatched item. */
  name: string;
  unmatched: boolean;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  location: (typeof storageLocation.enumValues)[number];
  /** ISO date (YYYY-MM-DD) from Default Expiry, or null when the Catalog has none. */
  expiryDate: string | null;
};

export type FinishProposal = { listId: string; lines: FinishProposalLine[] };

export type FinishResult = {
  /** The new, active Shopping List. */
  listId: string;
  batchCount: number;
};
