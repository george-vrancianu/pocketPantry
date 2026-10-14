import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { stubApi } from '../test/render';
import { useRecentlyStocked } from './recentlyStocked';

describe('useRecentlyStocked', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('refetches whenever the Pantry is invalidated (Scan save, Finish Shopping, relink)', async () => {
    const { fetchMock, calls } = stubApi({
      'GET /api/pantry/recently-stocked': () =>
        Response.json({ ingredients: [] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useRecentlyStocked('en', 8), {
      wrapper,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    await queryClient.invalidateQueries({ queryKey: ['pantry'] });

    await waitFor(() =>
      expect(
        calls.filter((c) => c.key === 'GET /api/pantry/recently-stocked'),
      ).toHaveLength(2),
    );
  });
});
