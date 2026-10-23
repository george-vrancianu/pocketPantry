import { useMutation } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogAllergen, CatalogSearchResult, Unit } from './catalog';
import type { ProposedLine } from './scan';

/**
 * The API's answer to a Barcode Lookup (ADR 0013): a Prefill proposal, or not found. Not a Scan:
 * it has no Scan Language and never counts against the Scan Cap.
 */
export type BarcodeLookup =
  | { found: false }
  | {
      found: true;
      /** Where the values came from; only Open Food Facts is credited in the form. */
      source: 'open_food_facts' | 'known_barcode';
      /** The confident Catalog match, or null: then the Ingredient search is pre-typed. */
      match: CatalogSearchResult | null;
      lowConfidence: boolean;
      /** A Known Barcode saved under a typed name: the form fills exactly this name. */
      unmatchedName?: string;
      /**
       * The active Allergens Open Food Facts lists for the product. Empty means it lists none,
       * not that the product contains none.
       */
      allergens: CatalogAllergen[];
      /** The listed Allergens the matched Ingredient is not tagged with: an informational note. */
      missingAllergens: CatalogAllergen[];
      productDescription: string;
      quantity: number | null;
      unit: Unit | null;
    };

/** Looks a barcode up in Known Barcodes, then Open Food Facts. */
export const lookupBarcode = (code: string) =>
  apiRequest<BarcodeLookup>(`/barcode-lookup/${code}`);

/** A Barcode Lookup owned by the form that asked for it. */
export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (code: string) => lookupBarcode(code),
  });
}

/** A found lookup as the line Prefill writes into the form. */
export function barcodeLine(
  lookup: Extract<BarcodeLookup, { found: true }>,
): ProposedLine {
  return {
    name: lookup.unmatchedName ?? lookup.productDescription,
    sourceText: null,
    match: lookup.match,
    lowConfidence: lookup.lowConfidence,
    quantity: lookup.quantity,
    unit: lookup.unit,
    expiryDate: null,
    productDescription: lookup.productDescription,
  };
}

/**
 * The line a Barcode card proposes in Review: what Prefill would fill, plus the code (so saving
 * teaches the Known Barcode) and what Review needs for attribution and the Allergen row. Not
 * found gives one empty line for the Member to fill.
 */
export function barcodeCardLine(
  code: string,
  lookup: BarcodeLookup,
): ProposedLine {
  if (!lookup.found)
    return {
      name: '',
      sourceText: null,
      match: null,
      lowConfidence: false,
      quantity: null,
      unit: null,
      expiryDate: null,
      productDescription: null,
      barcode: code,
    };
  return {
    ...barcodeLine(lookup),
    barcode: code,
    source: lookup.source,
    allergens: lookup.allergens,
    missingAllergens: lookup.missingAllergens,
  };
}
