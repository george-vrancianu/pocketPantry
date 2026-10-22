import { describe, expect, it } from 'vitest';
import { aboveDock, DOCK_HEIGHT } from '@pocket-pantry/ui';
import {
  aboveMic,
  micBottom,
  MIC_ROW,
  PILL_GAP,
  PILL_HEIGHT,
  PILL_OFFSET,
  abovePill,
  voiceToast,
  VOICE_LAYER,
} from './voicePlacement';

describe('voice placement', () => {
  it('lifts the pill-aware spot clear of the status pill and the air above it', () => {
    expect(abovePill).toEqual(aboveMic(PILL_OFFSET + PILL_HEIGHT + PILL_GAP));
    expect(PILL_HEIGHT).toBeGreaterThanOrEqual(56);
  });

  it('puts a voice toast just above the mic, or above the pill when one is up', () => {
    expect(voiceToast()).toEqual({ polite: true, bottom: aboveMic(10) });
    expect(voiceToast({ abovePill: true })).toEqual({
      polite: true,
      bottom: abovePill,
    });
  });

  it('hangs the notices above the capsule that overhangs the Dock', () => {
    expect(micBottom.xs).toBe(aboveDock(DOCK_HEIGHT.xs));
    expect(micBottom.md).toBe(aboveDock(DOCK_HEIGHT.md));
    expect(aboveMic(0).xs).toContain(String(MIC_ROW));
  });

  it('keeps the layers in order: scrim, then cards and pill', () => {
    expect(VOICE_LAYER.scrim).toBeLessThan(VOICE_LAYER.card);
  });
});
