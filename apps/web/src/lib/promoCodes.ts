import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { apiRequest } from './api';

export type PromoCodeStatus = 'unused' | 'redeemed' | 'revoked';

export type PromoCodeEntry = {
  id: string;
  /** Shown and copied as `XXXXX-XXXXX`. */
  code: string;
  credits: number;
  note: string | null;
  createdAt: string;
  status: PromoCodeStatus;
  redeemedAt: string | null;
  redeemedByName: string | null;
  redeemedByEmail: string | null;
  /** May name a Family that no longer exists. */
  redeemedFamilyId: string | null;
};

export type PromoCodeInput = { count: number; credits: number; note?: string };

const listKey = ['admin-promo-codes'] as const;

type Page = { entries: PromoCodeEntry[]; nextCursor: string | null };

/** Newest first, one page at a time; `status` undefined lists every Promo Code. */
export function usePromoCodes(status: PromoCodeStatus | undefined) {
  return useInfiniteQuery({
    queryKey: [...listKey, status ?? 'all'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      apiRequest<Page>(
        `/admin/promo-codes?${new URLSearchParams({
          ...(status ? { status } : {}),
          ...(pageParam ? { cursor: pageParam } : {}),
        })}`,
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    select: (data) => data.pages.flatMap((page) => page.entries),
  });
}

export function useGeneratePromoCodes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PromoCodeInput) =>
      apiRequest<{ codes: string[] }>('/admin/promo-codes', {
        method: 'POST',
        body: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey }),
  });
}

export function useRevokePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<PromoCodeEntry>(`/admin/promo-codes/${id}/revoke`, {
        method: 'POST',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey }),
  });
}
