import { useCallback, useState } from 'react';
import type { ScanLanguage } from '../i18n/resources';
import { usePreferredLanguage } from './preferredLanguage';

/**
 * THE seam for "the Member's Spoken Language preference" (ADR 0022): `spokenLanguage` is what a chip shows,
 * `spokenLanguageToSend` what an upload carries (nothing until the Preferences have loaded).
 */
export function usePreferredSpokenLanguage(): {
  spokenLanguage: ScanLanguage;
  spokenLanguageToSend: ScanLanguage | undefined;
} {
  const { shown, sent } = usePreferredLanguage('effectiveSpokenLanguage');
  return { spokenLanguage: shown, spokenLanguageToSend: sent };
}

/**
 * The language of the next Voice Note, for the Voice Note chip: the Spoken Language preference unless
 * the chip was changed. A pick is for one Voice Note only (`reset` drops it once that note has been
 * recorded), is never saved, and has nothing to do with the camera's Scan Language chip.
 */
export function useSpokenLanguage(): {
  spokenLanguage: ScanLanguage;
  /** What the upload carries: the pick, else the preference, else nothing (the API resolves it). */
  spokenLanguageToSend: ScanLanguage | undefined;
  setSpokenLanguage: (language: ScanLanguage) => void;
  reset: () => void;
} {
  const { spokenLanguage: preferred, spokenLanguageToSend: preferredToSend } =
    usePreferredSpokenLanguage();
  const [picked, setPicked] = useState<ScanLanguage | null>(null);
  const reset = useCallback(() => setPicked(null), []);
  return {
    spokenLanguage: picked ?? preferred,
    spokenLanguageToSend: picked ?? preferredToSend,
    setSpokenLanguage: setPicked,
    reset,
  };
}
