import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import { recipesQueryKey, type RecipeOwner } from './recipes';

/** One Base Recipe's best match tonight (mirror of the API's `CookTonightCard`). */
export type CookTonightCard = {
  base: { id: string; title: string; archived: boolean };
  /** The best-matching Recipe of the group: the base itself or one of its Variants. */
  recipe: {
    id: string;
    title: string;
    parentId: string | null;
    owner: RecipeOwner;
    servings: number;
    prepMinutes: number | null;
    cookMinutes: number | null;
  };
  canMake: boolean;
  /** The one short or missing required line of a near miss. */
  missing: { ingredientId: string | null; name: string } | null;
  expiringCount: number;
  otherVariantsCount: number;
};

export type CookTonightView = { cards: CookTonightCard[] };

/** Cards arrive ranked best first. */
export function useCookTonight(locale: string, today: string) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'cook-tonight', locale, today],
    queryFn: () =>
      apiRequest<CookTonightView>(
        `/recipes/cook-tonight?${new URLSearchParams({ locale, today })}`,
      ),
  });
}
