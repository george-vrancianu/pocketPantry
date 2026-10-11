import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAddMissingToShoppingList } from './recipes';
import { useShoppingMutations } from './shopping';
import { stubApi } from '../test/render';

const list = { id: 'l', groups: [], summary: { remaining: 0, checked: 0 } };

function setup() {
  const stub = stubApi({
    'POST /api/shopping-list/items': () => Response.json(list),
    'POST /api/recipes/r1/add-missing': () => Response.json(list),
  });
  vi.stubGlobal('fetch', stub.fetchMock);
  const queryClient = new QueryClient();
  queryClient.setQueryData(['recipes', 'pantry-match', 'other', 2, 'd'], {});
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const isStale = () =>
    queryClient.getQueryState(['recipes', 'pantry-match', 'other', 2, 'd'])
      ?.isInvalidated;
  return { wrapper, isStale };
}

afterEach(() => vi.unstubAllGlobals());

describe('Shopping List writes refresh the "on your list" hints', () => {
  it('invalidates every Recipe pantry match when an item is added', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useShoppingMutations('en'), {
      wrapper,
    });
    await act(() => result.current.add.mutateAsync({ name: 'Eggs' }));
    expect(isStale()).toBe(true);
  });

  it('invalidates every Recipe pantry match when missing lines are added', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(
      () => useAddMissingToShoppingList('r1', 'en'),
      {
        wrapper,
      },
    );
    await act(() => result.current.mutateAsync(2));
    expect(isStale()).toBe(true);
  });
});
