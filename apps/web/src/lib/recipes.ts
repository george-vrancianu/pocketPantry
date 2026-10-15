import {
  type QueryClient,
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { apiRequest } from './api';
import type {
  Difficulty,
  PairingKind,
  PairingPrinciple,
} from './recipeVocabulary';
import type { Unit } from './catalog';
import { useDebounced } from './catalog';
import { localIso } from './pantry';
import { shoppingListChangeQueryKeys } from './queryKeys';
import { shoppingListQueryKey, type ShoppingList } from './shopping';

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
  difficulty: Difficulty | null;
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
  difficulty: Difficulty | null;
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

/** Pickers' options; browsing uses Cuisines and Methods, the Family editor adds Eating Moments. */
export type RecipeFilterOptions = {
  cuisines: NamedRef[];
  methods: NamedRef[];
  eatingMoments: NamedRef[];
};

export type RecipeBrowse = {
  search: string;
  cuisineId: string;
  methodId: string;
};

/** Minutes for a Recipe (prep plus cook), or null when it has neither. */
export function totalMinutes(times: {
  prepMinutes: number | null;
  cookMinutes: number | null;
}): number | null {
  return times.prepMinutes === null && times.cookMinutes === null
    ? null
    : (times.prepMinutes ?? 0) + (times.cookMinutes ?? 0);
}

export const recipesQueryKey = ['recipes'] as const;

/** Whether a search or a filter is active (the list then includes Variants). */
export const isFiltering = (browse: RecipeBrowse) =>
  browse.search.trim() !== '' ||
  browse.cuisineId !== '' ||
  browse.methodId !== '';

/** The Recipe list in `locale`; the search is debounced, the shown rows stay while the next load runs. */
export function useRecipes(
  browse: RecipeBrowse,
  locale: string,
  {
    searchOnly = false,
    includeVariants = false,
    enabled = true,
  }: {
    searchOnly?: boolean;
    includeVariants?: boolean;
    enabled?: boolean;
  } = {},
) {
  const search = useDebounced(browse.search.trim(), 300);
  const { cuisineId, methodId } = browse;
  return useQuery({
    queryKey: [
      ...recipesQueryKey,
      'list',
      locale,
      search,
      cuisineId,
      methodId,
      ...(includeVariants ? ['variants'] : []),
    ],
    queryFn: () => {
      const params = new URLSearchParams({ locale });
      if (search) params.set('search', search);
      if (cuisineId) params.set('cuisineId', cuisineId);
      if (methodId) params.set('methodId', methodId);
      if (includeVariants) params.set('includeVariants', 'true');
      return apiRequest<{ recipes: RecipeListItem[] }>(
        `/recipes?${params}`,
      ).then((body) => body.recipes);
    },
    // `searchOnly`: nothing to fetch until a search term has settled (the debounce has run).
    enabled: enabled && (!searchOnly || search !== ''),
    placeholderData: keepPreviousData,
  });
}

/** Cuisines and Methods for the filter pickers, named in `locale`. */
export function useRecipeFilters(locale: string, enabled = true) {
  return useQuery({
    enabled,
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

export type PantryLineStatus = 'covered' | 'short' | 'missing';

/** One Ingredient Line against the Pantry (mirror of the API's `PantryLineView`). */
export type PantryLine = {
  lineId: string;
  ingredientId: string | null;
  name: string | null;
  status: PantryLineStatus;
  optional: boolean;
  pantryBasic: boolean;
  /** The line's quantity scaled to the match's Servings. */
  quantity: number | null;
  unit: Unit | null;
  shortfall: { quantity: number; unit: Unit } | null;
  usesExpiringSoon: boolean;
  onShoppingList: boolean;
};

export type PantryMatch = {
  servings: number;
  canMake: boolean;
  shortOrMissingCount: number;
  expiringCoveredCount: number;
  coverageRatio: number;
  lines: PantryLine[];
};

const matchKey = (id: string) =>
  [...recipesQueryKey, 'pantry-match', id] as const;

/** A Recipe's per-line Pantry status at `servings`; the last answer stays while the next loads. */
export function useRecipePantryMatch(
  id: string,
  servings: number,
  enabled = true,
) {
  const today = localIso(new Date());
  return useQuery({
    queryKey: [...matchKey(id), servings, today],
    queryFn: () =>
      apiRequest<PantryMatch>(
        `/recipes/${id}/pantry-match?${new URLSearchParams({ today, servings: String(servings) })}`,
      ),
    enabled,
    // Only the same Recipe's previous answer may stand in (another Servings).
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === 'pantry-match' &&
      previousQuery.queryKey[2] === id
        ? previous
        : undefined,
  });
}

/** After an add: the answer is the updated Shopping List; Suggestions and the Pantry match are now out of date. */
function shoppingListUpdated(queryClient: QueryClient, locale: string) {
  return (list: ShoppingList) => {
    queryClient.setQueryData([...shoppingListQueryKey, locale], list);
    return Promise.all(
      shoppingListChangeQueryKeys.map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    );
  };
}

/** Adds the Recipe's short and missing lines to the Shopping List; the answer is the updated list. */
export function useAddMissingToShoppingList(id: string, locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (servings: number) =>
      apiRequest<ShoppingList>(
        `/recipes/${id}/add-missing?${new URLSearchParams({ locale })}`,
        {
          method: 'POST',
          body: { today: localIso(new Date()), servings },
        },
      ),
    onSuccess: shoppingListUpdated(queryClient, locale),
  });
}

/** Adds one Ingredient Line of the Recipe, at the Servings picked, to the Shopping List. */
export function useAddLineToShoppingList(id: string, locale: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lineId, servings }: { lineId: string; servings: number }) =>
      apiRequest<ShoppingList>(
        `/recipes/${id}/add-line?${new URLSearchParams({ locale })}`,
        {
          method: 'POST',
          body: { lineId, servings, today: localIso(new Date()) },
        },
      ),
    onSuccess: shoppingListUpdated(queryClient, locale),
  });
}
