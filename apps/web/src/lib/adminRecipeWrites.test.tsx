import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDeleteIngredient } from './admin';
import { useArchiveRecipe } from './adminRecipes';
import { stubApi } from '../test/render';

function setup() {
  const stub = stubApi({
    'POST /api/admin/recipes/r1/archive': () => Response.json({}),
    'DELETE /api/admin/catalog/ingredients/i1': () => Response.json({}),
  });
  vi.stubGlobal('fetch', stub.fetchMock);
  const queryClient = new QueryClient();
  const key = ['recipes', 'detail', 'r1'];
  queryClient.setQueryData(key, {});
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const isStale = () => queryClient.getQueryState(key)?.isInvalidated;
  return { wrapper, isStale };
}

afterEach(() => vi.unstubAllGlobals());

describe('Admin writes refresh the Member Recipe views', () => {
  it('after an Admin Recipe edit', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useArchiveRecipe('r1'), { wrapper });
    await act(() => result.current.mutateAsync());
    expect(isStale()).toBe(true);
  });

  it('after an Admin Catalog edit', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useDeleteIngredient(), { wrapper });
    await act(() => result.current.mutateAsync('i1'));
    expect(isStale()).toBe(true);
  });
});
