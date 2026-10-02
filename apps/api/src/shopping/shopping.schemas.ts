import { z } from 'zod';
import { catalogSearchQuery } from '../catalog/catalog.schemas';
import { ingredientUnit } from '../database/schema';
import { SHOPPING_ITEM_SOURCES } from '../unmatched/unmatched-entries';
import { MAX_QUANTITY } from '../common/quantity';

export type ShoppingUnit = (typeof ingredientUnit.enumValues)[number];

export const shoppingLocaleQuery = catalogSearchQuery.pick({ locale: true });
export type ShoppingLocaleQuery = z.infer<typeof shoppingLocaleQuery>;

/** Either a Catalog Match (`ingredientId`) or a typed `name` for an Unmatched item. */
export const addShoppingItemBody = z
  .object({
    ingredientId: z.uuid().optional(),
    name: z.string().trim().min(1).max(100).optional(),
    quantity: z.number().positive().max(MAX_QUANTITY).optional(),
    unit: z.enum(ingredientUnit.enumValues).optional(),
    /** Unmatched names only: where the name came from; defaults to manual. */
    source: z.enum(SHOPPING_ITEM_SOURCES).optional(),
  })
  .refine(
    (body) => (body.ingredientId === undefined) !== (body.name === undefined),
    { message: 'Provide either ingredientId or name', path: ['ingredientId'] },
  );
export type AddShoppingItemBody = z.infer<typeof addShoppingItemBody>;

/** Plate Scan confirms its lines in one go; all lines are added or none. */
export const MAX_BULK_SHOPPING_ITEMS = 100;
export const addShoppingItemsBody = z.object({
  items: z.array(addShoppingItemBody).min(1).max(MAX_BULK_SHOPPING_ITEMS),
});
export type AddShoppingItemsBody = z.infer<typeof addShoppingItemsBody>;

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
