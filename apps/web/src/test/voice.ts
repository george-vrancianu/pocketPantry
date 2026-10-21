import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Recording } from '../lib/microphone';
import { voiceNote } from '../lib/voiceNote';
import { holdLongEnough, pressDown } from './voiceHold';

/*
 * The shared fake voice environment. Import this module BEFORE anything that reaches the
 * microphone module (the page, the Voice Note store): it registers the mock, and a module that
 * is already loaded keeps the real one.
 *
 * - Microphone: jsdom has no getUserMedia or MediaRecorder, so the microphone module is the seam.
 *   `mic.start` / `mic.permission` / `mic.request` are the mocks behind it.
 * - Wake lock: a fake `navigator.wakeLock`; `wake.request` / `wake.released` are its mocks.
 * - Send-Voice-Note request: `stubVoiceFetch` wraps the stubbed API and returns what is sent.
 *
 * Call `resetVoiceEnvironment()` in `beforeEach` to put all of it back to its defaults.
 */
const fakes = vi.hoisted(() => ({
  MicrophoneError: class MicrophoneError extends Error {
    constructor(readonly reason: string) {
      super(reason);
    }
  },
  mic: { start: vi.fn(), permission: vi.fn(), request: vi.fn() },
  wake: { request: vi.fn(), released: vi.fn() },
}));

vi.mock('../lib/microphone', () => ({
  startRecording: fakes.mic.start,
  permissionState: fakes.mic.permission,
  requestPermission: fakes.mic.request,
  watchPermission: () => () => {},
  MicrophoneError: fakes.MicrophoneError,
}));

/** The microphone module's error, as the page sees it (the page checks `instanceof`). */
export const MicrophoneError = fakes.MicrophoneError;

export const mic = fakes.mic;
export const wake = fakes.wake;

/** Defaults: a granted microphone that hands out `fakeSession()`s, a supported wake lock. */
export function resetVoiceEnvironment() {
  // First: dropping the Voice Note releases the wake lock, which the resets below then forget.
  voiceNote.reset();
  mic.start.mockReset();
  mic.start.mockImplementation(() => Promise.resolve(fakeSession()));
  mic.permission.mockReset();
  mic.permission.mockResolvedValue('granted');
  mic.request.mockReset();
  mic.request.mockResolvedValue(undefined);
  wake.released.mockReset();
  wake.released.mockImplementation(() => Promise.resolve());
  wake.request.mockReset();
  wake.request.mockImplementation(() =>
    Promise.resolve({ release: wake.released }),
  );
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: { request: wake.request },
  });
}

/** Take the wake lock away, as on a browser without Screen Wake Lock. */
export function removeWakeLock() {
  Object.defineProperty(navigator, 'wakeLock', {
    configurable: true,
    value: undefined,
  });
}

/**
 * Route `fetch` through `fetchMock`, recording every Voice Note upload (a FormData body) and its abort signal.
 * `onRequest` sees every request first, e.g. to capture another body.
 */
export function stubVoiceFetch(
  fetchMock: (input: RequestInfo | URL, init?: RequestInit) => unknown,
  onRequest?: (input: RequestInfo | URL, init?: RequestInit) => void,
) {
  const sent: FormData[] = [];
  const signals: AbortSignal[] = [];
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    onRequest?.(input, init);
    if (init?.body instanceof FormData) {
      sent.push(init.body);
      if (init.signal) signals.push(init.signal);
    }
    return fetchMock(input, init);
  });
  return { sent, signals };
}

/** A three second Voice Note recording, as the microphone module hands it over. */
export const recording: Recording = {
  blob: new Blob(['audio-bytes'], { type: 'audio/webm' }),
  mimeType: 'audio/webm;codecs=opus',
  durationMs: 3000,
};

/** A live microphone session that stops with `recording`. */
export function fakeSession() {
  return {
    stop: vi.fn(() => Promise.resolve(recording)),
    cancel: vi.fn(),
    level: vi.fn(() => 0),
  };
}

export const talkButton = () =>
  screen.findByRole('button', { name: /hold to record a voice note/i });

/** Press the voice button, wait for Listening and hold past a tap; the button is returned still held. */
export async function hold({
  init,
  prepare,
}: {
  init?: PointerEventInit;
  /** Runs before the press, e.g. to give the button a position (jsdom has no layout). */
  prepare?: (button: HTMLElement) => void;
} = {}) {
  const button = await talkButton();
  prepare?.(button);
  pressDown(button, init);
  await screen.findByText('Listening');
  await holdLongEnough();
  return button;
}

/** A Catalog Ingredient as the Voice endpoints return it. */
export const voiceIngredient = (
  id: string,
  name: string,
  overrides: Record<string, unknown> = {},
) => ({
  owner: 'catalog',
  amountScale: 'medium',
  id,
  name,
  defaultUnit: 'pcs',
  leafCategory: { id: 'leaf', name: 'Leaf' },
  parentCategory: {
    id: 'parent',
    name: 'Parent',
    aisle: { id: 'aisle', name: 'Aisle' },
  },
  defaults: { expiryDays: 7, location: 'fridge' },
  ...overrides,
});

/** A ready Voice Action to add to the Pantry; each test passes what differs. */
export const voiceAction = (overrides: Record<string, unknown> = {}) => ({
  id: 'a1',
  status: 'ready',
  target: 'pantry',
  op: 'add',
  text: 'x',
  ingredient: null,
  name: null,
  quantity: null,
  unit: null,
  scope: null,
  expiresOn: null,
  noExpiry: false,
  location: null,
  rows: {},
  defaults: {},
  ...overrides,
});
