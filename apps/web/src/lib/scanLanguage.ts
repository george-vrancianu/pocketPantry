import {
  isScanLanguage,
  SCAN_LANGUAGES,
  type Locale,
  type ScanLanguage,
} from '../i18n/resources';

const STORAGE_KEY = 'pocket-pantry.scan-language';

/** The UI language first, then the other Scan Languages. */
export function scanLanguageOptions(locale: Locale) {
  const ordered = [
    locale,
    ...SCAN_LANGUAGES.filter((language) => language !== locale),
  ];
  return ordered.map((value) => ({
    value,
    label: value.toUpperCase(),
  }));
}

/** The last choice made under this UI language, else the UI language itself. */
export function loadScanLanguage(locale: Locale): ScanLanguage {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? 'null',
    ) as { locale?: unknown; language?: unknown } | null;
    if (
      saved?.locale === locale &&
      typeof saved.language === 'string' &&
      isScanLanguage(saved.language)
    ) {
      return saved.language;
    }
  } catch {
    // Storage can be blocked or hold junk; fall back to the UI language.
  }
  return locale;
}

/** Remembered with the UI language it was chosen under, so changing that language resets it. */
export function saveScanLanguage(locale: Locale, language: ScanLanguage): void {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ locale, language }),
    );
  } catch {
    // Not persisting is acceptable.
  }
}
