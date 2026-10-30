import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  useAddTranslation,
  useDeleteTranslation,
  useUpdateTranslation,
} from './admin';
import { familySynonymsQueueKey } from './familySynonymsQueue';
import { useResolveUnmatched } from './unmatched';
import { stubApi } from '../test/render';

// The Names queue hides a candidate once its name is a shared Synonym, and the
// To review tab badge counts the same query, so any Synonym write must refresh it.
function setup() {
  const stub = stubApi({
    'POST /api/admin/unmatched/resolve': () => Response.json({}),
    'POST /api/admin/catalog/translations': () => Response.json({}),
    'PATCH /api/admin/catalog/translations/t1': () => Response.json({}),
    'DELETE /api/admin/catalog/translations/t1': () => Response.json({}),
  });
  vi.stubGlobal('fetch', stub.fetchMock);
  const queryClient = new QueryClient();
  queryClient.setQueryData(familySynonymsQueueKey, { pages: [] });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const isStale = () =>
    queryClient.getQueryState(familySynonymsQueueKey)?.isInvalidated;
  return { wrapper, isStale };
}

afterEach(() => vi.unstubAllGlobals());

describe('Synonym writes refresh the Names queue and its tab counts', () => {
  it('after a Link that creates a Synonym', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useResolveUnmatched(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        normalizedName: 'x',
        ingredientId: 'i1',
        locale: 'en',
      } as never),
    );
    expect(isStale()).toBe(true);
  });

  it('after a Catalog Synonym is added', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useAddTranslation(), { wrapper });
    await act(() =>
      result.current.mutateAsync({
        entityType: 'ingredient',
        entityId: 'i1',
        locale: 'en',
        kind: 'synonym',
        value: 'x',
      }),
    );
    expect(isStale()).toBe(true);
  });

  it('after a Catalog Synonym is edited', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useUpdateTranslation(), { wrapper });
    await act(() => result.current.mutateAsync({ id: 't1', value: 'y' }));
    expect(isStale()).toBe(true);
  });

  it('after a Catalog Synonym is deleted', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useDeleteTranslation(), { wrapper });
    await act(() => result.current.mutateAsync('t1'));
    expect(isStale()).toBe(true);
  });
});
