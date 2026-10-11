import { z } from 'zod';
import { ingredientUnit } from '../database/schema';
import { MAX_QUANTITY } from '../common/quantity';
import type { AisleView } from './ingredient-placement';

export type StapleUnit = (typeof ingredientUnit.enumValues)[number];

/** At most this many Staples per Family. */
export const MAX_STAPLES = 200;

const preferredQuantity = z.number().positive().max(MAX_QUANTITY);
const preferredUnit = z.enum(ingredientUnit.enumValues);

export const addStapleBody = z
  .object({
    ingredientId: z.uuid(),
    quantity: preferredQuantity.nullish(),
    unit: preferredUnit.nullish(),
  })
  .refine((body) => body.quantity == null || body.unit != null, {
    message: 'unit is required when quantity is set',
    path: ['unit'],
  });
export type AddStapleBody = z.infer<typeof addStapleBody>;

/** Both fields replace the preferred values; `null` clears them. */
export const updateStapleBody = z
  .object({
    quantity: preferredQuantity.nullable(),
    unit: preferredUnit.nullable(),
  })
  .refine((body) => body.quantity === null || body.unit !== null, {
    message: 'unit is required when quantity is set',
    path: ['unit'],
  });
export type UpdateStapleBody = z.infer<typeof updateStapleBody>;

export const stapleIdParam = z.object({ id: z.uuid() });

export type StapleView = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number | null;
  unit: StapleUnit | null;
  aisle: AisleView | null;
};
