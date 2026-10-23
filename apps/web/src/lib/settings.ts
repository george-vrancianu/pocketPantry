import type { ThemeId } from '@pocket-pantry/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from './api';
import { catalogAllergensQueryKey, catalogSearchQueryKey } from './catalog';
import { familyCatalogQueryKey } from './familyCatalog';
import { recipesQueryKey } from './recipes';
import {
  mealPlanQueryKey,
  recipeMatchingQueryKeys,
  suggestionsQueryKey,
} from './queryKeys';
import type { Locale, ScanLanguage } from '../i18n/resources';

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
  /** `null` is "Same as UI Language". */
  catalogLanguage: Locale | null;
  /** The language Pantry and Shopping names are shown in, worked out by the API. */
  effectiveCatalogLanguage: Locale;
  /** `null` is "Same as UI Language". */
  scanLanguage: ScanLanguage | null;
  /** The language Scans and Voice Notes are read in by default, worked out by the API. */
  effectiveScanLanguage: ScanLanguage;
  theme: ThemeId | null;
  /** Leave out Recipes with the Member's own or Family Allergies; off by default. */
  hideRecipesWithAllergies: boolean;
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

/**
 * The Member's Preferences. The device's UI Language goes along as `locale`, the way Pantry and Shopping
 * send it, so `effectiveCatalogLanguage` is right while no UI Language is stored (ticket 475 removes both).
 * `ApplyMemberLocale` refetches when the UI Language changes.
 */
export function useMemberPreferences() {
  const { i18n } = useTranslation();
  return useQuery({
    queryKey: preferencesQueryKey,
    queryFn: () =>
      apiRequest<MemberPreferences>(
        `/settings/preferences?${localeParams(i18n.resolvedLanguage ?? i18n.language)}`,
      ),
    retry: false,
  });
}

/** Patches the language fields a save returned into the cache and refetches everything named in them. */
function useApplySavedLanguages() {
  const queryClient = useQueryClient();
  return (saved: MemberPreferences) => {
    // Only the language fields; a Theme save may have landed meanwhile.
    queryClient.setQueryData<MemberPreferences>(preferencesQueryKey, (old) =>
      old
        ? {
            ...old,
            locale: saved.locale,
            catalogLanguage: saved.catalogLanguage,
            effectiveCatalogLanguage: saved.effectiveCatalogLanguage,
            scanLanguage: saved.scanLanguage,
            effectiveScanLanguage: saved.effectiveScanLanguage,
          }
        : saved,
    );
    return Promise.all(
      catalogNameQueryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  };
}

export function useSaveLocale() {
  const apply = useApplySavedLanguages();
  return useMutation({
    mutationFn: (locale: Locale) =>
      apiRequest<MemberPreferences>(
        `/settings/preferences?${localeParams(locale)}`,
        { method: 'PUT', body: { locale } },
      ),
    onSuccess: apply,
  });
}

/** Saves the Catalog Language; `null` is "Same as UI Language". */
export function useSaveCatalogLanguage() {
  const { i18n } = useTranslation();
  const apply = useApplySavedLanguages();
  return useMutation({
    mutationFn: (catalogLanguage: Locale | null) =>
      apiRequest<MemberPreferences>(
        `/settings/preferences?${localeParams(i18n.resolvedLanguage ?? i18n.language)}`,
        { method: 'PUT', body: { catalogLanguage } },
      ),
    onSuccess: apply,
  });
}

/** Saves the Scan Language; `null` is "Same as UI Language". */
export function useSaveScanLanguage() {
  const { i18n } = useTranslation();
  const apply = useApplySavedLanguages();
  return useMutation({
    mutationFn: (scanLanguage: ScanLanguage | null) =>
      apiRequest<MemberPreferences>(
        `/settings/preferences?${localeParams(i18n.resolvedLanguage ?? i18n.language)}`,
        { method: 'PUT', body: { scanLanguage } },
      ),
    onSuccess: apply,
  });
}

/** Saves "Hide Recipes with my Allergies"; Recipe lists and matches depend on it. */
export function useSaveHideRecipesWithAllergies() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (hideRecipesWithAllergies: boolean) =>
      apiRequest<MemberPreferences>('/settings/preferences', {
        method: 'PUT',
        body: { hideRecipesWithAllergies },
      }),
    onSuccess: async (saved) => {
      // Only this preference; a locale or Theme save may have landed meanwhile.
      queryClient.setQueryData<MemberPreferences>(preferencesQueryKey, (old) =>
        old
          ? {
              ...old,
              hideRecipesWithAllergies: saved.hideRecipesWithAllergies,
            }
          : saved,
      );
      await queryClient.invalidateQueries({ queryKey: recipesQueryKey });
    },
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
        queryClient.invalidateQueries({ queryKey: recipesQueryKey }),
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
      queryClient.invalidateQueries({ queryKey: recipesQueryKey }),
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

/** Ingredient, Category and Aisle names in these come back in the Member's Catalog Language, which their keys do not name. Declared last: it reads keys defined further down. */
const catalogNameQueryKeys = [
  ['pantry'],
  ['shopping-list'],
  ['shopping-templates'],
  ['staples'],
  suggestionsQueryKey,
  recipesQueryKey,
  mealPlanQueryKey,
  catalogSearchQueryKey,
  ['catalog-parents'],
  ['catalog-aisles'],
  ['catalog-categories'],
  catalogAllergensQueryKey,
  familyCatalogQueryKey,
  familySettingsQueryKey,
  ['settings', 'categories'],
  allergiesQueryKey,
  familyAllergiesQueryKey,
] as const;
