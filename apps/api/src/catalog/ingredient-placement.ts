import { eq, inArray } from 'drizzle-orm';
import type { CatalogScope } from './catalog-scope';
import type { CatalogLocale } from './catalog.schemas';
import { readAmountScale, type AmountScale } from './amount-scale';
import { loadDisplayNames } from './display-names';
import type { Executor } from '../database/database.types';
import {
  aisles,
  ingredientUnit,
  leafCategories,
  parentCategories,
} from '../database/schema';

export type AisleView = { id: string; name: string; sortOrder: number };

export type IngredientPlacement = {
  name: string;
  aisle: AisleView | null;
  /** The Ingredient's own unit: what a line with no unit yet opens on. */
  defaultUnit: (typeof ingredientUnit.enumValues)[number];
  amountScale: AmountScale;
};

/** Localised name and Aisle of each Ingredient, for lists shown in shop order. */
export async function loadIngredientPlacements(
  executor: Executor,
  scope: CatalogScope,
  locale: CatalogLocale,
  ingredientIds: string[],
): Promise<Map<string, IngredientPlacement>> {
  if (ingredientIds.length === 0) return new Map();
  const ingredients = scope.ingredients(executor);
  const rows = await executor
    .select({
      id: ingredients.id,
      name: ingredients.name,
      aisleId: aisles.id,
      aisleName: aisles.name,
      aisleSortOrder: aisles.sortOrder,
      defaultUnit: ingredients.defaultUnit,
      amountScale: ingredients.amountScale,
    })
    .from(ingredients)
    .innerJoin(
      leafCategories,
      eq(ingredients.leafCategoryId, leafCategories.id),
    )
    .innerJoin(
      parentCategories,
      eq(leafCategories.parentId, parentCategories.id),
    )
    .innerJoin(aisles, eq(parentCategories.aisleId, aisles.id))
    .where(inArray(ingredients.id, ingredientIds));
  const { pick } = await loadDisplayNames(executor, scope, locale, [
    ...rows.flatMap((row) => [row.id, row.aisleId]),
  ]);
  return new Map(
    rows.map((row) => [
      row.id,
      {
        name: pick('ingredient', row.id, row.name),
        aisle: {
          id: row.aisleId,
          name: pick('aisle', row.aisleId, row.aisleName),
          sortOrder: row.aisleSortOrder,
        },
        defaultUnit: row.defaultUnit,
        amountScale: readAmountScale(row.amountScale),
      },
    ]),
  );
}

/** Aisle order, then name; an Ingredient without an Aisle comes last. */
export function byShopOrder<
  T extends { name: string; aisle: AisleView | null },
>(a: T, b: T): number {
  return (
    (a.aisle?.sortOrder ?? Infinity) - (b.aisle?.sortOrder ?? Infinity) ||
    a.name.localeCompare(b.name)
  );
}
