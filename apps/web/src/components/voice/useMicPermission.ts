import { useCallback, useEffect, useRef, useState } from 'react';
import { rememberMicExplained } from '../../lib/micExplained';
import {
  MicrophoneError,
  permissionState,
  requestPermission,
  type MicrophonePermission,
} from '../../lib/microphone';

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
  // Counts the "still blocked" shakes, so each one replays the animation.
  const [shakes, setShakes] = useState(0);
  const callbacks = useRef({ onGranted, onUnavailable });
  callbacks.current = { onGranted, onUnavailable };

  // Read once on arrival so a blocked microphone shows on the button before it is pressed.
  useEffect(() => {
    let current = true;
    void permissionState().then((state) => {
      if (current) setPermission(state);
    });
    return () => {
      current = false;
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
    setSheet('blocked');
  }, []);
  const close = useCallback(() => setSheet(null), []);

  const granted = useCallback(() => {
    rememberMicExplained();
    setPermission('granted');
    setSheet(null);
    callbacks.current.onGranted();
  }, []);

  /** Asks the browser now, so its prompt never meets the first real hold. */
  const allow = useCallback(async () => {
    try {
      await requestPermission();
      granted();
    } catch (error) {
      if (error instanceof MicrophoneError && error.reason === 'denied') {
        showBlocked();
      } else {
        setSheet(null);
        callbacks.current.onUnavailable();
      }
    }
  }, [granted, showBlocked]);

  /** "I've allowed it": look again. Where the browser cannot be asked about it, trying is the only way to know. */
  const recheck = useCallback(async () => {
    if ((await refresh()) === 'granted') {
      granted();
      return;
    }
    try {
      await requestPermission();
      granted();
    } catch {
      setShakes((count) => count + 1);
    }
  }, [granted, refresh]);

  return {
    blocked: permission === 'denied',
    sheet,
    shakes,
    refresh,
    showIntro,
    showBlocked,
    close,
    allow,
    recheck,
  };
}
