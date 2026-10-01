import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { ingredientUnit } from '../database/schema';
import type { ReceiptScanResult } from './receipt-scan.schemas';
import type { ProposedLine } from './proposed-line';

type PantryUnit = (typeof ingredientUnit.enumValues)[number];
type ReceiptLine = ReceiptScanResult['lines'][number];

/** The Catalog Ingredient for a line, and whether it was guessed by name search rather than named by the model. */
export type ResolvedMatch = { match: CatalogSearchResult; guessed: boolean };

/** Lines that are part of the receipt's arithmetic, never worth showing on Review. */
const ARITHMETIC_LINES: ReadonlySet<ReceiptLine['lineType']> = new Set([
  'subtotal',
  'total',
  'tax',
  'payment',
  'discount',
]);

const MAX_RAW_NAME = 100;

/** Receipt units onto the Pantry's units; anything else yields no quantity. */
function toPantryQuantity(
  quantity: number | null,
  unit: string | null,
): { quantity: number | null; unit: PantryUnit | null } {
  if (quantity === null || unit === null) return { quantity: null, unit: null };
  const scaled = (factor: number, to: PantryUnit) => ({
    quantity: Math.round(quantity * factor * 1000) / 1000,
    unit: to,
  });
  const converted = (() => {
    switch (unit) {
      case 'g':
      case 'kg':
      case 'ml':
      case 'l':
        return scaled(1, unit);
      case 'item':
        return scaled(1, 'pcs');
      case 'cl':
        return scaled(10, 'ml');
      case 'mg':
        return scaled(0.001, 'g');
      default:
        return null;
    }
  })();
  // numeric(10,3) on the Batch: a quantity that rounds to nothing is no quantity.
  return converted && converted.quantity >= 0.001
    ? converted
    : { quantity: null, unit: null };
}

/**
 * A Receipt Scan result as proposed lines for the Review screen, in receipt
 * order. Arithmetic lines (totals, tax, payment, discounts) are dropped; other
 * lines the Scan left out of the Pantry stay, marked `excluded` with their
 * reason, so the Member can re-include them. `resolve` supplies the validated
 * Catalog Ingredient for a line. A model Match below `threshold` is dropped,
 * which makes the line Unmatched; a guessed Match is kept but flagged.
 */
export function receiptProposedLines(
  result: ReceiptScanResult,
  resolve: (line: ReceiptLine) => ResolvedMatch | null,
  threshold: number,
): ProposedLine[] {
  return result.lines
    .filter((line) => !ARITHMETIC_LINES.has(line.lineType))
    .map((line): ProposedLine => {
      if (!line.includeInPantry) {
        return {
          name: (line.productName ?? line.sourceText).slice(0, MAX_RAW_NAME),
          match: null,
          matchConfidence: 0,
          unmatched: true,
          lowConfidence: false,
          quantity: null,
          unit: null,
          expiryDate: null,
          productDescription: null,
          excluded: { reason: line.exclusionReason },
        };
      }
      const resolved = resolve(line);
      const confident =
        resolved !== null &&
        (resolved.guessed || line.matchConfidence >= threshold);
      return {
        name: line.fallbackIngredientName ?? line.sourceText,
        match: confident ? resolved.match : null,
        // A guess has no model confidence; it sits at the threshold and is flagged.
        matchConfidence: !confident
          ? 0
          : resolved.guessed
            ? threshold
            : line.matchConfidence,
        unmatched: !confident,
        lowConfidence:
          line.confidence < threshold || (confident && resolved.guessed),
        ...toPantryQuantity(line.quantity, line.unit),
        expiryDate: null,
        productDescription: line.productName,
      };
    });
}
