/**
 * Stage-one matching key: case, diacritics, punctuation, and whitespace
 * folded away, so "Brânză  de vaci!" and "branza de vaci" collide.
 */
export function normalizeName(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
