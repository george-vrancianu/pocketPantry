import { useEffect } from 'react';
import { useRefreshCredits } from '../../lib/credits';
import { onScanReadSettled } from '../../lib/scanReads';

/**
 * Refreshes the Credit Balance whenever a Scan Session read settles (a kept read costs Credits, a
 * failed one gives them back), whichever page the Member is on. Mounted once, by the app layout.
 */
export function useRefreshCreditsOnScanRead() {
  const refresh = useRefreshCredits();
  useEffect(() => onScanReadSettled(() => void refresh()), [refresh]);
}
