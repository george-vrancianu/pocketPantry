import { useEffect, useState } from 'react';

/** How often the Listening card's clock and the progress ring move, ms. */
const TICK_MS = 200;

/**
 * Milliseconds since the recording started (`startedAt`), ticking on its own clock so the Voice
 * Note module need not; 0 until the microphone is live.
 */
export function useElapsedMs(startedAt: number | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (startedAt === undefined) return;
    // oxlint-disable-next-line react/set-state-in-effect -- restarts the clock when the recording starts; Date.now() is the external system
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(id);
  }, [startedAt]);
  return startedAt === undefined ? 0 : Math.max(0, now - startedAt);
}
