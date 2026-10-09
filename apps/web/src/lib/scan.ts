import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult, Unit } from './catalog';
import type { Batch, NewBatch } from './pantry';

export const SCAN_MODES = [
  'product',
  'receipt',
  'plate',
  'ingredients',
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
  /** Receipt Scan: the line was left out of the Pantry; the reason is a code the client localises. */
  excluded?: { reason: ExclusionReason };
};

/** Why Receipt Scan left a line out of the Pantry. */
export type ExclusionReason = 'not_food' | 'fee' | 'deposit' | 'other';

export type ScanResponse = { lines: ProposedLine[] };

/** The query string of a Scan or of saving its lines; `scanLanguage` is left out when the lines were not scanned. */
export function scanQuery(locale: string, scanLanguage?: string) {
  return new URLSearchParams({
    locale,
    ...(scanLanguage ? { scanLanguage } : {}),
  });
}

/** Product Scan: the photo goes up as a data URL and is never stored. */
export function useProductScan(locale: string, scanLanguage: string) {
  return useMutation({
    mutationFn: (productImage: string) =>
      apiRequest<ScanResponse>(
        `/scan/product?${scanQuery(locale, scanLanguage)}`,
        { method: 'POST', body: { productImage } },
      ),
  });
}

/** The bulk Batch create takes at most this many entries at once. */
export const MAX_BULK_BATCHES = 50;

/** Saves reviewed lines as Batches, all or none. */
export function useAddBatches(locale: string, scanLanguage?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batches: NewBatch[]) =>
      apiRequest<{ batches: Batch[] }>(
        `/pantry/batches/bulk?${scanQuery(locale, scanLanguage)}`,
        { method: 'POST', body: { batches } },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry'] }),
  });
}
