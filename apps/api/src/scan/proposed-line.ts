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

/** Why a Receipt Scan line was left out of the Pantry. A closed set, never model free text. */
export type ExclusionReason = 'not_food' | 'fee' | 'deposit' | 'other';

export type ScanResponse = { lines: ProposedLine[] };

/**
 * The confidence rules every Scan Mode shares. A Match whose confidence falls
 * below `threshold` is dropped (the line becomes Unmatched), as is a missing
 * one; an image read below `threshold` is flagged low-confidence.
 */
export function applyThreshold(
  match: CatalogSearchResult | null,
  item: { matchConfidence: number; confidence: number },
  threshold: number,
): Pick<ProposedLine, 'match' | 'lowConfidence'> {
  return {
    match: match !== null && item.matchConfidence >= threshold ? match : null,
    lowConfidence: item.confidence < threshold,
  };
}

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
  return {
    name: result.fallbackIngredientName,
    ...applyThreshold(match, result, threshold),
    quantity: null,
    unit: null,
    expiryDate: result.expiryDate,
    productDescription: result.productName,
  };
}
