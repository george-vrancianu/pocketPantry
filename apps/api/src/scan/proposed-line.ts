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

const PACKAGE_UNITS: Record<string, NonNullable<ProposedLine['unit']>> = {
  g: 'g',
  gram: 'g',
  grams: 'g',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  millilitre: 'ml',
  millilitres: 'ml',
  l: 'l',
  liter: 'l',
  liters: 'l',
  litre: 'l',
  litres: 'l',
  pcs: 'pcs',
  pc: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
};

/** The package net amount as a quantity and unit; both null unless it is positive and in a supported unit. */
function packageQuantity(
  result: Pick<ProductScanResult, 'netQuantity' | 'netUnit'>,
): Pick<ProposedLine, 'quantity' | 'unit'> {
  const unit =
    result.netUnit === null
      ? undefined
      : PACKAGE_UNITS[result.netUnit.trim().toLowerCase().replaceAll('.', '')];
  if (!unit || result.netQuantity === null || !(result.netQuantity > 0)) {
    return { quantity: null, unit: null };
  }
  return { quantity: result.netQuantity, unit };
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
    sourceText: result.productName.slice(0, MAX_RAW_NAME),
    ...applyThreshold(match, result, threshold),
    ...packageQuantity(result),
    expiryDate: result.expiryDate,
    productDescription: result.productName,
  };
}
