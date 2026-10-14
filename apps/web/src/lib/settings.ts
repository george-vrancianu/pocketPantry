import type { ThemeId } from '@pocket-pantry/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { recipeMatchingQueryKeys } from './queryKeys';
import type { Locale } from '../i18n/resources';

export type ExpiryOverride = {
  categoryId: string;
  name: string;
  days: number;
};

export type FamilySettings = {
  staleThresholdDays: number;
  expiryOverrides: ExpiryOverride[];
};

export type CategoryOptions = {
  parents: {
    id: string;
    name: string;
    leaves: { id: string; name: string }[];
  }[];
};

/** `null` means never chosen: the default applies. */
export type MemberPreferences = {
  locale: Locale | null;
  theme: ThemeId | null;
};

export const preferencesQueryKey = ['settings', 'preferences'] as const;

const localeParams = (locale: string) => new URLSearchParams({ locale });

export function useFamilySettings(locale: string) {
  return useQuery({
    queryKey: ['settings', 'family', locale],
    queryFn: () =>
      apiRequest<FamilySettings>(`/settings/family?${localeParams(locale)}`),
  });
}

/** The API's default Stale Threshold, used for expiry tags until Family Settings have loaded (or if they fail). */
const DEFAULT_STALE_THRESHOLD_DAYS = 3;

/** The Family's Stale Threshold, which colours every expiry tag. Changing it re-colours them on the next render. */
export function useStaleThresholdDays(locale: string): number {
  return (
    useFamilySettings(locale).data?.staleThresholdDays ??
    DEFAULT_STALE_THRESHOLD_DAYS
  );
}

export function useCategoryOptions(locale: string) {
  return useQuery({
    queryKey: ['settings', 'categories', locale],
    queryFn: () =>
      apiRequest<CategoryOptions>(
        `/settings/categories?${localeParams(locale)}`,
      ),
    staleTime: 5 * 60_000,
  });
}

/** Anything derived from Family Settings (expiry tags, form pre-fill) must refetch after a change. */
function useRefreshAfterFamilyChange() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['settings', 'family'] }),
      queryClient.invalidateQueries({ queryKey: ['pantry'] }),
      queryClient.invalidateQueries({ queryKey: ['catalog-search'] }),
      ...recipeMatchingQueryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    ]);
}

export function useSetStaleThreshold() {
  const refresh = useRefreshAfterFamilyChange();
  return useMutation({
    mutationFn: (staleThresholdDays: number) =>
      apiRequest('/settings/family', {
        method: 'PATCH',
        body: { staleThresholdDays },
      }),
    onSuccess: refresh,
  });
}

export function useSetExpiryOverride() {
  const refresh = useRefreshAfterFamilyChange();
  return useMutation({
    mutationFn: (input: { categoryId: string; days: number }) =>
      apiRequest(`/settings/family/expiry-overrides/${input.categoryId}`, {
        method: 'PUT',
        body: { days: input.days },
      }),
    onSuccess: refresh,
  });
}

export function useRemoveExpiryOverride() {
  const refresh = useRefreshAfterFamilyChange();
  return useMutation({
    mutationFn: (categoryId: string) =>
      apiRequest(`/settings/family/expiry-overrides/${categoryId}`, {
        method: 'DELETE',
      }),
    onSuccess: refresh,
  });
}

export function useMemberPreferences() {
  return useQuery({
    queryKey: preferencesQueryKey,
    queryFn: () => apiRequest<MemberPreferences>('/settings/preferences'),
    retry: false,
  });
}

export function useSaveLocale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (locale: Locale) =>
      apiRequest<MemberPreferences>('/settings/preferences', {
        method: 'PUT',
        body: { locale },
      }),
    onSuccess: (saved) => queryClient.setQueryData(preferencesQueryKey, saved),
  });
}
