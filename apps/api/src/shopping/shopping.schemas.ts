import { z } from 'zod';
import { CATALOG_LOCALES, FALLBACK_LOCALE } from '../catalog/catalog.schemas';
import type { ingredientUnit } from '../database/schema';
import { SHOPPING_ITEM_SOURCES } from '../unmatched/unmatched-entries';

export type ShoppingUnit = (typeof ingredientUnit.enumValues)[number];
const UNITS = ['g', 'kg', 'ml', 'l', 'pcs'] as const satisfies ShoppingUnit[];

export const shoppingLocaleQuery = z.object({
  locale: z.enum(CATALOG_LOCALES).default(FALLBACK_LOCALE),
});
export type ShoppingLocaleQuery = z.infer<typeof shoppingLocaleQuery>;

/** Either a Catalog Match (`ingredientId`) or a typed `name` for an Unmatched item. */
export const addShoppingItemBody = z
  .object({
    ingredientId: z.uuid().optional(),
    name: z.string().trim().min(1).max(100).optional(),
    quantity: z.number().positive().max(999_999).optional(),
    unit: z.enum(UNITS).optional(),
    /** Unmatched names only: where the name came from; defaults to manual. */
    source: z.enum(SHOPPING_ITEM_SOURCES).optional(),
  })
  .refine(
    (body) => (body.ingredientId === undefined) !== (body.name === undefined),
    { message: 'Provide either ingredientId or name', path: ['ingredientId'] },
  );
export type AddShoppingItemBody = z.infer<typeof addShoppingItemBody>;

export const setCheckedBody = z.object({ checked: z.boolean() });
export type SetCheckedBody = z.infer<typeof setCheckedBody>;

export const itemIdParam = z.object({ id: z.uuid() });

export type ShoppingItemView = {
  id: string;
  name: string;
  quantity: number | null;
  unit: ShoppingUnit | null;
  checked: boolean;
  /** True when the name never matched a Catalog Ingredient. */
  unmatched: boolean;
};

export type ShoppingGroupView = {
  /** Null for the trailing group of Unmatched Shopping Items. */
  aisle: { id: string; name: string; sortOrder: number } | null;
  items: ShoppingItemView[];
};

export type ShoppingListView = {
  id: string;
  groups: ShoppingGroupView[];
  summary: { remaining: number; checked: number };
};
