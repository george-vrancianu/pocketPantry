import type { CatalogLocale, ScanLanguage } from '../catalog/catalog.schemas';

export const LANGUAGE_NAMES: Record<ScanLanguage, string> = {
  en: 'English',
  ro: 'Romanian',
  da: 'Danish',
};

/**
 * The prompt line that tells the model which language a Scan is read in, and
 * the one that fixes the language of `fallbackIngredientName` (the UI locale's,
 * since it is shown in Review beside the Ingredient names). `productName`
 * stays in the language printed on the receipt or package.
 */
export function scanLanguagePrompt(
  subject: string,
  scanLanguage: ScanLanguage,
  hintFor: string,
): string {
  return `${subject} in ${LANGUAGE_NAMES[scanLanguage]}. Use it as a reading hint for ${hintFor}. Write productName in the language it is printed in; do not translate it.`;
}

export function fallbackNamePrompt(locale: CatalogLocale): string {
  return `Always return fallbackIngredientName in ${LANGUAGE_NAMES[locale]}, as a short generic ingredient name suitable for catalog search or creation`;
}
