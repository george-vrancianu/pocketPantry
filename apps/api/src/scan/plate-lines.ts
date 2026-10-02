import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import { ingredientUnit } from '../database/schema';
import type { ProposedLine } from './proposed-line';

/** The fields of a validated Plate Ingredient that shape its proposed line. */
export type PlateIngredient = {
  fallbackIngredientName: string;
  matchedIngredientId: string | null;
  matchConfidence: number;
  confidence: number;
  quantity: number | null;
  unit: string | null;
};

type Unit = (typeof ingredientUnit.enumValues)[number];
const isUnit = (value: string | null): value is Unit =>
  ingredientUnit.enumValues.some((unit) => unit === value);

/**
 * A Plate Ingredient as one proposed line, quantities for one serving. As for
 * Product Scan, a Match below `threshold` (or none) leaves the line Unmatched.
 * An unknown unit falls back to the Match's default unit, and with neither the
 * quantity is dropped rather than guessed.
 */
export function plateLine(
  item: PlateIngredient,
  match: CatalogSearchResult | null,
  threshold: number,
): ProposedLine {
  const matched = match !== null && item.matchConfidence >= threshold;
  const unit =
    item.quantity === null
      ? null
      : isUnit(item.unit)
        ? item.unit
        : matched
          ? match.defaultUnit
          : null;
  return {
    name: item.fallbackIngredientName,
    match: matched ? match : null,
    lowConfidence: item.confidence < threshold,
    quantity: unit === null ? null : item.quantity,
    unit,
    expiryDate: null,
    productDescription: null,
  };
}
