import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { ApiError, apiRequest } from './api';

/** The kinds of read a Credit Price is set for. */
export type CreditPriceKind =
  'scan' | 'voice' | 'assistant' | 'link-page' | 'link-text' | 'guidance';

/** One entry of the Family's Credit history, as `GET /api/credits` words it. */
export type CreditHistoryEntry = {
  id: string;
  /** Only for a grant by hand: why, as the owner entered it. */
  reason: string | null;
  /** Signed: negative for a spend. */
  amount: number;
  /** Who spent, or whose Household of One moved in; null for grants and for a former Member. */
  memberName: string | null;
  formerMember: boolean;
  createdAt: string;
} & (
  | { kind: 'spend'; readKind: CreditPriceKind }
  | {
      kind: 'welcome_grant' | 'grant' | 'transfer_in' | 'transfer_out';
      readKind: null;
    }
);

/**
 * `GET /api/credits`: the Family's Credit Balance, what each kind of read costs, the balance at or below
 * which the low-balance notice shows, and the latest entries (newest first).
 */
export type Credits = {
  balance: number;
  prices: Record<CreditPriceKind, number>;
  lowBalanceThreshold: number;
  history: CreditHistoryEntry[];
};

/** The stable API error code of a read refused because the Family cannot pay for it. */
export const OUT_OF_CREDITS = 'credits.insufficient';

/** Whether an API error is the Credits refusal ("Out of Credits"), not a Cap. */
export const isOutOfCredits = (error: unknown) =>
  error instanceof ApiError && error.code === OUT_OF_CREDITS;

export const creditsQueryKey = ['credits'] as const;

export function useCredits() {
  return useQuery({
    queryKey: creditsQueryKey,
    queryFn: () => apiRequest<Credits>('/credits'),
  });
}

/** Marks the Credit Balance stale so the next look (or the one on screen) fetches it again. */
export function useRefreshCredits() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: creditsQueryKey }),
    [queryClient],
  );
}

/**
 * The Credit Price of a kind of read, from the same query as the balance (so a repricing shows up on
 * refetch). `undefined` while loading or when the read could not be fetched: show no price then.
 */
export function useCreditPrice(kind: CreditPriceKind): number | undefined {
  return useCredits().data?.prices[kind];
}
