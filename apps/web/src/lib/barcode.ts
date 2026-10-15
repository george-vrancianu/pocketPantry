import { useMutation } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult, Unit } from './catalog';
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
      productDescription: string;
      quantity: number | null;
      unit: Unit | null;
    };

/** A Barcode Lookup owned by the form that asked for it. */
export function useBarcodeLookup(locale: string) {
  return useMutation({
    mutationFn: (code: string) =>
      apiRequest<BarcodeLookup>(
        `/barcode-lookup/${code}?${new URLSearchParams({ locale })}`,
      ),
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
