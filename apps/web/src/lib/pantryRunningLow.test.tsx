import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSetRunningLow } from './pantry';
import { suggestionsQueryKey } from './queryKeys';
import { stubApi } from '../test/render';

function setup() {
  const stub = stubApi({
    'PUT /api/pantry/running-low/i1': () => new Response(null, { status: 204 }),
    'DELETE /api/pantry/running-low/i1': () =>
      new Response(null, { status: 204 }),
  });
  vi.stubGlobal('fetch', stub.fetchMock);
  const queryClient = new QueryClient();
  queryClient.setQueryData(suggestionsQueryKey, {});
  queryClient.setQueryData(['pantry', 'en'], { batches: [], runningLow: [] });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const isStale = (key: readonly unknown[]) =>
    queryClient.getQueryState(key)?.isInvalidated;
  return { wrapper, isStale };
}

afterEach(() => vi.unstubAllGlobals());

describe('Turning Running low on or off refreshes the suggestions', () => {
  it('invalidates the Running low suggestions when the flag is turned off', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useSetRunningLow('en'), { wrapper });
    await act(() =>
      result.current.mutateAsync({ ingredientId: 'i1', on: false }),
    );
    expect(isStale(suggestionsQueryKey)).toBe(true);
    expect(isStale(['pantry', 'en'])).toBe(true);
  });

  it('invalidates the Running low suggestions when the flag is turned on', async () => {
    const { wrapper, isStale } = setup();
    const { result } = renderHook(() => useSetRunningLow('en'), { wrapper });
    await act(() =>
      result.current.mutateAsync({ ingredientId: 'i1', on: true }),
    );
    expect(isStale(suggestionsQueryKey)).toBe(true);
  });
});
