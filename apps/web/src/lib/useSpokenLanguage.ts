import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FALLBACK_LOCALE,
  isLocale,
  type ScanLanguage,
} from '../i18n/resources';
import { useMemberPreferences } from './settings';

/**
 * THE seam for "the Member's Spoken Language preference" (ADR 0022): the effective value the API works
 * out (the Preference, else the UI Language). Until the Preferences have loaded (or if they cannot), it
 * is the UI Language.
 */
export function usePreferredSpokenLanguage(): { spokenLanguage: ScanLanguage } {
  const { i18n } = useTranslation();
  const locale = isLocale(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : FALLBACK_LOCALE;
  const preferences = useMemberPreferences();
  return {
    spokenLanguage: preferences.data?.effectiveSpokenLanguage ?? locale,
  };
}

/**
 * The language of the next Voice Note, for the Voice Note chip: the Spoken Language preference unless
 * the chip was changed. A pick is for one Voice Note only (`reset` drops it once that note has been
 * recorded), is never saved, and has nothing to do with the camera's Scan Language chip.
 */
export function useSpokenLanguage(): {
  spokenLanguage: ScanLanguage;
  setSpokenLanguage: (language: ScanLanguage) => void;
  reset: () => void;
} {
  const { spokenLanguage: preferred } = usePreferredSpokenLanguage();
  const [picked, setPicked] = useState<ScanLanguage | null>(null);
  const reset = useCallback(() => setPicked(null), []);
  return {
    spokenLanguage: picked ?? preferred,
    setSpokenLanguage: setPicked,
    reset,
  };
}
