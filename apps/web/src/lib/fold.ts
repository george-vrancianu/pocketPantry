/**
 * Lower-case and strip diacritics so "mamaliga" finds "Mămăligă". The Danish
 * letters fold as the API's matching key does (æ→ae, ø→oe, å→aa), so "maelk"
 * finds "Mælk".
 */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .toLocaleLowerCase()
    .replace(/a\u030A/g, 'aa')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/\p{Diacritic}/gu, '');
}
