// Kept apart from `voice.ts` so the microphone module does not pull in the API client.

const EXPLAINED_KEY = 'pp.voice.micExplained';

/** Whether the "why the microphone" explanation has been shown and accepted. */
export function micExplained(): boolean {
  try {
    return window.localStorage.getItem(EXPLAINED_KEY) !== null;
  } catch {
    return false;
  }
}

export function rememberMicExplained(): void {
  try {
    window.localStorage.setItem(EXPLAINED_KEY, '1');
  } catch {
    // Not persisting just shows the explanation again.
  }
}
