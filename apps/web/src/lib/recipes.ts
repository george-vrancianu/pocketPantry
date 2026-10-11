import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import type { Unit } from './catalog';
import { useDebounced } from './catalog';

export type RecipeDifficulty = 'easy' | 'medium' | 'hard';
export type RecipeOwner = 'catalog' | 'family';
export type NamedRef = { id: string; name: string };

/** One row of the Recipe list (mirror of the API's `RecipeListItem`). */
export type RecipeListItem = {
  id: string;
  title: string;
  parentId: string | null;
  base: { id: string; title: string } | null;
  cuisine: NamedRef | null;
  method: NamedRef | null;
  variantCount: number;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: RecipeDifficulty | null;
  owner: RecipeOwner;
};

/** A Variant as listed on its base's detail. */
export type RecipeVariantItem = {
  id: string;
  title: string;
  cuisine: NamedRef | null;
  method: NamedRef | null;
  owner: RecipeOwner;
};

export type RecipeDetailLine = {
  id: string;
  ingredientId: string | null;
  ingredientName: string;
  quantity: number | null;
  unit: Unit | null;
  optional: boolean;
  note: string | null;
};
export type RecipeDetailStep = {
  id: string;
  text: string;
  timerSeconds: number | null;
};
export type RecipeDetailTip = {
  id: string;
  stepId: string | null;
  text: string;
  inherited: boolean;
};
export type DiffEntry = {
  id: string;
  ingredientName: string;
  quantity: number | null;
  unit: Unit | null;
};
export type RecipeDiff = {
  added: DiffEntry[];
  removed: DiffEntry[];
  swapped: { from: DiffEntry; to: DiffEntry }[];
};

export type PairingKind = 'food' | 'drink';
export type PairingPrinciple =
  | 'acid_cuts_fat'
  | 'salt_balances_sweet'
  | 'fat_carries_flavour'
  | 'contrast_texture'
  | 'complement_flavour'
  | 'bitter_balances_rich'
  | 'cleanses_palate'
  | 'regional_tradition';
export type PairingLink =
  | { type: 'ingredient'; id: string; name: string }
  | { type: 'recipe'; id: string; title: string };
export type DetailPairing = {
  id: string;
  kind: PairingKind;
  label: string;
  reason: string;
  principle: PairingPrinciple | null;
  /** Null for no link, or when the linked Recipe is archived or not visible. */
  link: PairingLink | null;
};
export type DetailEatingMoment = {
  eatingMomentId: string;
  name: string;
  polarity: 'good_for' | 'avoid';
  reason: string | null;
};
/** Recipe guidance in the Member's locale (mirror of the API's `ResolvedGuidance`). */
export type RecipeGuidance = {
  nutritionNote: string | null;
  pairings: DetailPairing[];
  eatingMoments: DetailEatingMoment[];
};

/** The Member's Recipe detail (mirror of the API's `RecipeDetail`). */
export type RecipeDetail = {
  id: string;
  parentId: string | null;
  owner: RecipeOwner;
  title: string;
  servings: number;
  prepMinutes: number | null;
  cookMinutes: number | null;
  difficulty: RecipeDifficulty | null;
  cuisine: NamedRef | null;
  method: NamedRef | null;
  archived: boolean;
  lines: RecipeDetailLine[];
  steps: RecipeDetailStep[];
  tips: RecipeDetailTip[];
  base: { id: string; title: string; archived: boolean } | null;
  variants: RecipeVariantItem[];
  diff: RecipeDiff | null;
  guidance: RecipeGuidance;
};

export type RecipeFilterOptions = { cuisines: NamedRef[]; methods: NamedRef[] };

export type RecipeBrowse = {
  search: string;
  cuisineId: string;
  methodId: string;
};

export const recipesQueryKey = ['recipes'] as const;

/** Whether a search or a filter is active (the list then includes Variants). */
export const isFiltering = (browse: RecipeBrowse) =>
  browse.search.trim() !== '' ||
  browse.cuisineId !== '' ||
  browse.methodId !== '';

/** The Recipe list in `locale`; the search is debounced, the shown rows stay while the next load runs. */
export function useRecipes(browse: RecipeBrowse, locale: string) {
  const search = useDebounced(browse.search.trim(), 300);
  const { cuisineId, methodId } = browse;
  return useQuery({
    queryKey: [...recipesQueryKey, 'list', locale, search, cuisineId, methodId],
    queryFn: () => {
      const params = new URLSearchParams({ locale });
      if (search) params.set('search', search);
      if (cuisineId) params.set('cuisineId', cuisineId);
      if (methodId) params.set('methodId', methodId);
      return apiRequest<{ recipes: RecipeListItem[] }>(
        `/recipes?${params}`,
      ).then((body) => body.recipes);
    },
    placeholderData: keepPreviousData,
  });
}

/** Cuisines and Methods for the filter pickers, named in `locale`. */
export function useRecipeFilters(locale: string) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'filters', locale],
    queryFn: () =>
      apiRequest<RecipeFilterOptions>(
        `/recipes/filters?${new URLSearchParams({ locale })}`,
      ),
  });
}

/** One Recipe with its text in `locale`, plus its base, Variants and ingredient diff. */
export function useRecipe(id: string, locale: string) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'detail', id, locale],
    queryFn: () =>
      apiRequest<RecipeDetail>(
        `/recipes/${id}?${new URLSearchParams({ locale })}`,
      ),
  });
}
