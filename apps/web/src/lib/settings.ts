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

/**
 * A category a Default Expiry override can target. `catalogDays` is the Catalog's default for it in
 * days (a Leaf without its own has its Parent's); `null` leaves the Catalog comparison out.
 */
export type CategoryOption = {
  id: string;
  name: string;
  catalogDays: number | null;
};

export type CategoryOptions = {
  parents: (CategoryOption & { leaves: CategoryOption[] })[];
};

/** `null` means never chosen: the default applies. */
export type MemberPreferences = {
  locale: Locale | null;
  theme: ThemeId | null;
};

export const preferencesQueryKey = ['settings', 'preferences'] as const;
/** Family Settings in every locale; add the locale for one query. */
export const familySettingsQueryKey = ['settings', 'family'] as const;

const localeParams = (locale: string) => new URLSearchParams({ locale });

export function useFamilySettings(locale: string) {
  return useQuery({
    queryKey: [...familySettingsQueryKey, locale],
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
      queryClient.invalidateQueries({ queryKey: familySettingsQueryKey }),
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
    // Only the locale this request saved; a Theme save may have landed meanwhile.
    onSuccess: (saved) =>
      queryClient.setQueryData<MemberPreferences>(preferencesQueryKey, (old) =>
        old ? { ...old, locale: saved.locale } : saved,
      ),
  });
}

/** An Allergen from the curated list, named in the Member's locale. */
export type AllergenOption = { id: string; name: string };

/** The Allergen list and which of them are the Member's own Allergies. */
export type Allergies = {
  allergens: AllergenOption[];
  allergenIds: string[];
};

export const allergiesQueryKey = ['settings', 'allergies'] as const;

export function useAllergies(locale: string) {
  return useQuery({
    queryKey: [...allergiesQueryKey, locale],
    queryFn: () =>
      apiRequest<Allergies>(`/settings/allergies?${localeParams(locale)}`),
  });
}

/** Replaces the Member's own Allergies. Every Recipe's Allergy Warning depends on them. */
export function useSaveAllergies(locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (allergenIds: string[]) =>
      apiRequest<Allergies>(`/settings/allergies?${localeParams(locale)}`, {
        method: 'PUT',
        body: { allergenIds },
      }),
    onSuccess: (saved) => {
      queryClient.setQueryData([...allergiesQueryKey, locale], saved);
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: allergiesQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['recipes'] }),
      ]);
    },
  });
}

/** An Allergy the Family records for someone without an account (mirror of the API's `FamilyAllergyView`). */
export type FamilyAllergy = {
  id: string;
  allergen: AllergenOption;
  label: string | null;
};

/** The Family tab's Allergies (mirror of the API's `FamilyAllergiesView`): Family Allergies and the other Members' own. */
export type FamilyAllergies = {
  allergens: AllergenOption[];
  familyAllergies: FamilyAllergy[];
  members: { id: string; name: string; allergens: AllergenOption[] }[];
};

export const familyAllergiesQueryKey = [
  'settings',
  'family-allergies',
] as const;

export function useFamilyAllergies(locale: string) {
  return useQuery({
    queryKey: [...familyAllergiesQueryKey, locale],
    queryFn: () =>
      apiRequest<FamilyAllergies>(
        `/settings/family-allergies?${localeParams(locale)}`,
      ),
  });
}

/** Any Member can change the Family's Allergies, and every Recipe's Allergy Warning depends on them. */
function useChangedFamilyAllergies() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: familyAllergiesQueryKey }),
      queryClient.invalidateQueries({ queryKey: ['recipes'] }),
    ]);
}

export function useAddFamilyAllergy(locale: string) {
  const changed = useChangedFamilyAllergies();
  return useMutation({
    mutationFn: (body: { allergenId: string; label: string | null }) =>
      apiRequest<FamilyAllergy>(
        `/settings/family-allergies?${localeParams(locale)}`,
        { method: 'POST', body },
      ),
    onSuccess: changed,
  });
}

export function useRemoveFamilyAllergy() {
  const changed = useChangedFamilyAllergies();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<{ id: string }>(`/settings/family-allergies/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: changed,
  });
}
