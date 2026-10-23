import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { mealWindowQueryKey } from './mealPlan';
import {
  catalogChangeQueryKeys,
  mealPlanQueryKey,
  recipeChangeQueryKeys,
  recipeMatchingQueryKeys,
  shoppingListChangeQueryKeys,
} from './queryKeys';

/** The Meal plan Widget's window is cached per locale and day; each list below must reach it. */
describe('Meal plan forecast query keys', () => {
  const windowKey = [...mealWindowQueryKey, '2026-10-15'];

  it.each([
    ['a Pantry change', recipeMatchingQueryKeys],
    ['a Shopping List change', shoppingListChangeQueryKeys],
    ['a Catalog change', catalogChangeQueryKeys],
    ['a Recipe change', recipeChangeQueryKeys],
    ['a plan change', [mealPlanQueryKey]],
  ])('go stale after %s', async (_name, keys) => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(windowKey, { days: [] });
    await Promise.all(
      keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
    expect(queryClient.getQueryState(windowKey)?.isInvalidated).toBe(true);
  });
});
