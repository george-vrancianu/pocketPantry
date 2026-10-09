/**
 * Stage-one matching key: case, diacritics, punctuation, and whitespace
 * folded away, so "Brânză  de vaci!" and "branza de vaci" collide.
 *
 * The Danish letters fold to the ASCII spellings receipts print: æ→ae, ø→oe,
 * å→aa, so "MAELK" finds "Mælk". æ and ø don't decompose under NFD, and å
 * would otherwise lose its ring and become a plain "a". After NFD a composed
 * å (U+00E5) is "a" + combining ring (U+030A), so that pair is what folds; the
 * escape keeps it visible, matching the SQL copy's `'a' || chr(778)`.
 *
 * Migration 0012 recomputes stored keys with a SQL copy of these rules; change
 * them only together with a new renormalising migration.
 */
export function normalizeName(input: string): string {
  return input
    .normalize('NFD')
    .toLowerCase()
    .replace(/a\u030a/g, 'aa')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
