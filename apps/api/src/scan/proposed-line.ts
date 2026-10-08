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
  /** The text the Scan read for this line (receipt text, product label), capped at 100 characters; null when the Scan has none (Plate). */
  sourceText: string | null;
  /** The Ingredient Match (localised, with Catalog defaults), or null when Unmatched. */
  match: CatalogSearchResult | null;
  /** The image read itself was shaky: the Member should check the whole line. */
  lowConfidence: boolean;
  quantity: number | null;
  unit: (typeof ingredientUnit.enumValues)[number] | null;
  /** Best-before date read from the packaging, `YYYY-MM-DD`; null lets the Catalog default apply. */
  expiryDate: string | null;
  productDescription: string | null;
  /** Receipt Scan only: a line the Scan left out of the Pantry, with a reason code the client localises. Absent on lines proposed for saving. */
  excluded?: { reason: ExclusionReason };
};

/** The longest `name` and `sourceText` a proposed line carries (the Unmatched raw name limit of the Batch bulk create). */
export const MAX_RAW_NAME = 100;

/** Why a Receipt Scan line was left out of the Pantry. A closed set, never model free text. */
export type ExclusionReason = 'not_food' | 'fee' | 'deposit' | 'other';

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
    sourceText: result.productName.slice(0, MAX_RAW_NAME),
    match: matched ? match : null,
    lowConfidence: result.confidence < threshold,
    quantity: null,
    unit: null,
    expiryDate: result.expiryDate,
    productDescription: result.productName,
  };
}
