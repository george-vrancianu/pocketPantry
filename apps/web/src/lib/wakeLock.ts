/**
 * Keep the screen awake. Returns the function that lets it sleep again. Where the browser has no
 * Screen Wake Lock, or refuses the request, this does nothing and says nothing: it is a nicety.
 */
export function keepScreenAwake(): () => void {
  let released = false;
  let sentinel: { release(): Promise<void> } | undefined;
  const letGo = () => {
    void sentinel?.release().catch(() => undefined);
    sentinel = undefined;
  };
  try {
    const request = navigator.wakeLock?.request('screen');
    void request?.then(
      (granted) => {
        sentinel = granted;
        // Released before the browser answered.
        if (released) letGo();
      },
      () => undefined,
    );
  } catch {
    // Unsupported, or refused synchronously.
  }
  return () => {
    released = true;
    letGo();
  };
}
