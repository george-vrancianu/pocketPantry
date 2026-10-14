import { useEffect, useMemo, useState } from 'react';
import { fromIso, localDate, localIso } from './pantry';

/**
 * Today on the device's calendar, as local midnight. It moves on at local midnight and when the page becomes
 * visible again (a sleeping phone misses the timer), so a screen left open past midnight doesn't count days from
 * yesterday. The Date keeps its identity until the day changes.
 */
export function useToday(): Date {
  const [iso, setIso] = useState(() => localIso(new Date()));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refresh = () => setIso(localIso(new Date()));
    const schedule = () => {
      const now = new Date();
      const midnight = localDate(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, midnight.getTime() - now.getTime());
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') return;
      refresh();
      clearTimeout(timer);
      schedule();
    };
    schedule();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return useMemo(() => fromIso(iso), [iso]);
}
