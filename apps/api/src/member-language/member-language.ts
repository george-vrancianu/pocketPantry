import {
  CATALOG_LOCALES,
  FALLBACK_LOCALE,
  type CatalogLocale,
} from '../catalog/catalog.schemas';

/**
 * The jobs a Member's languages do (ADR 0022). Spoken and Scan Language join
 * this list in their own tickets; each is one more case in `resolveLanguage`.
 */
export type LanguageRole = 'ui' | 'catalog';

/** A Member's stored language Preferences, as read from the user row; `null` is "Same as UI Language" (or never chosen). */
export type StoredLanguagePreferences = {
  /** The UI Language. */
  locale: string | null;
  catalogLanguage: string | null;
};

export type MemberLanguages = Record<LanguageRole, CatalogLocale>;

const asCatalogLocale = (value: string | null): CatalogLocale | null =>
  CATALOG_LOCALES.find((locale) => locale === value) ?? null;

/**
 * The language a Member has right now for `role`.
 *
 * Order: the stored Preference; "Same as UI Language" (empty) takes the UI
 * Language; with no stored UI Language, `requestLocale` (the request's
 * `?locale=`, kept until the contract ticket removes it); then English.
 */
export function resolveLanguage(
  role: LanguageRole,
  stored: StoredLanguagePreferences,
  requestLocale?: CatalogLocale,
): CatalogLocale {
  const ui = asCatalogLocale(stored.locale) ?? requestLocale ?? FALLBACK_LOCALE;
  switch (role) {
    case 'ui':
      return ui;
    case 'catalog':
      return asCatalogLocale(stored.catalogLanguage) ?? ui;
  }
}

/** Every role at once, for callers that need more than one. */
export function resolveLanguages(
  stored: StoredLanguagePreferences,
  requestLocale?: CatalogLocale,
): MemberLanguages {
  return {
    ui: resolveLanguage('ui', stored, requestLocale),
    catalog: resolveLanguage('catalog', stored, requestLocale),
  };
}
