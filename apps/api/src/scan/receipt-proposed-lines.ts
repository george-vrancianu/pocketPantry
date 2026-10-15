import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { ReceiptScanResult } from './receipt-scan.schemas';
import {
  MAX_RAW_NAME,
  applyThreshold,
  type ExclusionReason,
  type ProposedLine,
} from './proposed-line';
import { toPantryQuantity } from './receipt-quantity';

type ReceiptLine = ReceiptScanResult['lines'][number];

/** The Catalog Ingredient for a line; `exact` when found by exact name lookup rather than named by the model. */
export type ResolvedMatch = { match: CatalogSearchResult; exact: boolean };

/** Lines that are part of the receipt's arithmetic, never worth showing on Review. */
const ARITHMETIC_LINES: ReadonlySet<ReceiptLine['lineType']> = new Set([
  'subtotal',
  'total',
  'tax',
  'payment',
  'discount',
]);

/** From what kind of line it is, never from the model's wording. */
function exclusionReason(lineType: ReceiptLine['lineType']): ExclusionReason {
  switch (lineType) {
    case 'fee':
    case 'deposit':
      return lineType;
    case 'product':
      return 'not_food';
    default:
      return 'other';
  }
}

/**
 * A Receipt Scan result as proposed lines for the Review screen, in receipt
 * order. Arithmetic lines (totals, tax, payment, discounts) are dropped; other
 * lines the Scan left out of the Pantry stay, marked `excluded` with their
 * reason code, so the Member can re-include them. `resolve` supplies the validated
 * Catalog Ingredient for a line. A model Match below `threshold` is dropped,
 * which makes the line Unmatched; a Match found by exact name is kept.
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
          sourceText: line.sourceText.slice(0, MAX_RAW_NAME),
          match: null,
          lowConfidence: false,
          quantity: null,
          unit: null,
          expiryDate: null,
          productDescription: null,
          excluded: { reason: exclusionReason(line.lineType) },
        };
      }
      const resolved = resolve(line);
      return {
        name: (line.fallbackIngredientName ?? line.sourceText).slice(
          0,
          MAX_RAW_NAME,
        ),
        sourceText: line.sourceText.slice(0, MAX_RAW_NAME),
        ...applyThreshold(
          resolved?.match ?? null,
          {
            // Not scored by the model, so it always passes.
            matchConfidence: resolved?.exact ? Infinity : line.matchConfidence,
            confidence: line.confidence,
          },
          threshold,
        ),
        ...toPantryQuantity(line.quantity, line.unit),
        expiryDate: null,
        productDescription: line.productName,
      };
    });
}
