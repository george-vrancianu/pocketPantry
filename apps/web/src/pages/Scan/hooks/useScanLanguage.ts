import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FALLBACK_LOCALE,
  isLocale,
  type Locale,
  type ScanLanguage,
} from '../../../i18n/resources';
import { loadScanLanguage, saveScanLanguage } from '../../../lib/scanLanguage';

/**
 * The language the next Scan is read in. It starts as the last choice made under the current UI
 * language, else the UI language, and follows the UI language when that changes.
 */
export function useScanLanguage(): {
  locale: Locale;
  scanLanguage: ScanLanguage;
  setScanLanguage: (language: ScanLanguage) => void;
} {
  const { i18n } = useTranslation();
  const locale = isLocale(i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : FALLBACK_LOCALE;
  const [chosen, setChosen] = useState<{
    locale: Locale;
    language: ScanLanguage;
  }>(() => ({ locale, language: loadScanLanguage(locale) }));
  // A choice made under another UI language no longer applies.
  const scanLanguage =
    chosen.locale === locale ? chosen.language : loadScanLanguage(locale);
  // Forget it for good, so coming back to the earlier UI language does not bring it back.
  useEffect(() => {
    if (chosen.locale === locale) return;
    saveScanLanguage(locale, scanLanguage);
    setChosen({ locale, language: scanLanguage });
  }, [chosen.locale, locale, scanLanguage]);
  return {
    locale,
    scanLanguage,
    setScanLanguage: (language) => {
      saveScanLanguage(locale, language);
      setChosen({ locale, language });
    },
  };
}
