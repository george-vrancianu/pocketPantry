import { useSyncExternalStore } from 'react';
import type { Locale, ScanLanguage } from '../i18n/resources';
import { useScanLanguage } from '../pages/Scan/hooks/useScanLanguage';

/**
 * THE seam for "the Member's Scan Language preference" (ADR 0022). Today it is the app's device-local
 * default: the last choice made under the current UI language, else the UI language. ticket 473 swaps the
 * body of this hook for the server-side Member preference; nothing else needs to change.
 */
export function usePreferredScanLanguage(): {
  locale: Locale;
  scanLanguage: ScanLanguage;
} {
  const { locale, scanLanguage } = useScanLanguage();
  return { locale, scanLanguage };
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
 * writes the preference or the device-local memory.
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
