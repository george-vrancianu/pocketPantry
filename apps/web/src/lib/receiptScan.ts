import { useMutation } from '@tanstack/react-query';
import { ApiError, apiRequest } from './api';
import { scanQuery } from './scan';
import type { Batch, NewBatch } from './pantry';
import type { ReceiptSectionResult } from './receiptSections';

/** Receipt Scan: the photo goes up as a data URL and is never stored. */
export function useReceiptScan(locale: string, scanLanguage: string) {
  return useMutation({
    mutationFn: (receiptImage: string) =>
      apiRequest<ReceiptSectionResult>(
        `/scan/receipt?${scanQuery(locale, scanLanguage)}`,
        { method: 'POST', body: { receiptImage } },
      ),
  });
}

type ReceiptConfirmation = {
  batches: Batch[];
  /** Unchecked Shopping Items on the active list that the saved Batches match. */
  matchedShoppingItemIds: string[];
};

/** Shopping Items that could not be ticked after the save: removed from the list (404), the list changed under us (409 `shopping.list_changed`), or anything else. */
export type TickFailures = { missing: number; changed: number; other: number };

export type ReceiptConfirmResult = ReceiptConfirmation & {
  tickFailures: TickFailures;
};

export function countTickFailures(
  outcomes: PromiseSettledResult<unknown>[],
): TickFailures {
  const failures: TickFailures = { missing: 0, changed: 0, other: 0 };
  for (const outcome of outcomes) {
    if (outcome.status === 'fulfilled') continue;
    const reason: unknown = outcome.reason;
    if (reason instanceof ApiError && reason.status === 404) failures.missing++;
    else if (
      reason instanceof ApiError &&
      reason.code === 'shopping.list_changed'
    )
      failures.changed++;
    else failures.other++;
  }
  return failures;
}

/**
 * Saves the reviewed receipt lines as Batches, all or none, then ticks the
 * Shopping Items the server says they match. A tick that fails does not undo
 * the save: the Batches are in the Pantry either way. The failures come back
 * counted by kind so Review can say so.
 */
export async function postReceiptConfirm(
  locale: string,
  scanLanguage: string | undefined,
  batches: NewBatch[],
): Promise<ReceiptConfirmResult> {
  const result = await apiRequest<ReceiptConfirmation>(
    `/scan/receipt/confirm?${scanQuery(locale, scanLanguage)}`,
    { method: 'POST', body: { batches } },
  );
  const outcomes = await Promise.allSettled(
    result.matchedShoppingItemIds.map((id) =>
      apiRequest(
        `/shopping-list/items/${id}?${new URLSearchParams({ locale })}`,
        {
          method: 'PATCH',
          body: { checked: true },
        },
      ),
    ),
  );
  return { ...result, tickFailures: countTickFailures(outcomes) };
}
