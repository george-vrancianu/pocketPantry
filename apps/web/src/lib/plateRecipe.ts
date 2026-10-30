import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './api';
import { recipesQueryKey, type CompactAllergyWarning } from './recipes';

/** A Catalog Base Recipe that resembles the dish, best first. */
export type PlateMatch = {
  id: string;
  title: string;
  score: number;
  /** The Family's live copy of this Catalog Base, else null. */
  familyCopyId: string | null;
  allergyWarning: CompactAllergyWarning | null;
};

/** The matches, with how many "Hide Recipes with my Allergies" left out of the closest five. */
export type PlateMatches = {
  matches: PlateMatch[];
  hiddenByAllergiesCount: number;
};

/** The closest Catalog Base Recipes to the picked dish, once the panel is open. */
export function usePlateMatches(
  input: {
    dishTitle: string;
    ingredientIds: string[];
    /** Also ask for the matches "Hide Recipes with my Allergies" would leave out. */
    showHidden?: true;
  },
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...recipesQueryKey, 'plate-matches', input],
    queryFn: () =>
      apiRequest<PlateMatches>('/recipes/plate-matches', {
        method: 'POST',
        body: input,
      }),
    enabled,
    staleTime: Infinity,
  });
}
