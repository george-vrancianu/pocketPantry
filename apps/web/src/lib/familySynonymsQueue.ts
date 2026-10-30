import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Locale } from '../i18n/resources';
import { adminCatalogQueryKey } from './admin';
import { ApiError, apiRequest } from './api';
import { catalogChangeQueryKeys } from './queryKeys';

/** One Family Synonym name on one Ingredient, across Families; no Family identity. */
export type FamilySynonymCandidate = {
  normalizedName: string;
  name: string;
  ingredient: { id: string; name: string };
  familyCount: number;
};

type Page = {
  /** Every candidate in the queue, not just this page. */
  total: number;
  candidates: FamilySynonymCandidate[];
  nextCursor: string | null;
};

export const familySynonymsQueueKey = ['admin-family-synonyms'] as const;

/** Candidates one page at a time, fetched only while `enabled`. */
export function useFamilySynonymsQueue(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: familySynonymsQueueKey,
    enabled,
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      apiRequest<Page>(
        `/admin/family-synonyms?${new URLSearchParams(
          pageParam ? { cursor: pageParam } : {},
        )}`,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // Counts move between pages, so a candidate can repeat: keep its first appearance.
    select: (data) => ({
      candidates: [
        ...new Map(
          data.pages
            .flatMap((page) => page.candidates)
            .map((candidate) => [
              `${candidate.normalizedName}|${candidate.ingredient.id}`,
              candidate,
            ]),
        ).values(),
      ],
      total: data.pages.at(-1)?.total ?? 0,
    }),
  });
}

export function useAddSharedSynonym() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      normalizedName: string;
      ingredientId: string;
      locale: Locale;
    }) =>
      apiRequest<{ ingredientId: string; name: string; locale: Locale }>(
        '/admin/family-synonyms/promote',
        { method: 'POST', body: input },
      ),
    // The candidate is gone (added by someone else): refresh the queue.
    onError: (error) => {
      if (error instanceof ApiError && error.status === 404) {
        void queryClient.invalidateQueries({
          queryKey: familySynonymsQueueKey,
        });
      }
    },
    // Every Family now finds the name, and the Family copies are gone.
    onSuccess: () =>
      Promise.all(
        [
          familySynonymsQueueKey,
          adminCatalogQueryKey,
          ...catalogChangeQueryKeys,
        ].map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      ),
  });
}
