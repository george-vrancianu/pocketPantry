import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { apiRequest } from './api';
import type { ScanLanguage } from '../i18n/resources';
import {
  catalogAllergensQueryKey,
  catalogSearchQueryKey,
  type StorageLocation,
  type Unit,
} from './catalog';
import { adminRecipesQueryKey } from './adminRecipes';
import { recipeChangeQueryKeys } from './queryKeys';
import { allergiesQueryKey, familyAllergiesQueryKey } from './settings';
import { shoppingListQueryKey } from './shopping';

export type EntityType =
  | 'aisle'
  | 'parent_category'
  | 'leaf_category'
  | 'ingredient'
  | 'tag_group'
  | 'tag'
  | 'eating_moment'
  | 'allergen';

export type AdminTranslation = {
  id: string;
  locale: ScanLanguage;
  kind: 'name' | 'synonym';
  value: string;
};

type Translated = {
  id: string;
  name: string;
  translations: AdminTranslation[];
};

export type AdminAisle = Translated & { sortOrder: number };
export type AdminParentCategory = Translated & {
  aisleId: string;
  defaultExpiryDays: number | null;
  defaultLocation: StorageLocation | null;
};
export type AdminLeafCategory = Translated & {
  parentId: string;
  /** The Parent's catch-all Leaf for Unmatched Batches: cannot be deleted or moved. */
  isOther: boolean;
  defaultExpiryDays: number | null;
  defaultLocation: StorageLocation | null;
};
export type AdminIngredient = Translated & {
  leafCategoryId: string;
  defaultUnit: Unit;
  /** Recipe matching always counts a Pantry Basic as covered. */
  pantryBasic: boolean;
  /** The Allergens this shared Ingredient contains; none means it contains none. */
  allergenIds: string[];
  /** A promote or merge carried a Family's tags onto it; saving its Allergens clears this. */
  allergensReviewPending: boolean;
};

/** A Tag Group: an ordered heading Catalog Tags are listed under. */
export type AdminTagGroup = Translated & { position: number };

/** A Catalog Tag; `recipeCount` is how many Recipes (Family copies included) carry it. */
export type AdminCatalogTag = Translated & {
  groupId: string;
  recipeCount: number;
};

/** An Eating Moment: an ordered, archivable name list like Aisles. */
export type AdminEatingMoment = Translated & {
  sortOrder: number;
  archived: boolean;
};

/** An Allergen: an ordered, retirable name list. Retired ones are hidden from the pickers. */
export type AdminAllergen = Translated & {
  sortOrder: number;
  archived: boolean;
};

export type AdminCatalog = {
  allergens: AdminAllergen[];
  aisles: AdminAisle[];
  tagGroups: AdminTagGroup[];
  tags: AdminCatalogTag[];
  eatingMoments: AdminEatingMoment[];
  parentCategories: AdminParentCategory[];
  leafCategories: AdminLeafCategory[];
  ingredients: AdminIngredient[];
};

export const adminCatalogQueryKey = ['admin-catalog'] as const;

/** The name to show in `locale`, falling back to the canonical English name. */
export function localName(entity: Translated, locale: string): string {
  return (
    entity.translations.find((t) => t.kind === 'name' && t.locale === locale)
      ?.value ?? entity.name
  );
}

export function useAdminCatalog() {
  return useQuery({
    queryKey: adminCatalogQueryKey,
    queryFn: () => apiRequest<AdminCatalog>('/admin/catalog'),
  });
}

/** Caches that show Allergen names or tags: the Admin Recipe editor and the Settings pickers. */
const allergenQueryKeys: QueryKey[] = [
  adminRecipesQueryKey,
  catalogAllergensQueryKey,
  allergiesQueryKey,
  familyAllergiesQueryKey,
];

/**
 * A write against the admin API that refreshes the Catalog afterwards. `alsoRefresh`
 * names the extra caches a write touches, given its input.
 */
function useAdminWrite<Input>(
  send: (input: Input) => Promise<unknown>,
  alsoRefresh: (input: Input) => QueryKey[] = () => [],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: send,
    // Member-facing Catalog search and Shopping List show the same names (and
    // Aisle order, and Recipes show Ingredient names), so refresh them too.
    onSuccess: (_data, input) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey }),
        queryClient.invalidateQueries({ queryKey: catalogSearchQueryKey }),
        queryClient.invalidateQueries({ queryKey: shoppingListQueryKey }),
        ...[...recipeChangeQueryKeys, ...alsoRefresh(input)].map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      ]),
  });
}

const base = '/admin/catalog';

export type IngredientInput = {
  name: string;
  leafCategoryId: string;
  defaultUnit: Unit;
  pantryBasic: boolean;
};
export function useSaveIngredient(id?: string) {
  return useAdminWrite((input: IngredientInput) =>
    apiRequest(`${base}/ingredients${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: input,
    }),
  );
}
export function useDeleteIngredient() {
  return useAdminWrite((id: string) =>
    apiRequest(`${base}/ingredients/${id}`, { method: 'DELETE' }),
  );
}

export function useSaveAisle(id?: string) {
  return useAdminWrite((input: { name: string }) =>
    apiRequest(`${base}/aisles${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: input,
    }),
  );
}
export function useDeleteAisle() {
  return useAdminWrite((id: string) =>
    apiRequest(`${base}/aisles/${id}`, { method: 'DELETE' }),
  );
}
/** Sets the shop order: every Aisle id once, first walked first. */
export function useReorderAisles() {
  return useAdminWrite((ids: string[]) =>
    apiRequest(`${base}/aisles/order`, { method: 'PUT', body: { ids } }),
  );
}

