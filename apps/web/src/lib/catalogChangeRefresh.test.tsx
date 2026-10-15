import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCreateFamilyIngredient, useCreateFamilySynonym } from './catalog';
import {
  useDeleteFamilyIngredient,
  useDeleteFamilySynonym,
  useUpdateFamilyIngredient,
} from './familyCatalog';
import {
  useMergeFamilyIngredient,
  usePromoteFamilyIngredient,
} from './familyIngredientsQueue';
import { useAddSharedSynonym } from './familySynonymsQueue';
import { stubApi } from '../test/render';

// Spec: ADR 0011. A Catalog change makes the same views stale, whoever made it.
const STALE_AFTER_CATALOG_CHANGE = [
  ['catalog-search', 'x'],
  ['family-catalog', 'en'],
  ['staples'],
  ['pantry', 'recently-stocked'],
  ['shopping-list'],
  ['shopping-templates', 'detail', 't1'],
  ['recipes', 'detail', 'r1'],
  ['suggestions', 'en'],
] as const;

function setup() {
  const ok = () => Response.json({});
  vi.stubGlobal(
    'fetch',
    stubApi({
      'POST /api/catalog/family-ingredients': ok,
      'POST /api/catalog/family-synonyms': ok,
      'PATCH /api/catalog/family-ingredients/i1': ok,
      'DELETE /api/catalog/family-ingredients/i1': ok,
      'DELETE /api/catalog/family-synonyms/s1': ok,
      'POST /api/admin/family-ingredients/promote': ok,
      'POST /api/admin/family-ingredients/merge': ok,
      'POST /api/admin/family-synonyms/promote': ok,
    }).fetchMock,
  );
  const queryClient = new QueryClient();
  for (const key of STALE_AFTER_CATALOG_CHANGE) {
    queryClient.setQueryData([...key], {});
  }
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const staleKeys = () =>
    STALE_AFTER_CATALOG_CHANGE.filter(
      (key) => !queryClient.getQueryState([...key])?.isInvalidated,
    );
  return { wrapper, staleKeys: staleKeys };
}

afterEach(() => vi.unstubAllGlobals());

describe('a Catalog change refreshes every view that shows it', () => {
  async function expectRefreshed<T extends object>(
    useHook: () => T,
    run: (mutation: T) => Promise<unknown>,
  ) {
    const { wrapper, staleKeys } = setup();
    const { result } = renderHook(useHook, { wrapper });
    await act(() => run(result.current));
    expect(staleKeys()).toEqual([]);
  }

  it('after adding a Family Ingredient', () =>
    expectRefreshed(
      () => useCreateFamilyIngredient('en'),
      (m) =>
        m.mutateAsync({ name: 'x', leafCategoryId: 'l', defaultUnit: 'g' }),
    ));
  it('after adding a Family Synonym', () =>
    expectRefreshed(
      () => useCreateFamilySynonym('en'),
      (m) => m.mutateAsync({ name: 'x', ingredientId: 'i1' }),
    ));
  it('after changing a Family Ingredient', () =>
    expectRefreshed(
      () => useUpdateFamilyIngredient('en'),
      (m) => m.mutateAsync({ id: 'i1', name: 'x' }),
    ));
  it('after deleting a Family Ingredient', () =>
    expectRefreshed(
      () => useDeleteFamilyIngredient(),
      (m) => m.mutateAsync('i1'),
    ));
  it('after deleting a Family Synonym', () =>
    expectRefreshed(
      () => useDeleteFamilySynonym(),
      (m) => m.mutateAsync('s1'),
    ));
  it('after Admin promotes a Family Ingredient', () =>
    expectRefreshed(
      () => usePromoteFamilyIngredient(),
      (m) => m.mutateAsync('i1'),
    ));
  it('after Admin merges Family Ingredients', () =>
    expectRefreshed(
      () => useMergeFamilyIngredient(),
      (m) => m.mutateAsync({ ingredientId: 'i1', targetIngredientId: 'i2' }),
    ));
  it('after Admin promotes a Family Synonym', () =>
    expectRefreshed(
      () => useAddSharedSynonym(),
      (m) =>
        m.mutateAsync({
          normalizedName: 'x',
          ingredientId: 'i1',
          locale: 'en',
        }),
    ));
});
