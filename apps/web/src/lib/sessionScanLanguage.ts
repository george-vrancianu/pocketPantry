import { useSyncExternalStore } from 'react';
import type { ScanLanguage } from '../i18n/resources';
import { usePreferredLanguage } from './preferredLanguage';

/**
 * THE seam for "the Member's Scan Language preference" (ADR 0022): `scanLanguage` is what a chip shows,
 * `scanLanguageToSend` what a request carries (nothing until the Preferences have loaded).
 */
export function usePreferredScanLanguage(): {
  scanLanguage: ScanLanguage;
  scanLanguageToSend: ScanLanguage | undefined;
} {
  const { shown, sent } = usePreferredLanguage('effectiveScanLanguage');
  return { scanLanguage: shown, scanLanguageToSend: sent };
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
  scanLanguage: ScanLanguage;
  /** What a Scan carries: the pick, else the preference, else nothing (the API resolves it). */
  scanLanguageToSend: ScanLanguage | undefined;
  override: ScanLanguage | null;
  setOverride: (language: ScanLanguage) => void;
} {
  const { scanLanguage: preferred, scanLanguageToSend: preferredToSend } =
    usePreferredScanLanguage();
  const picked = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => override,
  );
  return {
    scanLanguage: picked ?? preferred,
    scanLanguageToSend: picked ?? preferredToSend,
    override: picked,
    setOverride: setScanLanguageOverride,
  };
}
