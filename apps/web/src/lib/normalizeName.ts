/**
 * The matching key the server merges typed names on. A copy of `normalizeName`
 * in apps/api/src/catalog/normalize.ts; change both together.
 *
 * After NFD a composed å (U+00E5) is "a" + combining ring (U+030A), so that
 * pair is what folds to "aa"; a literal å would never match.
 */
export function normalizeName(input: string): string {
  return input
    .normalize('NFD')
    .toLowerCase()
    .replace(/å/g, 'aa')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
