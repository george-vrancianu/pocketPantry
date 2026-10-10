import { useQueryClient } from '@tanstack/react-query';
import { postShoppingItems, toNewShoppingItem } from './plate';
import { postReceiptConfirm } from './receiptScan';
import { toReviewLine, toSaveBatches } from './review';
import { postBatches } from './scan';
import type { SessionScan } from './scanSession';
import { shoppingListQueryKey } from './shopping';

/**
 * Saves a read Scan as its Scan Mode does from the line editor: Product and Ingredients through
 * the bulk Batch endpoint, Receipt through Receipt confirm, Plate to the Shopping List. Lines the
 * Scan left out are not saved. Rejects when the save fails, leaving the Scan unsaved.
 */
export function useSaveScan(locale: string) {
  const queryClient = useQueryClient();
  return async (scan: SessionScan) => {
    const today = new Date();
    const lines = (scan.lines ?? [])
      .map((line, index) => toReviewLine(line, `line-${index}`, today))
      .filter((line) => line.excluded === null);
    if (scan.mode === 'plate') {
      await postShoppingItems(locale, lines.map(toNewShoppingItem));
    } else if (scan.mode === 'receipt') {
      await postReceiptConfirm(
        locale,
        scan.scanLanguage,
        toSaveBatches(lines, scan.mode),
      );
    } else {
      await postBatches(
        locale,
        scan.scanLanguage,
        toSaveBatches(lines, scan.mode),
      );
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['pantry'] }),
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey }),
    ]);
  };
}
