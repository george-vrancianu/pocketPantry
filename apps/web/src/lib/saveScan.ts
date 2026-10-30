import {
  recipeMatchingQueryKeys,
  suggestionsQueryKey,
  templateDetailsQueryKey,
} from './queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postReceiptConfirm, type TickFailures } from './receiptScan';
import { postBatches } from './scan';
import type { CameraMode } from './cameraMode';
import { reviewLinesOf, toSaveBatches, type ReviewLine } from './review';
import type { ScanLanguage } from '../i18n/resources';
import type { SessionScan } from './scanSession';
import { shoppingListQueryKey } from './shopping';

/**
 * Saves reviewed lines as their mode does: Product, Barcode and Ingredients through the bulk Batch
 * endpoint, Receipt through Receipt confirm. Only Receipt can come
 * back with Shopping Items it failed to tick.
 */
export async function saveLines(
  mode: CameraMode,
  scanLanguage: ScanLanguage | undefined,
  lines: ReviewLine[],
): Promise<TickFailures | undefined> {
  // A Plate Scan never has lines to save: its picked dish is written as a Recipe Draft instead (ADR 0035).
  if (mode === 'plate') throw new Error('A Plate Scan has no lines to save');
  if (mode === 'receipt') {
    const { tickFailures } = await postReceiptConfirm(
      scanLanguage,
      toSaveBatches(lines, mode),
    );
    return tickFailures;
  } else {
    await postBatches(scanLanguage, toSaveBatches(lines, mode));
  }
}

/** The save as a mutation: it refreshes the Pantry and the Shopping List when it lands. */
export function useSaveLines() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (save: {
      mode: CameraMode;
      scanLanguage?: ScanLanguage;
      lines: ReviewLine[];
    }) => saveLines(save.mode, save.scanLanguage, save.lines),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
        queryClient.invalidateQueries({ queryKey: shoppingListQueryKey }),
        queryClient.invalidateQueries({ queryKey: suggestionsQueryKey }),
        ...recipeMatchingQueryKeys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
        queryClient.invalidateQueries({ queryKey: templateDetailsQueryKey }),
      ]),
  });
}

/** The lines of a Scan that would be saved: those it did not leave out. */
export const savableLines = (scan: SessionScan): ReviewLine[] =>
  reviewLinesOf(scan).filter((line) => line.excluded === null);

/**
 * Saves a read Scan the way the line editor would. Resolves with the Shopping Items it failed
 * to tick; rejects when the save fails, leaving the Scan unsaved.
 */
export function useSaveScan() {
  const { mutateAsync } = useSaveLines();
  return (scan: SessionScan) =>
    mutateAsync({
      mode: scan.mode,
      scanLanguage: scan.scanLanguage,
      lines: savableLines(scan),
    });
}
