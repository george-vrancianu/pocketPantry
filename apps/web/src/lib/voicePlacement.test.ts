import { describe, expect, it } from 'vitest';
import {
  aboveButton,
  PILL_GAP,
  PILL_HEIGHT,
  abovePill,
  voiceToast,
  VOICE_LAYER,
} from './voicePlacement';

describe('voice placement', () => {
  it('lifts the pill-aware spot clear of the status pill and the air above it', () => {
    expect(abovePill).toEqual(aboveButton(22 + PILL_HEIGHT + PILL_GAP));
    expect(PILL_HEIGHT).toBeGreaterThanOrEqual(56);
  });

  it('puts a voice toast just above the button, or above the pill when one is up', () => {
    expect(voiceToast()).toEqual({ polite: true, bottom: aboveButton(10) });
    expect(voiceToast({ abovePill: true })).toEqual({
      polite: true,
      bottom: abovePill,
    });
  });

  it('keeps the layers in order: scrim, button, cards and pill, then toasts', () => {
    expect(VOICE_LAYER.scrim).toBeLessThan(VOICE_LAYER.button);
    expect(VOICE_LAYER.button).toBeLessThan(VOICE_LAYER.card);
  });
});
