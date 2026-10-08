import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { IngredientsScanResult } from './ingredients-scan.schemas';
import { MAX_RAW_NAME, type ProposedLine } from './proposed-line';

/**
 * One recognised item of an Ingredients Scan as a proposed line. Loose
 * ingredients carry no quantity, unit or expiry, so Review pre-fills the
 * Catalog defaults. A Match below `threshold` is dropped (the line becomes
 * Unmatched), as is a missing one. `match` is the validated Catalog Ingredient
 * for the item's `matchedIngredientId`, if any.
 */
export function ingredientsLine(
  item: IngredientsScanResult['items'][number],
  match: CatalogSearchResult | null,
  threshold: number,
): ProposedLine {
  const matched = match !== null && item.matchConfidence >= threshold;
  return {
    name: item.fallbackIngredientName,
    sourceText: item.productName.slice(0, MAX_RAW_NAME),
    match: matched ? match : null,
    lowConfidence: item.confidence < threshold,
    quantity: null,
    unit: null,
    expiryDate: null,
    productDescription: item.productName,
  };
}
