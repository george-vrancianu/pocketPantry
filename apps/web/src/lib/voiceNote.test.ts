import { describe, expect, it, vi } from 'vitest';
import { createVoiceNote } from './voiceNote';
import type { VoiceNoteResult } from './voice';

const action = (id: string) =>
  ({ id, kind: 'add', quantity: 1, name: id }) as never;

const result = (...ids: string[]): VoiceNoteResult =>
  ({ transcript: 'milk and eggs', actions: ids.map(action) }) as never;

const recording = {
  blob: new Blob(['x']),
  mimeType: 'audio/webm',
  durationMs: 2000,
};

function setup() {
  const release = vi.fn();
  const keepScreenAwake = vi.fn(() => release);
  const note = createVoiceNote({ keepScreenAwake });
  return { note, release, keepScreenAwake };
}

function inReview(...ids: string[]) {
  const ctx = setup();
  ctx.note.read(recording, 'en', 'shopping');
  ctx.note.review(result(...ids));
  return ctx;
}

const ids = (note: ReturnType<typeof createVoiceNote>) =>
  note.getState().proposal?.actions.map((a) => a.id);

describe('Voice Note module', () => {
  describe('Review edits', () => {
    it('removes a Voice Action', () => {
      const { note } = inReview('a', 'b');
      note.remove('a');
      expect(ids(note)).toEqual(['b']);
    });

    it('edits one Voice Action and leaves the others', () => {
      const { note } = inReview('a', 'b');
      note.edit('b', { quantity: 7 });
      const [a, b] = note.getState().proposal!.actions;
      expect([a.quantity, b.quantity]).toEqual([1, 7]);
    });

    it('ignores edits outside Review', () => {
      const { note } = setup();
      note.remove('a');
      note.edit('a', { quantity: 2 });
      expect(note.getState().proposal).toBeUndefined();
    });

    it('notifies subscribers of an edit', () => {
      const { note } = inReview('a');
      const listener = vi.fn();
      note.subscribe(listener);
      note.remove('a');
      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe('Apply', () => {
    it('applies only from Review', () => {
      const { note } = setup();
      note.applying();
      expect(note.getState().phase).toBe('idle');
      note.read(recording, 'en', 'shopping');
      note.applying();
      expect(note.getState().phase).toBe('reading');
      note.review(result('a'));
      note.applying();
      expect(note.getState().phase).toBe('applying');
    });

    it('goes back to Review with the edits kept when Apply fails', () => {
      const { note } = inReview('a', 'b');
      note.remove('a');
      note.edit('b', { quantity: 9 });
      note.applying();
      note.applyFailed();
      expect(note.getState().phase).toBe('review');
      expect(ids(note)).toEqual(['b']);
      expect(note.getState().proposal!.actions[0].quantity).toBe(9);
    });

    it('ignores apply failed outside applying', () => {
      const { note } = inReview('a');
      note.applyFailed();
      expect(note.getState().phase).toBe('review');
    });

    it('ignores edits while applying', () => {
      const { note } = inReview('a');
      note.applying();
      note.remove('a');
      expect(ids(note)).toEqual(['a']);
    });

    it('ignores discard while applying', () => {
      const { note } = inReview('a');
      note.applying();
      note.discard();
      expect(note.getState().phase).toBe('applying');
    });

    it('discards from Review', () => {
      const { note } = inReview('a');
      note.discard();
      expect(note.getState().phase).toBe('idle');
      expect(note.getState().proposal).toBeUndefined();
    });

    it('returns to idle once applied', () => {
      const { note } = inReview('a');
      note.applying();
      note.applied();
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().proposal).toBeUndefined();
    });

    it('ignores applied outside applying', () => {
      const { note } = inReview('a');
      note.applied();
      expect(note.getState().phase).toBe('review');
    });
  });

  describe('Voice Cap', () => {
    it('is in force until the reset time', () => {
      const { note } = setup();
      note.setCap({ cap: 5, resetsAt: '2030-01-01T00:00:00.000Z' });
      const reset = Date.parse('2030-01-01T00:00:00.000Z');
      expect(note.isCapReached(reset - 1)).toBe(true);
      expect(note.isCapReached(reset)).toBe(false);
    });

    it('survives a new Voice Note', () => {
      const { note } = setup();
      note.setCap({ cap: 5, resetsAt: '2999-01-01T00:00:00.000Z' });
      note.read(recording, 'en', 'shopping');
      note.dismiss();
      expect(note.isCapReached()).toBe(true);
    });
  });

  describe('wake lock', () => {
    it('is requested once and released once', () => {
      const { note, release, keepScreenAwake } = setup();
      note.stayAwake();
      note.stayAwake();
      note.releaseAwake();
      note.releaseAwake();
      expect(keepScreenAwake).toHaveBeenCalledOnce();
      expect(release).toHaveBeenCalledOnce();
    });
  });

  describe('read in flight', () => {
    it('aborts the read', () => {
      const { note } = setup();
      const request = new AbortController();
      note.beginRead(request);
      expect(note.isReading()).toBe(true);
      note.abortRead();
      expect(request.signal.aborted).toBe(true);
      expect(note.isReading()).toBe(false);
    });

    it('does not forget a newer read when an older one ends', () => {
      const { note } = setup();
      const older = new AbortController();
      const newer = new AbortController();
      note.beginRead(older);
      note.beginRead(newer);
      note.endRead(older);
      expect(note.isReading()).toBe(true);
    });
  });
});
