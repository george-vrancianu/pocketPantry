import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { ingredientUnit, storageLocation } from '../database/schema';

export const pantryLocaleQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
});
export type PantryLocaleQuery = z.infer<typeof pantryLocaleQuery>;

/** A real calendar date: `2026-02-31` is rejected rather than rolled over. */
/** A real calendar date: `2026-02-31` is rejected rather than rolled over. */
const isoDate = z.iso.date();

/** numeric(10,3): at least 0.001 and at most 3 decimals, so storage never rounds. */
const quantity = z
  .number()
  .min(0.001)
  .max(1_000_000)
  .refine((value) => Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6, {
    message: 'at most 3 decimals',
  });

/**
 * Add a Batch. Exactly one of `ingredientId` (a Catalog match) or `rawName`
 * (an Unmatched name). `location` and `expiryDate` left out take the Catalog
 * defaults; `expiryDate: null` explicitly means no expiry. `today` is the
 * Member's local date (YYYY-MM-DD) the default expiry counts from; it falls back
 * to the server's UTC date, which is wrong near midnight outside UTC.
 */
export const createBatchBody = z
  .object({
    ingredientId: z.uuid().optional(),
    rawName: z.string().trim().min(1).max(100).optional(),
    /** Unmatched only: the Parent Category whose "Other" Leaf receives the Batch. */
    parentCategoryId: z.uuid().optional(),
    quantity: quantity.nullish(),
    unit: z.enum(ingredientUnit.enumValues).nullish(),
    location: z.enum(storageLocation.enumValues).optional(),
    expiryDate: isoDate.nullish(),
    today: isoDate.optional(),
    productDescription: z.string().trim().max(200).nullish(),
  })
  .refine((body) => (body.ingredientId === undefined) !== !body.rawName, {
    message: 'exactly one of ingredientId or rawName',
    path: ['ingredientId'],
  })
  .refine((body) => !body.parentCategoryId || body.rawName, {
    message: 'parentCategoryId only applies to an Unmatched name',
    path: ['parentCategoryId'],
  })
  .refine((body) => body.quantity == null || body.unit != null, {
    message: 'unit is required when quantity is set',
    path: ['unit'],
  });
export type CreateBatchBody = z.infer<typeof createBatchBody>;

/** The reviewed lines of a Scan, saved together: all of them or none. */
export const createBatchesBody = z.object({
  batches: z.array(createBatchBody).min(1).max(50),
});
export type CreateBatchesBody = z.infer<typeof createBatchesBody>;

export type BatchView = {
  id: string;
  /** Localised Ingredient name, or the typed name for an Unmatched Batch. */
  name: string;
  ingredientId: string | null;
  unmatched: boolean;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  location: (typeof storageLocation.enumValues)[number];
  /** ISO date (YYYY-MM-DD) or null. */
  expiryDate: string | null;
  productDescription: string | null;
  createdAt: Date;
};
