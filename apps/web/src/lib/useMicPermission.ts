import { useCallback, useEffect, useRef, useState } from 'react';
import { rememberMicExplained } from './micExplained';
import {
  MicrophoneError,
  permissionState,
  requestPermission,
  watchPermission,
  type MicrophonePermission,
} from './microphone';

export type MicSheet = 'intro' | 'blocked' | null;

/**
 * What the Voice Note button knows about the microphone: its permission, and which of the two
 * microphone sheets (the intro before it is asked for, the blocked one after a refusal) is open.
 * `onGranted` runs when the Member has just allowed it ("Microphone on"); `onUnavailable` when the
 * browser has no microphone to ask for.
 */
export function useMicPermission({
  onGranted,
  onUnavailable,
}: {
  onGranted: () => void;
  onUnavailable: () => void;
}) {
  const [permission, setPermission] = useState<MicrophonePermission>('granted');
  const [sheet, setSheet] = useState<MicSheet>(null);
  // Counts the "still blocked" answers: each replays the shake and re-announces the notice.
  const [stillBlocked, setStillBlocked] = useState(0);
  // A request to the browser is in flight: further taps wait for it.
  const [requesting, setRequesting] = useState(false);
  const inFlight = useRef(false);
  const callbacks = useRef({ onGranted, onUnavailable });
  callbacks.current = { onGranted, onUnavailable };

  // Read on arrival, and whenever the browser's setting changes, so a blocked microphone shows on the button.
  useEffect(() => {
    let current = true;
    void permissionState().then((state) => {
      if (current) setPermission(state);
    });
    const stop = watchPermission((state) => {
      if (current) setPermission(state);
    });
    return () => {
      current = false;
      stop();
    };
  }, []);

  /** The permission right now: the browser's settings can change under a page that stays open. */
  const refresh = useCallback(async () => {
    const state = await permissionState();
    setPermission(state);
    return state;
  }, []);

  const showIntro = useCallback(() => setSheet('intro'), []);
  const showBlocked = useCallback(() => {
    setPermission('denied');
    setStillBlocked(0);
    setSheet('blocked');
  }, []);
  const close = useCallback(() => setSheet(null), []);

  const granted = useCallback(() => {
    rememberMicExplained();
    setPermission('granted');
    setSheet(null);
    callbacks.current.onGranted();
  }, []);

  /** Runs one request at a time. */
  const once = useCallback(async (run: () => Promise<void>) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRequesting(true);
    try {
      await run();
    } finally {
      inFlight.current = false;
      setRequesting(false);
    }
  }, []);

  const unavailable = useCallback(() => {
    setSheet(null);
    callbacks.current.onUnavailable();
  }, []);

  /** Asks the browser now, so its prompt never meets the first real hold. */
  const allow = useCallback(
    () =>
      once(async () => {
        try {
          await requestPermission();
          granted();
        } catch (error) {
          if (isDenied(error)) showBlocked();
          else unavailable();
        }
      }),
    [once, granted, showBlocked, unavailable],
  );

  /** "I've allowed it": look again. Where the browser cannot be asked about it, trying is the only way to know. */
  const recheck = useCallback(
    () =>
      once(async () => {
        if ((await refresh()) === 'granted') {
          granted();
          return;
        }
        try {
          await requestPermission();
          granted();
        } catch (error) {
          if (isDenied(error)) setStillBlocked((count) => count + 1);
          else unavailable();
        }
      }),
    [once, granted, refresh, unavailable],
  );

  return {
    blocked: permission === 'denied',
    sheet,
    stillBlocked,
    requesting,
    refresh,
    showIntro,
    showBlocked,
    close,
    allow,
    recheck,
  };
}

function isDenied(error: unknown) {
  return error instanceof MicrophoneError && error.reason === 'denied';
}
