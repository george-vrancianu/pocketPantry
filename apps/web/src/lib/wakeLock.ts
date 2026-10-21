type Sentinel = { released?: boolean; release(): Promise<void> };

/**
 * Keep the screen awake. Returns the function that lets it sleep again. Browsers drop the lock
 * whenever the page is hidden, so while it is held it is asked for again when the page becomes
 * visible. Where the browser has no Screen Wake Lock, or refuses the request, this does nothing and
 * says nothing: it is a nicety.
 */
export function keepScreenAwake(): () => void {
  let released = false;
  let requesting = false;
  let sentinel: Sentinel | undefined;

  const letGo = () => {
    const held = sentinel;
    sentinel = undefined;
    void held?.release().catch(() => undefined);
  };

  const acquire = () => {
    requesting = true;
    try {
      const request = navigator.wakeLock?.request('screen');
      if (!request) {
        requesting = false;
        return;
      }
      void request.then(
        (granted) => {
          requesting = false;
          sentinel = granted;
          // Released before the browser answered.
          if (released) letGo();
        },
        () => {
          requesting = false;
        },
      );
    } catch {
      // Unsupported, or refused synchronously.
      requesting = false;
    }
  };

  const onVisibilityChange = () => {
    if (released || requesting || document.visibilityState !== 'visible')
      return;
    if (sentinel && !sentinel.released) return;
    acquire();
  };

  document.addEventListener('visibilitychange', onVisibilityChange);
  acquire();

  return () => {
    released = true;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    letGo();
  };
}
