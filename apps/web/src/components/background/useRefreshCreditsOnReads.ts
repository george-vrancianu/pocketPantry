import { useEffect } from 'react';
import { useRefreshCredits } from '../../lib/credits';
import { linkReads } from '../../lib/linkReads';
import { onScanReadSettled } from '../../lib/scanReads';
import { voiceNote } from '../../lib/voiceNote';

/**
 * Refreshes the Credit Balance whenever a Scan Session read, a Voice Inbox read or a link read settles (a
 * kept read costs Credits, a failed one gives them back, a refused one shows the balance it met),
 * whichever page the Member is on. Mounted once, by the app layout.
 */
export function useRefreshCreditsOnReads() {
  const refresh = useRefreshCredits();
  useEffect(() => {
    const stops = [
      onScanReadSettled(() => void refresh()),
      voiceNote.onReadSettled(() => void refresh()),
      linkReads.onReadSettled(() => void refresh()),
    ];
    return () => stops.forEach((stop) => stop());
  }, [refresh]);
}
