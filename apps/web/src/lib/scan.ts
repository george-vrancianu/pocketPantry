import { useMutation } from '@tanstack/react-query';
import { useRefreshCredits } from './credits';
import { ApiError, apiRequest } from './api';
import type { CatalogAllergen, CatalogSearchResult, Unit } from './catalog';
import type { Batch, NewBatch } from './pantry';

/** In mode-slider order. */
export const SCAN_MODES = [
  'receipt',
  'product',
  'ingredients',
  'plate',
] as const;
export type ScanMode = (typeof SCAN_MODES)[number];

export function isScanMode(value: string | null): value is ScanMode {
  return SCAN_MODES.some((mode) => mode === value);
}

/**
 * One line a Scan proposes to the Review screen. Every Scan Mode's endpoint
 * returns `{ lines: ProposedLine[] }`, so one Review screen serves them all.
 */
export type ProposedLine = {
  /** What the Scan read; saved as the raw name when the line stays Unmatched. */
  name: string;
  /** The text the Scan read for this line (receipt text, product label), or null when it has none (Plate). */
  sourceText: string | null;
  /** The Ingredient Match with its Catalog defaults, or null when Unmatched. */
  match: CatalogSearchResult | null;
  /** The image read was shaky: check the whole line. */
  lowConfidence: boolean;
  quantity: number | null;
  unit: Unit | null;
  /** `YYYY-MM-DD` read from the packaging, or null. */
  expiryDate: string | null;
  productDescription: string | null;
  /** Barcode card: the code the line was looked up by. Saving sends it, so the Family learns the Known Barcode. */
  barcode?: string;
  /** Barcode card: where the lookup's values came from, for attribution in Review. */
  source?: 'open_food_facts' | 'known_barcode';
  /** Barcode card: the Allergens Open Food Facts lists, and those the matched Ingredient is not tagged with. */
  allergens?: CatalogAllergen[];
  missingAllergens?: CatalogAllergen[];
  /** Receipt Scan: the line was left out of the Pantry; the reason is a code the client localises. */
  excluded?: { reason: ExclusionReason };
};

/** Why Receipt Scan left a line out of the Pantry. */
export type ExclusionReason = 'not_food' | 'fee' | 'deposit' | 'other';

export type ScanResponse = {
  lines: ProposedLine[];
};

/** The query string (with its `?`, or empty) of a Scan or of saving its lines; `scanLanguage` is left out when none is picked. */
export function scanQuery(scanLanguage?: string) {
  return scanLanguage ? `?${new URLSearchParams({ scanLanguage })}` : '';
}

/** Product Scan: the photo goes up as a data URL and is never stored. */
export function useProductScan(scanLanguage: string) {
  const refreshCredits = useRefreshCredits();
  return useMutation({
    onSettled: () => void refreshCredits(),
    mutationFn: (productImage: string) =>
      apiRequest<ScanResponse>(`/scan/product${scanQuery(scanLanguage)}`, {
        method: 'POST',
        body: { productImage },
      }),
  });
}

/**
 * A Product Scan owned by the form that asked for it, not by the Scan Session: the first line the
 * photo yields. The Scan Cap and every other failure reach the caller as an `ApiError`.
 */
export function useProductRead() {
  const refreshCredits = useRefreshCredits();
  return useMutation({
    onSettled: () => void refreshCredits(),
    mutationFn: async (read: {
      image: string;
      scanLanguage: string | undefined;
    }) => {
      const { lines } = await apiRequest<ScanResponse>(
        `/scan/product${scanQuery(read.scanLanguage)}`,
        { method: 'POST', body: { productImage: read.image } },
      );
      if (lines.length === 0) throw new ApiError('scan.product_not_found', 0);
      return lines[0];
    },
  });
}

/** The bulk Batch create takes at most this many entries at once. */
export const MAX_BULK_BATCHES = 50;

/** Saves reviewed lines as Batches, all or none; `scanLanguage` is what the lines were scanned in. */
export const postBatches = (
  scanLanguage: string | undefined,
  batches: NewBatch[],
) =>
  apiRequest<{ batches: Batch[] }>(
    `/pantry/batches/bulk${scanQuery(scanLanguage)}`,
    { method: 'POST', body: { batches } },
  );
