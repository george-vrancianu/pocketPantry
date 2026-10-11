import { normalizeName } from '../catalog/normalize';

export const MAX_PLATE_MATCHES = 5;
/** How much the title counts next to the Ingredient overlap. */
const TITLE_WEIGHT = 0.5;

export type PlateCandidate = {
  id: string;
  /** The first title is the one shown (member locale); the rest only count for matching. */
  titles: string[];
  ingredientIds: string[];
};

export type PlateMatch = { id: string; title: string; score: number };

const jaccard = (a: ReadonlySet<string>, b: ReadonlySet<string>): number => {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const item of a) if (b.has(item)) shared++;
  return shared / (a.size + b.size - shared);
};

const words = (text: string): Set<string> =>
  new Set(normalizeName(text).split(' ').filter(Boolean));

/**
 * Ranks Catalog Base Recipes against a Plate Scan dish: Ingredient overlap
 * (Jaccard) plus half the word overlap of the titles (best title wins). Only
 * positive scores, best first, ties by title, at most five.
 */
export function rankPlateMatches(
  dish: { dishTitle: string; ingredientIds: readonly string[] },
  candidates: readonly PlateCandidate[],
): PlateMatch[] {
  const dishIngredients = new Set(dish.ingredientIds);
  const dishWords = words(dish.dishTitle);
  return candidates
    .map((candidate) => {
      const titleScore = Math.max(
        0,
        ...candidate.titles.map((t) => jaccard(dishWords, words(t))),
      );
      return {
        id: candidate.id,
        title: candidate.titles[0] ?? '',
        score:
          jaccard(dishIngredients, new Set(candidate.ingredientIds)) +
          TITLE_WEIGHT * titleScore,
      };
    })
    .filter((s) => s.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.title.localeCompare(b.title) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, MAX_PLATE_MATCHES);
}
