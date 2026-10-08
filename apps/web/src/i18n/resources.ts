export const LOCALES = ['en', 'ro', 'da'] as const;
export type Locale = (typeof LOCALES)[number];
export const FALLBACK_LOCALE: Locale = 'en';

/** Languages a Scan can be read in; wider than `LOCALES` (the UI and Catalog languages). */
export const SCAN_LANGUAGES = ['en', 'ro', 'da'] as const;
export type ScanLanguage = (typeof SCAN_LANGUAGES)[number];

type Namespaces = Record<string, Record<string, unknown>>;

const modules = import.meta.glob<Record<string, unknown>>(
  './locales/*/*.json',
  { eager: true, import: 'default' },
);

/** `./locales/<locale>/<namespace>.json` becomes `resources[locale][namespace]`. */
function collect(): Record<Locale, Namespaces> {
  const resources = Object.fromEntries(
    LOCALES.map((locale) => [locale, {} as Namespaces]),
  ) as Record<Locale, Namespaces>;
  for (const [path, content] of Object.entries(modules)) {
    const match = /\.\/locales\/([^/]+)\/([^/]+)\.json$/.exec(path);
    if (!match) continue;
    const [, locale, namespace] = match;
    if (!(locale in resources)) continue;
    resources[locale as Locale][namespace] = content;
  }
  return resources;
}

export const resources = collect();
export const namespaces = Object.keys(resources[FALLBACK_LOCALE]);

export function isScanLanguage(
  value: string | null | undefined,
): value is ScanLanguage {
  return SCAN_LANGUAGES.some((language) => language === value);
}

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
