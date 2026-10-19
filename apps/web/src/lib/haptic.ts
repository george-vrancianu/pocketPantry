/** A short buzz where the device has one. */
export function haptic(ms: number) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Some browsers refuse without a user gesture: it is only a nicety.
  }
}
