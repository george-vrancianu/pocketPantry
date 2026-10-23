import { useState } from 'react';
import type { Locale, ScanLanguage } from '../i18n/resources';
import { usePreferredScanLanguage } from './sessionScanLanguage';

/**
 * The language the next Scan is read in, for a camera or button that has no Scan Session:
 * the Member's Scan Language preference, unless the chip was changed there. A change lasts only as long
 * as the component that asked and is never saved.
 */
export function useScanLanguage(): {
  locale: Locale;
  scanLanguage: ScanLanguage;
  setScanLanguage: (language: ScanLanguage) => void;
} {
  const { locale, scanLanguage: preferred } = usePreferredScanLanguage();
  const [picked, setPicked] = useState<ScanLanguage | null>(null);
  return {
    locale,
    scanLanguage: picked ?? preferred,
    setScanLanguage: setPicked,
  };
}
