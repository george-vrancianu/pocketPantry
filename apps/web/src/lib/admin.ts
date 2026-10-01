import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from './api';
import { catalogSearchQueryKey, type Unit } from './catalog';

export const LOCATIONS = ['fridge', 'freezer', 'cupboard', 'spices'] as const;
export type Location = (typeof LOCATIONS)[number];
export const CATALOG_LOCALES = ['en', 'ro'] as const;
export type CatalogLocale = (typeof CATALOG_LOCALES)[number];

export type EntityType =
  'aisle' | 'parent_category' | 'leaf_category' | 'ingredient';

export type AdminTranslation = {
  id: string;
  locale: CatalogLocale;
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
  defaultLocation: Location | null;
};
export type AdminLeafCategory = Translated & {
  parentId: string;
  defaultExpiryDays: number | null;
  defaultLocation: Location | null;
};
export type AdminIngredient = Translated & {
  leafCategoryId: string;
  defaultUnit: Unit;
};

export type AdminCatalog = {
  aisles: AdminAisle[];
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

/** A write against the admin API that refreshes the Catalog afterwards. */
function useAdminWrite<Input>(send: (input: Input) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: send,
    // Member-facing Catalog search shows the same names, so refresh it too.
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: adminCatalogQueryKey }),
        queryClient.invalidateQueries({ queryKey: catalogSearchQueryKey }),
      ]),
  });
}

const base = '/admin/catalog';

export type IngredientInput = {
  name: string;
  leafCategoryId: string;
  defaultUnit: Unit;
};
export function useSaveIngredient(id?: string) {
  return useAdminWrite((input: IngredientInput) =>
    id
      ? apiRequest(`${base}/ingredients/${id}`, {
          method: 'PATCH',
          body: input,
        })
      : apiRequest(`${base}/ingredients`, { method: 'POST', body: input }),
  );
}
export function useDeleteIngredient() {
  return useAdminWrite((id: string) =>
    apiRequest(`${base}/ingredients/${id}`, { method: 'DELETE' }),
  );
}

export type CategoryInput = {
  name: string;
  /** `aisleId` for a Parent Category, `parentId` for a Leaf Category. */
  aisleId?: string;
  parentId?: string;
  defaultExpiryDays: number | null;
  defaultLocation: Location | null;
};
export type CategoryKind = 'parent' | 'leaf';
const categoryPath = (kind: CategoryKind) =>
  kind === 'parent' ? 'parent-categories' : 'leaf-categories';

export function useSaveCategory(kind: CategoryKind, id?: string) {
  return useAdminWrite((input: CategoryInput) =>
    id
      ? apiRequest(`${base}/${categoryPath(kind)}/${id}`, {
          method: 'PATCH',
          body: input,
        })
      : apiRequest(`${base}/${categoryPath(kind)}`, {
          method: 'POST',
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
  locale: CatalogLocale;
  kind: 'name' | 'synonym';
  value: string;
};
export function useAddTranslation() {
  return useAdminWrite((input: TranslationInput) =>
    apiRequest(`${base}/translations`, { method: 'POST', body: input }),
  );
}
export function useUpdateTranslation() {
  return useAdminWrite(({ id, value }: { id: string; value: string }) =>
    apiRequest(`${base}/translations/${id}`, {
      method: 'PATCH',
      body: { value },
    }),
  );
}
export function useDeleteTranslation() {
  return useAdminWrite((id: string) =>
    apiRequest(`${base}/translations/${id}`, { method: 'DELETE' }),
  );
}
