import { useTranslation } from 'react-i18next';
import {
  FALLBACK_LOCALE,
  isLocale,
  type ScanLanguage,
} from '../i18n/resources';
import { useMemberPreferences } from './settings';

/**
 * The Member's effective Scan or Spoken Language (ADR 0022), as the API works it out (the Preference, else the
 * UI Language). `shown` is for display: until the Preferences have loaded (or if they cannot) it is the UI
 * Language. `sent` is for a request: it is `undefined` until then, so nothing is sent and the API resolves
 * the language itself instead of the UI Language beating the stored Preference.
 */
export function usePreferredLanguage(
  field: 'effectiveScanLanguage' | 'effectiveSpokenLanguage',
): { shown: ScanLanguage; sent: ScanLanguage | undefined } {
  const { i18n } = useTranslation();
  const locale = isLocale(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : FALLBACK_LOCALE;
  const preferred = useMemberPreferences().data?.[field];
  return { shown: preferred ?? locale, sent: preferred };
}
