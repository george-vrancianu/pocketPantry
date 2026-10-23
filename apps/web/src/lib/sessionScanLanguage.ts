import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FALLBACK_LOCALE,
  isLocale,
  type Locale,
  type ScanLanguage,
} from '../i18n/resources';
import { useMemberPreferences } from './settings';

/**
 * THE seam for "the Member's Scan Language preference" (ADR 0022): the effective value the API works out
 * (the Preference, else the UI Language), the same on every device. Until the Preferences have loaded
 * (or if they cannot), it is the UI Language. `locale` is the UI Language.
 */
export function usePreferredScanLanguage(): {
  locale: Locale;
  scanLanguage: ScanLanguage;
} {
  const { i18n } = useTranslation();
  const locale = isLocale(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : FALLBACK_LOCALE;
  const preferences = useMemberPreferences();
  return {
    locale,
    scanLanguage: preferences.data?.effectiveScanLanguage ?? locale,
  };
}

/**
 * The Scan Language picked on the Scan page for the rest of the Scan Session, if any. It lives with
 * the Scan Session, not in storage and not on the server, so it survives Scan -> Review -> Take more,
 * and ends with the Session (`resetScanSession` clears it).
 */
let override: ScanLanguage | null = null;
const listeners = new Set<() => void>();

export function setScanLanguageOverride(language: ScanLanguage | null): void {
  if (override === language) return;
  override = language;
  listeners.forEach((listener) => listener());
}

export const clearScanLanguageOverride = () => setScanLanguageOverride(null);

/**
 * The Scan Language of the Scan Session: the pick if there is one, else the preference. A pick never
 * writes the preference.
 */
export function useSessionScanLanguage(): {
  locale: Locale;
  scanLanguage: ScanLanguage;
  override: ScanLanguage | null;
  setOverride: (language: ScanLanguage) => void;
} {
  const { locale, scanLanguage: preferred } = usePreferredScanLanguage();
  const picked = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => override,
  );
  return {
    locale,
    scanLanguage: picked ?? preferred,
    override: picked,
    setOverride: setScanLanguageOverride,
  };
}
