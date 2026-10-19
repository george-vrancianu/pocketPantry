import { beforeEach, describe, expect, it } from 'vitest';
import type { Recording } from './microphone';
import type { VoiceReviewAction } from './voice';
import {
  getVoiceNoteState,
  isVoiceCapReached,
  resetVoiceNote,
  voiceNote,
} from './voiceNoteStore';

const audio: Recording = {
  blob: new Blob(['x'], { type: 'audio/webm' }),
  mimeType: 'audio/webm',
  durationMs: 2500,
};

const action = (id: string): VoiceReviewAction => ({
  id,
  status: 'ready',
  target: 'shopping',
  op: 'add',
  text: 'milk',
  ingredient: null,
  name: 'milk',
  quantity: 1,
  unit: null,
  scope: null,
  expiresOn: null,
  noExpiry: false,
  location: null,
  rows: {},
  defaults: {},
});

describe('Voice Note store phases', () => {
  beforeEach(resetVoiceNote);

  it('starts idle on the Shopping List', () => {
    expect(getVoiceNoteState()).toMatchObject({
      phase: 'idle',
      page: 'shopping',
    });
  });

  it('goes idle -> recording -> reading -> review, then back to idle on discard', () => {
    voiceNote.startRecording('pantry');
    expect(getVoiceNoteState()).toMatchObject({
      phase: 'recording',
      page: 'pantry',
    });

    voiceNote.read(audio, 'en');
    expect(getVoiceNoteState().phase).toBe('reading');
    expect(getVoiceNoteState().recording).toMatchObject({
      mimeType: 'audio/webm',
      seconds: 2.5,
      scanLanguage: 'en',
    });

    voiceNote.review({ transcript: 'milk', actions: [action('a')] });
    expect(getVoiceNoteState()).toMatchObject({
      phase: 'review',
      proposal: { transcript: 'milk' },
    });
    expect(getVoiceNoteState().recording).toBeUndefined();

    voiceNote.discard();
    expect(getVoiceNoteState().phase).toBe('idle');
    expect(getVoiceNoteState().proposal).toBeUndefined();
  });

  it('keeps the recording for Retry when a failure is retryable', () => {
    voiceNote.startRecording('shopping');
    voiceNote.read(audio, 'en');
    voiceNote.fail('failed', { message: 'No connection', keepRecording: true });
    expect(getVoiceNoteState()).toMatchObject({
      phase: 'failed',
      error: 'failed',
      errorMessage: 'No connection',
    });
    expect(getVoiceNoteState().recording?.seconds).toBe(2.5);

    voiceNote.dismiss();
    expect(getVoiceNoteState()).toMatchObject({ phase: 'idle' });
    expect(getVoiceNoteState().recording).toBeUndefined();
    expect(getVoiceNoteState().error).toBeUndefined();
  });

  it('drops the recording when a failure is not retryable', () => {
    voiceNote.read(audio, 'en');
    voiceNote.fail('nothingHeard', { keepRecording: false });
    expect(getVoiceNoteState().phase).toBe('failed');
    expect(getVoiceNoteState().recording).toBeUndefined();
  });

  it('edits and removes Voice Actions in the proposal', () => {
    voiceNote.review({
      transcript: 'x',
      actions: [action('a'), action('b')],
    });
    voiceNote.edit('a', { quantity: 3 });
    voiceNote.remove('b');
    expect(getVoiceNoteState().proposal?.actions).toEqual([
      expect.objectContaining({ id: 'a', quantity: 3 }),
    ]);
  });
});

describe('Voice Cap state', () => {
  beforeEach(resetVoiceNote);

  it('holds until the reset time, in memory only', () => {
    const resetsAt = '2026-10-20T00:00:00.000Z';
    expect(isVoiceCapReached(Date.parse('2026-10-19T12:00:00Z'))).toBe(false);

    voiceNote.setCap({ cap: 50, resetsAt });
    expect(getVoiceNoteState().voiceCap).toEqual({
      cap: 50,
      resetsAt: Date.parse(resetsAt),
    });
    expect(isVoiceCapReached(Date.parse('2026-10-19T23:59:59Z'))).toBe(true);
    expect(isVoiceCapReached(Date.parse('2026-10-20T00:00:00Z'))).toBe(false);

    resetVoiceNote();
    expect(getVoiceNoteState().voiceCap).toBeUndefined();
  });

  it('survives moving between phases', () => {
    voiceNote.setCap({ cap: 50, resetsAt: '2026-10-20T00:00:00.000Z' });
    voiceNote.startRecording('shopping');
    voiceNote.dismiss();
    expect(getVoiceNoteState().voiceCap?.cap).toBe(50);
  });
});
