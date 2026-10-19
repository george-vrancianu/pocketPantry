import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import type { Recording } from '../lib/microphone';
import { holdLongEnough, pressDown } from './voiceHold';

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
