import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Batch, NewBatch } from './pantry';
import type { ScanResponse } from './scan';

/** Receipt Scan: the photo goes up as a data URL and is never stored. */
export function useReceiptScan(locale: string) {
  return useMutation({
    mutationFn: (receiptImage: string) =>
      apiRequest<ScanResponse>(
        `/scan/receipt?${new URLSearchParams({ locale })}`,
        { method: 'POST', body: { receiptImage } },
      ),
  });
}

type ReceiptConfirmation = {
  batches: Batch[];
  /** Unchecked Shopping Items on the active list that the saved Batches match. */
  matchedShoppingItemIds: string[];
};

/**
 * Saves the reviewed receipt lines as Batches, all or none, then ticks the
 * Shopping Items the server says they match. A tick that fails does not undo
 * the save: the Batches are in the Pantry either way.
 */
export function useReceiptConfirm(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batches: NewBatch[]) => {
      const query = new URLSearchParams({ locale });
      const result = await apiRequest<ReceiptConfirmation>(
        `/scan/receipt/confirm?${query}`,
        { method: 'POST', body: { batches } },
      );
      await Promise.allSettled(
        result.matchedShoppingItemIds.map((id) =>
          apiRequest(`/shopping-list/items/${id}?${query}`, {
            method: 'PATCH',
            body: { checked: true },
          }),
        ),
      );
      return result;
    },
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
        queryClient.invalidateQueries({ queryKey: ['shopping-list'] }),
      ]),
  });
}
