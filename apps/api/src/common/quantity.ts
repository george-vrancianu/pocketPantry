import { z } from 'zod';

/** Largest quantity a Batch or Shopping Item may hold (the columns are numeric(10,3) on Batches and numeric(12,3) on Shopping Items; this is the tighter cap). */
export const MAX_QUANTITY = 1_000_000;

export const exceedsMaxQuantity = (quantity: number | null): boolean =>
  quantity !== null && quantity > MAX_QUANTITY;

/** A Batch quantity, numeric(10,3): at least 0.001 and at most 3 decimals, so storage never rounds. */
export const batchQuantity = z
  .number()
  .min(0.001)
  .max(MAX_QUANTITY)
  .refine((value) => Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6, {
    message: 'at most 3 decimals',
  });
