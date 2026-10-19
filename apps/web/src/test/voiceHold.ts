import { act } from '@testing-library/react';
import { vi } from 'vitest';

/** Voice Note tests run on fake timers (advancing with the clock), so a hold is a stretch of fake time. */
export function useVoiceTimers() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
}

/** Keep the button held for `ms` (a press under 0.3 s is a tap, not a Voice Note). */
export const holdFor = (ms: number) =>
  act(() => vi.advanceTimersByTimeAsync(ms));

/** Long enough to count as a Voice Note rather than a tap. */
export const holdLongEnough = () => holdFor(300);