/** Caches that show Tags: the pickers and filters, and the Recipes carrying them. */
const tagQueryKeys: QueryKey[] = [adminRecipesQueryKey];

export function useSaveTagGroup(id?: string) {
  return useAdminWrite(
    (input: { name: string }) =>
      apiRequest(`${base}/tag-groups${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST',
        body: input,
      }),
    () => tagQueryKeys,
  );
}
/** Deletes a Tag Group; only an empty one can go. */
export function useDeleteTagGroup() {
  return useAdminWrite(
    (id: string) =>
      apiRequest(`${base}/tag-groups/${id}`, { method: 'DELETE' }),
    () => tagQueryKeys,
  );
}
/** Sets the order: every Tag Group id once, first shown first. */
export function useReorderTagGroups() {
  return useAdminWrite(
    (ids: string[]) =>
      apiRequest(`${base}/tag-groups/order`, { method: 'PUT', body: { ids } }),
    () => tagQueryKeys,
  );
}

export function useSaveCatalogTag(id?: string) {
  return useAdminWrite(
    (input: { name: string; groupId: string }) =>
      apiRequest(`${base}/tags${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST',
        body: input,
      }),
    // Creating or renaming can fold Family Tags into it.
    () => tagQueryKeys,
  );
}
/** Deletes a Catalog Tag and removes it from every Recipe; callers confirm first. */
export function useDeleteCatalogTag() {
  return useAdminWrite(
    (id: string) =>
      apiRequest(`${base}/tags/${id}?confirm=true`, { method: 'DELETE' }),
    () => tagQueryKeys,
  );
}

export function useSaveEatingMoment(id?: string) {
  return useAdminWrite((input: { name: string }) =>
    apiRequest(`${base}/eating-moments${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: input,
    }),
  );
}
/** Sets the order: every Eating Moment id once, archived included. */
export function useReorderEatingMoments() {
  return useAdminWrite((ids: string[]) =>
    apiRequest(`${base}/eating-moments/order`, {
      method: 'PUT',
      body: { ids },
    }),
  );
}
export function useArchiveEatingMoment() {
  return useAdminWrite(({ id, archive }: { id: string; archive: boolean }) =>
    apiRequest(
      `${base}/eating-moments/${id}/${archive ? 'archive' : 'unarchive'}`,
      { method: 'POST' },
    ),
  );
}

export function useSaveAllergen(id?: string) {
  return useAdminWrite(
    (input: { name: string }) =>
      apiRequest(`${base}/allergens${id ? `/${id}` : ''}`, {
        method: id ? 'PATCH' : 'POST',
        body: input,
      }),
    () => allergenQueryKeys,
  );
}
/** Retires or brings back an Allergen; it is never deleted. */
export function useArchiveAllergen() {
  return useAdminWrite(
    ({ id, archive }: { id: string; archive: boolean }) =>
      apiRequest(
        `${base}/allergens/${id}/${archive ? 'archive' : 'unarchive'}`,
        {
          method: 'POST',
        },
      ),
    () => allergenQueryKeys,
  );
}
/** Replaces the Allergens a shared Ingredient contains (empty = none). */
export function useSetIngredientAllergens(id: string) {
  return useAdminWrite(
    (allergenIds: string[]) =>
      apiRequest(`${base}/ingredients/${id}/allergens`, {
        method: 'PUT',
        body: { allergenIds },
      }),
    () => [adminRecipesQueryKey],
  );
}

export type CategoryInput = {
  name: string;
  /** `aisleId` for a Parent Category, `parentId` for a Leaf Category. */
  aisleId?: string;
  parentId?: string;
  defaultExpiryDays: number | null;
  defaultLocation: StorageLocation | null;
};
export type CategoryKind = 'parent' | 'leaf';
const categoryPath = (kind: CategoryKind) =>
  kind === 'parent' ? 'parent-categories' : 'leaf-categories';

export function useSaveCategory(kind: CategoryKind, id?: string) {
  return useAdminWrite((input: CategoryInput) =>
    apiRequest(`${base}/${categoryPath(kind)}${id ? `/${id}` : ''}`, {
      method: id ? 'PATCH' : 'POST',
      body: input,
    }),
  );
}
export function useDeleteCategory(kind: CategoryKind) {
  return useAdminWrite((id: string) =>
    apiRequest(`${base}/${categoryPath(kind)}/${id}`, { method: 'DELETE' }),
  );
}

export type TranslationInput = {
  entityType: EntityType;
  entityId: string;
  /** Any Scan Language for a Synonym; a display name takes a catalog locale only. */
  locale: ScanLanguage;
  kind: 'name' | 'synonym';
  value: string;
};
export function useAddTranslation() {
  return useAdminWrite(
    (input: TranslationInput) =>
      apiRequest(`${base}/translations`, { method: 'POST', body: input }),
    (input) => (input.entityType === 'allergen' ? allergenQueryKeys : []),
  );
}
export function useUpdateTranslation() {
  return useAdminWrite(
    ({ id, value }: { id: string; value: string }) =>
      apiRequest(`${base}/translations/${id}`, {
        method: 'PATCH',
        body: { value },
      }),
    // The entity type is not known here, so an Allergen name may have changed.
    () => allergenQueryKeys,
  );
}
export function useDeleteTranslation() {
  return useAdminWrite(
    (id: string) =>
      apiRequest(`${base}/translations/${id}`, { method: 'DELETE' }),
    () => allergenQueryKeys,
  );
}
