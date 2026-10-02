import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import { ingredientUnit, storageLocation } from '../database/schema';
import { BATCH_SOURCES } from '../unmatched/unmatched-entries';
import { MAX_QUANTITY } from '../common/quantity';

export const pantryLocaleQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
  /** The Member's local date; Expiring Soon counts from it (default: server UTC date). */
  today: z.iso.date().optional(),
});
export type PantryLocaleQuery = z.infer<typeof pantryLocaleQuery>;

/** A real calendar date: `2026-02-31` is rejected rather than rolled over. */
const isoDate = z.iso.date();

/** numeric(10,3): at least 0.001 and at most 3 decimals, so storage never rounds. */
const quantity = z
  .number()
  .min(0.001)
  .max(MAX_QUANTITY)
  .refine((value) => Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6, {
    message: 'at most 3 decimals',
  });

/**
 * Add a Batch. Exactly one of `ingredientId` (a Catalog match) or `rawName`
 * (an Unmatched name). `location` and `expiryDate` left out take the Catalog
 * defaults; `expiryDate: null` explicitly means no expiry.
 */
export const createBatchBody = z
  .object({
    ingredientId: z.uuid().optional(),
    rawName: z.string().trim().min(1).max(100).optional(),
    /** Unmatched only: the Parent Category whose "Other" Leaf receives the Batch. */
    parentCategoryId: z.uuid().optional(),
    /** Unmatched only: where the name came from (a Scan Mode or typed); defaults to manual. */
    source: z.enum(BATCH_SOURCES).optional(),
    quantity: quantity.nullish(),
    unit: z.enum(ingredientUnit.enumValues).nullish(),
    location: z.enum(storageLocation.enumValues).optional(),
    expiryDate: isoDate.nullish(),
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
/**
 * Edit a Batch. Only the fields sent change; `quantity`, `productDescription`
 * and `expiryDate` accept null to clear. What a Batch matches (its Ingredient)
 * is not editable: delete it and add a new one.
 */
export const updateBatchBody = z
  .object({
    quantity: quantity.nullable().optional(),
    unit: z.enum(ingredientUnit.enumValues).nullable().optional(),
    location: z.enum(storageLocation.enumValues).optional(),
    expiryDate: isoDate.nullable().optional(),
    productDescription: z.string().trim().max(200).nullable().optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, {
    message: 'at least one field to change',
  });
export type UpdateBatchBody = z.infer<typeof updateBatchBody>;

export const batchIdParam = z.object({ id: z.uuid() });
export type BatchIdParam = z.infer<typeof batchIdParam>;

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
  /** Derived, never stored: expiry is within the Family's Stale Threshold (or already past). */
  expiringSoon: boolean;
  createdAt: Date;
};
