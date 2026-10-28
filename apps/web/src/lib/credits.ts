import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { ApiError, apiRequest } from './api';

/** The kinds of read a Credit Price is set for. */
export type CreditPriceKind =
  'scan' | 'voice' | 'assistant' | 'link-page' | 'link-text' | 'guidance';

/** `GET /api/credits`: the Family's Credit Balance and what each kind of read costs. */
export type Credits = {
  balance: number;
  prices: Record<CreditPriceKind, number>;
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
