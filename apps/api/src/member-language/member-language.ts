import {
  CATALOG_LOCALES,
  FALLBACK_LOCALE,
  SCAN_LANGUAGES,
  type CatalogLocale,
  type ScanLanguage,
} from '../catalog/catalog.schemas';

/**
 * The jobs a Member's languages do (ADR 0022). Spoken Language joins
 * this list in its own ticket; it is one more case in `resolveLanguage`.
 */
export type LanguageRole = 'ui' | 'catalog' | 'scan';

/** A Member's stored language Preferences, as read from the user row; `null` is "Same as UI Language" (or never chosen). */
export type StoredLanguagePreferences = {
  /** The UI Language. */
  locale: string | null;
  catalogLanguage: string | null;
  scanLanguage: string | null;
};

/** The language list each role draws from; the lists are kept separate (ADR 0003) even while they match. */
export type RoleLanguage = {
  ui: CatalogLocale;
  catalog: CatalogLocale;
  scan: ScanLanguage;
};

export type MemberLanguages = RoleLanguage;

export type LanguageOptions = {
  /** An explicit choice for this one job (say, this Scan Session); wins over everything stored. */
  override?: RoleLanguage[LanguageRole];
  /** The request's `?locale=`, kept until the contract ticket removes it. */
  requestLocale?: CatalogLocale;
};

const asCatalogLocale = (value: string | null): CatalogLocale | null =>
  CATALOG_LOCALES.find((locale) => locale === value) ?? null;

const asScanLanguage = (value: string | null): ScanLanguage | null =>
  SCAN_LANGUAGES.find((language) => language === value) ?? null;

/**
 * The language a Member has right now for `role`.
 *
 * Order: `override`; the stored Preference; "Same as UI Language" (empty)
 * takes the UI Language; with no stored UI Language, `requestLocale`; then
 * English. A Scan Language only takes values from the Scan Languages list: a
 * UI Language that is not on it falls back to English.
 */
export function resolveLanguage<Role extends LanguageRole>(
  role: Role,
  stored: StoredLanguagePreferences,
  options?: LanguageOptions,
): RoleLanguage[Role];
export function resolveLanguage(
  role: LanguageRole,
  stored: StoredLanguagePreferences,
  options: LanguageOptions = {},
): RoleLanguage[LanguageRole] {
  const { override, requestLocale } = options;
  if (override) return override;
  const ui = asCatalogLocale(stored.locale) ?? requestLocale ?? FALLBACK_LOCALE;
  switch (role) {
    case 'ui':
      return ui;
    case 'catalog':
      return asCatalogLocale(stored.catalogLanguage) ?? ui;
    case 'scan':
      return (
        asScanLanguage(stored.scanLanguage) ??
        asScanLanguage(ui) ??
        FALLBACK_LOCALE
      );
  }
}

/** Every role at once, for callers that need more than one. */
export function resolveLanguages(
  stored: StoredLanguagePreferences,
  options: Pick<LanguageOptions, 'requestLocale'> = {},
): MemberLanguages {
  return {
    ui: resolveLanguage('ui', stored, options),
    catalog: resolveLanguage('catalog', stored, options),
    scan: resolveLanguage('scan', stored, options),
  };
}
