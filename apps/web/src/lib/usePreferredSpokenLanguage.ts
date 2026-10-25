import type { ScanLanguage } from '../i18n/resources';
import { usePreferredLanguage } from './preferredLanguage';

/**
 * THE seam for "the Member's Spoken Language preference" (ADR 0022): `spokenLanguage` is what is shown,
 * `spokenLanguageToSend` what an upload carries (nothing until the Preferences have loaded).
 */
export function usePreferredSpokenLanguage(): {
  spokenLanguage: ScanLanguage;
  spokenLanguageToSend: ScanLanguage | undefined;
} {
  const { shown, sent } = usePreferredLanguage('effectiveSpokenLanguage');
  return { spokenLanguage: shown, spokenLanguageToSend: sent };
}
