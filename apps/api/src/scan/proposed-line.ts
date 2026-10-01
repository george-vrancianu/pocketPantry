import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { ingredientUnit } from '../database/schema';
import type { ProductScanResult } from './product-scan.schemas';

/**
 * One line a Scan proposes to the Review screen. Every Scan Mode returns lines
 * of this shape, so one Review screen serves them all. Nothing is saved until
 * the Member confirms.
 */
export type ProposedLine = {
  /** What the Scan read, as a generic Ingredient name. Saved as the raw name when the line stays Unmatched. */
  name: string;
  /** The Ingredient Match (localised, with Catalog defaults), or null when Unmatched. */
  match: CatalogSearchResult | null;
  /** Confidence in the Match, 0 to 1; 0 when Unmatched. */
  matchConfidence: number;
  unmatched: boolean;
  /** The image read itself was shaky: the Member should check the whole line. */
  lowConfidence: boolean;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  /** Best-before date read from the packaging, `YYYY-MM-DD`; null lets the Catalog default apply. */
  expiryDate: string | null;
  productDescription: string | null;
  /** Receipt Scan only: a line the Scan left out of the Pantry (not food, or unreadable), with why. Absent on lines proposed for saving. */
  excluded?: { reason: string | null };
};

export type ScanResponse = { lines: ProposedLine[] };

/**
 * A Product Scan result as one proposed line. A Match whose confidence falls
 * below `threshold` is dropped, which makes the line Unmatched, as does having
 * no Match at all. `match` is the validated Catalog Ingredient for
 * `result.matchedIngredientId`, if any.
 */
export function productLine(
  result: ProductScanResult,
  match: CatalogSearchResult | null,
  threshold: number,
): ProposedLine {
  const matched = match !== null && result.matchConfidence >= threshold;
  return {
    name: result.fallbackIngredientName,
    match: matched ? match : null,
    matchConfidence: matched ? result.matchConfidence : 0,
    unmatched: !matched,
    lowConfidence: result.confidence < threshold,
    quantity: null,
    unit: null,
    expiryDate: result.expiryDate,
    productDescription: result.productName,
  };
}
