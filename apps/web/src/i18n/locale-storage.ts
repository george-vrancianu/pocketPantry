import { FALLBACK_LOCALE, isLocale, type Locale } from './resources';

const STORAGE_KEY = 'pocket-pantry.locale';

/** Saved choice first, then the browser language, then English. */
export function detectLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  const browser = window.navigator.language.slice(0, 2).toLowerCase();
  return isLocale(browser) ? browser : FALLBACK_LOCALE;
}

export function saveLocale(locale: Locale): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Not persisting is acceptable.
  }
}
