import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { mealWindowQueryKey } from './mealPlan';
import { useApplyTemplate } from './shoppingTemplates';

vi.mock('./plate', () => ({ postShoppingItems: vi.fn(async () => []) }));

describe('useApplyTemplate', () => {
  it('makes the Meal plan forecast and Recipe matches stale', async () => {
    const queryClient = new QueryClient();
    const windowKey = [...mealWindowQueryKey, '2026-10-15'];
    const matchKey = ['recipes', 'pantry-match', 'r1'];
    queryClient.setQueryData(windowKey, { days: [] });
    queryClient.setQueryData(matchKey, {});
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useApplyTemplate(), { wrapper });
    result.current.mutate([]);
    await waitFor(() =>
      expect(queryClient.getQueryState(windowKey)?.isInvalidated).toBe(true),
    );
    expect(queryClient.getQueryState(matchKey)?.isInvalidated).toBe(true);
  });
});
