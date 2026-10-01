import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { CatalogSearchResult } from './catalog';
import type { Batch, NewBatch, Unit } from './pantry';

export type ScanMode = 'product' | 'receipt' | 'plate' | 'ingredients';
export const SCAN_MODES: ScanMode[] = [
  'product',
  'receipt',
  'plate',
  'ingredients',
];
/** Scan Modes that are wired end to end. The others show their pill but cannot scan yet. */
export const WIRED_SCAN_MODES: ScanMode[] = ['product'];

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
  /** The Ingredient Match with its Catalog defaults, or null when Unmatched. */
  match: CatalogSearchResult | null;
  matchConfidence: number;
  unmatched: boolean;
  /** The image read was shaky: check the whole line. */
  lowConfidence: boolean;
  quantity: number | null;
  unit: Unit | null;
  /** `YYYY-MM-DD` read from the packaging, or null. */
  expiryDate: string | null;
  productDescription: string | null;
};

export type ScanResponse = { lines: ProposedLine[] };

/** Product Scan: the photo goes up as a data URL and is never stored. */
export function useProductScan(locale: string) {
  return useMutation({
    mutationFn: (productImage: string) =>
      apiRequest<ScanResponse>(
        `/scan/product?${new URLSearchParams({ locale })}`,
        { method: 'POST', body: { productImage } },
      ),
  });
}

/** Saves reviewed lines as Batches, all or none. */
export function useAddBatches(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batches: NewBatch[]) =>
      apiRequest<{ batches: Batch[] }>(
        `/pantry/batches/bulk?${new URLSearchParams({ locale })}`,
        { method: 'POST', body: { batches } },
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pantry'] }),
  });
}
