import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { StorageLocation } from './catalog';
import { defaultExpiryDate, type Unit } from './pantry';

/** A proposed Batch for one checked Shopping Item, pre-filled from the Catalog. */
export type FinishProposalLine = {
  itemId: string;
  name: string;
  unmatched: boolean;
  quantity: number | null;
  unit: Unit | null;
  location: StorageLocation;
  /** `YYYY-MM-DD`, or null when the Catalog has no Default Expiry. */
  expiryDate: string | null;
};

export type FinishProposal = { listId: string; lines: FinishProposalLine[] };

export type FinishLine = {
  itemId: string;
  quantity: number | null;
  unit: Unit | null;
  location: StorageLocation;
  expiryDate: string | null;
};

export type FinishRequest = {
  /** The list the proposal was built from; the API answers 409 if it is no longer active. */
  listId: string;
  lines: FinishLine[];
  droppedItemIds: string[];
};

/** The proposal is a snapshot to edit, so it is fetched once per Review and never refetched. */
export function useFinishProposal(locale: string) {
  const today = defaultExpiryDate(0, new Date());
  return useQuery({
    queryKey: ['finish-shopping-proposal', locale],
    queryFn: () =>
      apiRequest<FinishProposal>(
        `/shopping-list/finish?${new URLSearchParams({ locale, today })}`,
      ),
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

export function useFinishShopping() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: FinishRequest) =>
      apiRequest<{ listId: string; batchCount: number }>(
        '/shopping-list/finish',
        { method: 'POST', body: request },
      ),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['shopping-list'] }),
        queryClient.invalidateQueries({ queryKey: ['pantry'] }),
      ]),
  });
}
