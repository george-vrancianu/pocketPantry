/** The part of a WakeLockSentinel this module relies on; older browsers lack the optional parts. */
export type WakeLockHandle = Pick<WakeLockSentinel, 'release'> & {
  released?: boolean;
  addEventListener?: WakeLockSentinel['addEventListener'];
};

/**
 * Keep the screen awake. Returns the function that lets it sleep again. Browsers drop the lock
 * whenever the page is hidden, so while it is held it is asked for again when the page becomes
 * visible. Where the browser has no Screen Wake Lock, or refuses the request, this does nothing and
 * says nothing: it is a nicety.
 */
export function keepScreenAwake(): () => void {
  let released = false;
  let requesting = false;
  let sentinel: WakeLockHandle | undefined;

  const letGo = () => {
    const held = sentinel;
    sentinel = undefined;
    void held?.release().catch(() => undefined);
  };

  const acquire = () => {
    let request: Promise<WakeLockHandle> | undefined;
    try {
      request = navigator.wakeLock?.request('screen');
    } catch {
      // Unsupported, or refused synchronously.
      return;
    }
    if (!request) return;
    requesting = true;
    void request
      .then(
        (granted) => {
          sentinel = granted;
          // The browser dropped it (some do not set `released`, but all fire `release`).
          granted.addEventListener?.('release', () => {
            if (sentinel === granted) sentinel = undefined;
          });
          // Released before the browser answered.
          if (released) letGo();
        },
        () => undefined,
      )
      .finally(() => {
        requesting = false;
      });
  };

  const onVisibilityChange = () => {
    if (released || requesting || document.visibilityState !== 'visible')
      return;
    if (sentinel && !sentinel.released) return;
    acquire();
  };

  // Nothing to keep, or to come back to, where the browser has no Screen Wake Lock.
  if (!navigator.wakeLock) return () => undefined;
  document.addEventListener('visibilitychange', onVisibilityChange);
  acquire();

  return () => {
    released = true;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    letGo();
  };
}
