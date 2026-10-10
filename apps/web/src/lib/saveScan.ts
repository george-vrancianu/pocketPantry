import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toNewShoppingItem, postShoppingItems } from './plate';
import { postReceiptConfirm, type TickFailures } from './receiptScan';
import { postBatches, type ScanMode } from './scan';
import { reviewLinesOf, toSaveBatches, type ReviewLine } from './review';
import type { ScanLanguage } from '../i18n/resources';
import type { SessionScan } from './scanSession';
import { shoppingListQueryKey } from './shopping';

/**
 * Saves reviewed lines as their Scan Mode does: Product and Ingredients through the bulk Batch
 * endpoint, Receipt through Receipt confirm, Plate to the Shopping List. Only Receipt can come
 * back with Shopping Items it failed to tick.
 */
export async function saveLines(
  mode: ScanMode,
  locale: string,
  scanLanguage: ScanLanguage | undefined,
  lines: ReviewLine[],
): Promise<TickFailures | undefined> {
  if (mode === 'plate') {
    await postShoppingItems(locale, lines.map(toNewShoppingItem));
  } else if (mode === 'receipt') {
    const { tickFailures } = await postReceiptConfirm(
      locale,
      scanLanguage,
      toSaveBatches(lines, mode),
    );
    return tickFailures;
  } else {
    await postBatches(locale, scanLanguage, toSaveBatches(lines, mode));
  }
}

/** The save as a mutation: it refreshes the Pantry and the Shopping List when it lands. */
export function useSaveLines(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (save: {
      mode: ScanMode;
      scanLanguage?: ScanLanguage;
      lines: ReviewLine[];
    }) => saveLines(save.mode, locale, save.scanLanguage, save.lines),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
        queryClient.invalidateQueries({ queryKey: shoppingListQueryKey }),
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
export function useSaveScan(locale: string) {
  const { mutateAsync } = useSaveLines(locale);
  return (scan: SessionScan) =>
    mutateAsync({
      mode: scan.mode,
      scanLanguage: scan.scanLanguage,
      lines: savableLines(scan),
    });
}
