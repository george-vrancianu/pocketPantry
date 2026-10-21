import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './api';
import { createVoiceNote, type VoiceNotice } from './voiceNote';
import type { VoiceNoteRequest, VoiceNoteResult } from './voice';

const action = (id: string) =>
  ({ id, kind: 'add', quantity: 1, name: id }) as never;

const result = (...ids: string[]): VoiceNoteResult =>
  ({ transcript: 'milk and eggs', actions: ids.map(action) }) as never;

const recording = {
  blob: new Blob(['x']),
  mimeType: 'audio/webm',
  durationMs: 2000,
};

const options = {
  scanLanguage: 'en',
  locale: 'en',
  page: 'shopping',
} as const;

/** A fake sender whose answers the test settles by hand. */
function setup() {
  const requests: VoiceNoteRequest[] = [];
  const pending: Array<{
    resolve: (value: VoiceNoteResult) => void;
    reject: (error: unknown) => void;
  }> = [];
  const send = vi.fn((request: VoiceNoteRequest) => {
    requests.push(request);
    return new Promise<VoiceNoteResult>((resolve, reject) => {
      pending.push({ resolve, reject });
    });
  });
  // One release per lock taken, so the tests can tell whose lock was let go.
  const releases: Array<ReturnType<typeof vi.fn>> = [];
  const keepScreenAwake = vi.fn(() => {
    const release = vi.fn();
    releases.push(release);
    return release;
  });
  const notices: VoiceNotice[] = [];
  const note = createVoiceNote({
    send,
    keepScreenAwake,
    notify: (notice) => notices.push(notice),
  });
  const answer = (value: VoiceNoteResult, at = pending.length - 1) =>
    pending[at].resolve(value);
  const refuse = (error: unknown, at = pending.length - 1) =>
    pending[at].reject(error);
  /** Releases made so far, in the order the locks were taken. */
  const released = () => releases.map((r) => r.mock.calls.length);
  return {
    note,
    send,
    requests,
    notices,
    keepScreenAwake,
    releases,
    released,
    answer,
    refuse,
  };
}

async function inReview(...ids: string[]) {
  const ctx = setup();
  const read = ctx.note.read(recording, options);
  ctx.answer(result(...ids));
  await read;
  return ctx;
}

/** Reads one recording and fails it with `error`. */
async function failedWith(error: unknown) {
  const ctx = setup();
  const read = ctx.note.read(recording, options);
  ctx.refuse(error);
  await read;
  return ctx;
}

const ids = (note: ReturnType<typeof createVoiceNote>) =>
  note.getState().proposal?.actions.map((a) => a.id);

describe('Voice Note module', () => {
  describe('Review edits', () => {
    it('removes a Voice Action', async () => {
      const { note } = await inReview('a', 'b');
      note.remove('a');
      expect(ids(note)).toEqual(['b']);
    });

    it('edits one Voice Action and leaves the others', async () => {
      const { note } = await inReview('a', 'b');
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

    it('notifies subscribers of an edit', async () => {
      const { note } = await inReview('a');
      const listener = vi.fn();
      note.subscribe(listener);
      note.remove('a');
      expect(listener).toHaveBeenCalledOnce();
    });
  });

  describe('Apply', () => {
    it('applies only from Review', async () => {
      const { note, answer } = setup();
      note.applying();
      expect(note.getState().phase).toBe('idle');
      const read = note.read(recording, options);
      note.applying();
      expect(note.getState().phase).toBe('reading');
      answer(result('a'));
      await read;
      note.applying();
      expect(note.getState().phase).toBe('applying');
    });

    it('goes back to Review with the edits kept when Apply fails', async () => {
      const { note } = await inReview('a', 'b');
      note.remove('a');
      note.edit('b', { quantity: 9 });
      note.applying();
      note.applyFailed();
      expect(note.getState().phase).toBe('review');
      expect(ids(note)).toEqual(['b']);
      expect(note.getState().proposal!.actions[0].quantity).toBe(9);
    });

    it('ignores apply failed outside applying', async () => {
      const { note } = await inReview('a');
      note.applyFailed();
      expect(note.getState().phase).toBe('review');
    });

    it('ignores edits while applying', async () => {
      const { note } = await inReview('a');
      note.applying();
      note.remove('a');
      expect(ids(note)).toEqual(['a']);
    });

    it('ignores discard while applying', async () => {
      const { note } = await inReview('a');
      note.applying();
      note.discard();
      expect(note.getState().phase).toBe('applying');
    });

    it('discards from Review', async () => {
      const { note } = await inReview('a');
      note.discard();
      expect(note.getState().phase).toBe('idle');
      expect(note.getState().proposal).toBeUndefined();
    });

    it('returns to idle once applied', async () => {
      const { note } = await inReview('a');
      note.applying();
      note.applied();
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().proposal).toBeUndefined();
    });

    it('ignores applied outside applying', async () => {
      const { note } = await inReview('a');
      note.applied();
      expect(note.getState().phase).toBe('review');
    });
  });

  describe('read', () => {
    it('sends the recording with its language, locale, page and local date', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 19, 12));
      try {
        const { note, requests, answer } = setup();
        const read = note.read(recording, {
          scanLanguage: 'ro',
          locale: 'ro',
          page: 'pantry',
        });
        expect(note.getState()).toMatchObject({
          phase: 'reading',
          page: 'pantry',
        });
        expect(requests[0]).toMatchObject({
          recording,
          scanLanguage: 'ro',
          locale: 'ro',
          defaultTarget: 'pantry',
          today: '2026-10-19',
        });
        answer(result('a'));
        await read;
        expect(note.getState()).toMatchObject({
          phase: 'review',
          page: 'pantry',
          proposal: { transcript: 'milk and eggs' },
          recording: { scanLanguage: 'ro', durationMs: 2000 },
        });
      } finally {
        vi.useRealTimers();
      }
    });

    it('reads one note at a time', async () => {
      const { note, send } = setup();
      void note.read(recording, options);
      void note.read(recording, options);
      expect(send).toHaveBeenCalledOnce();
    });

    it('does not read while a failure waits', async () => {
      const { note, send } = await failedWith(new ApiError('network_error', 0));
      void note.read(recording, options);
      expect(send).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('failed');
    });
  });

  describe('failures', () => {
    it('hears nothing from an empty transcript', async () => {
      const ctx = setup();
      const read = ctx.note.read(recording, options);
      ctx.answer({ transcript: '  ', actions: [] } as never);
      await read;
      expect(ctx.note.getState()).toMatchObject({
        phase: 'failed',
        error: 'nothingHeard',
        recording: undefined,
      });
      expect(ctx.released()).toEqual([1]);
    });

    it.each([
      ['voice.nothing_heard', 'nothingHeard'],
      ['voice.too_long', 'tooLong'],
      ['voice.unsupported_audio', 'unsupported'],
    ] as const)('maps %s to %s and keeps no recording', async (code, error) => {
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { note, released } = await failedWith(new ApiError(code, 422));
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error,
        recording: undefined,
        rawError: undefined,
      });
      expect(released()).toEqual([1]);
    });

    it.each(['network_error', 'voice.provider_unavailable'])(
      'keeps the recording for Retry when %s, with no raw error',
      async (code) => {
        const { note } = await failedWith(new ApiError(code, 503));
        const state = note.getState();
        expect(state).toMatchObject({ phase: 'failed', error: 'failed' });
        expect(state.rawError).toBeUndefined();
        expect(state.recording).toMatchObject({ durationMs: 2000 });
      },
    );

    it('keeps the raw code and parameters of any other API error', async () => {
      const { note } = await failedWith(
        new ApiError('voice.audio_unreadable', 422, { limit: 3 }),
      );
      expect(note.getState()).toMatchObject({
        error: 'failed',
        rawError: { code: 'voice.audio_unreadable', params: { limit: 3 } },
        recording: { durationMs: 2000 },
      });
    });

    it('keeps an unknown code for an error that is not an API error', async () => {
      const { note } = await failedWith(new TypeError('boom'));
      expect(note.getState()).toMatchObject({
        error: 'failed',
        rawError: { code: 'unknown', params: {} },
      });
    });

    it('ignores a failure from the wrong phase', async () => {
      const { note } = await inReview('a');
      note.fail('unavailable');
      expect(note.getState().phase).toBe('review');
    });

    it('does not fail a read in flight', () => {
      const { note } = setup();
      void note.read(recording, options);
      note.fail('unavailable');
      expect(note.getState().phase).toBe('reading');
    });

    it('fails before a read, for a browser that cannot record', () => {
      const { note, notices } = setup();
      note.fail('unavailable');
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error: 'unavailable',
      });
      expect(notices).toEqual([]);
    });

    it('drops the note quietly when Voice Notes are switched off', async () => {
      const { note, notices, released } = await failedWith(
        new ApiError('voice.not_configured', 503),
      );
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().recording).toBeUndefined();
      expect(notices).toEqual(['switchedOff']);
      expect(released()).toEqual([1]);
    });
  });

  describe('Dismiss and Discard', () => {
    it('dismisses a failure without a notice', async () => {
      const { note, notices } = await failedWith(
        new ApiError('network_error', 0),
      );
      note.dismiss();
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().recording).toBeUndefined();
      expect(notices).toEqual([]);
    });

    it('discards a failure with a notice', async () => {
      const { note, notices } = await failedWith(
        new ApiError('network_error', 0),
      );
      note.discardFailed();
      expect(note.getState().phase).toBe('idle');
      expect(notices).toEqual(['discarded']);
    });

    it('ignores both outside a failure', async () => {
      const { note, notices } = await inReview('a');
      note.dismiss();
      note.discardFailed();
      expect(note.getState().phase).toBe('review');
      expect(notices).toEqual([]);
    });
  });

  describe('Voice Cap', () => {
    const capped = (resetsAt?: unknown) =>
      failedWith(new ApiError('voice.cap_reached', 429, { cap: 5, resetsAt }));

    it('is in force until the reset time the server gave', async () => {
      const { note } = await capped('2999-01-01T00:00:00.000Z');
      const reset = Date.parse('2999-01-01T00:00:00.000Z');
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error: 'capReached',
        voiceCap: { cap: 5, resetsAt: reset },
      });
      expect(note.isCapReached(reset - 1)).toBe(true);
      expect(note.isCapReached(reset)).toBe(false);
    });

    it.each([
      ['missing', undefined],
      ['unreadable', 'tomorrow-ish'],
      ['not a string', 12345],
    ])(
      'lifts at the next UTC midnight when the reset time is %s',
      async (_, resetsAt) => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(Date.UTC(2026, 9, 19, 23, 30));
        try {
          const { note } = await capped(resetsAt);
          const midnight = Date.UTC(2026, 9, 20);
          expect(note.getState().voiceCap?.resetsAt).toBe(midnight);
          expect(note.isCapReached(midnight - 1)).toBe(true);
          expect(note.isCapReached(midnight)).toBe(false);
        } finally {
          vi.useRealTimers();
        }
      },
    );

    it('keeps the cap through a new Voice Note', async () => {
      const { note } = await capped('2999-01-01T00:00:00.000Z');
      note.dismiss();
      void note.read(recording, options);
      expect(note.isCapReached()).toBe(true);
    });

    it('lifts by itself: subscribers hear it and see a new state', async () => {
      vi.useFakeTimers();
      try {
        vi.setSystemTime(Date.UTC(2026, 9, 19, 10));
        const { note } = await capped(
          new Date(Date.UTC(2026, 9, 19, 11)).toISOString(),
        );
        note.dismiss();
        const before = note.getState();
        const listener = vi.fn();
        note.subscribe(listener);
        expect(note.isCapReached()).toBe(true);

        vi.advanceTimersByTime(60 * 60 * 1000 - 1);
        expect(listener).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);

        expect(listener).toHaveBeenCalledOnce();
        expect(note.getState()).not.toBe(before);
        expect(note.isCapReached()).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });

    it('ignores a reset time already past', async () => {
      vi.useFakeTimers();
      try {
        vi.setSystemTime(Date.UTC(2026, 9, 19, 10));
        const { note } = await capped('2026-10-19T09:00:00.000Z');
        const listener = vi.fn();
        note.subscribe(listener);
        vi.runAllTimers();
        expect(listener).not.toHaveBeenCalled();
        expect(note.isCapReached()).toBe(false);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('Retry', () => {
    it('resends the kept recording in its language and for its page', async () => {
      const ctx = setup();
      const first = ctx.note.read(recording, {
        scanLanguage: 'ro',
        locale: 'en',
        page: 'pantry',
      });
      ctx.refuse(new ApiError('network_error', 0));
      await first;

      const second = ctx.note.retry('ro');
      expect(ctx.note.getState().phase).toBe('reading');
      expect(ctx.requests[1]).toMatchObject({
        recording,
        scanLanguage: 'ro',
        locale: 'ro',
        defaultTarget: 'pantry',
      });
      ctx.answer(result('a'));
      await second;
      expect(ctx.note.getState()).toMatchObject({
        phase: 'review',
        page: 'pantry',
      });
    });

    it('takes the screen lock again and releases it once', async () => {
      const ctx = setup();
      const first = ctx.note.read(recording, options);
      ctx.refuse(new ApiError('network_error', 0));
      await first;
      expect(ctx.released()).toEqual([1]);

      const second = ctx.note.retry('en');
      expect(ctx.released()).toEqual([1, 0]);
      ctx.answer(result('a'));
      await second;
      expect(ctx.released()).toEqual([1, 1]);
    });

    it('does nothing without a kept recording', async () => {
      const ctx = await failedWith(new ApiError('voice.too_long', 413));
      void ctx.note.retry('en');
      expect(ctx.send).toHaveBeenCalledOnce();
      expect(ctx.note.getState().phase).toBe('failed');
    });
  });

  describe('Cancel reading', () => {
    it('aborts the request, drops the note and tells the Member', () => {
      const { note, requests, notices, released } = setup();
      void note.read(recording, options);
      note.cancelReading();
      expect(requests[0].signal?.aborted).toBe(true);
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().recording).toBeUndefined();
      expect(notices).toEqual(['readCancelled']);
      expect(released()).toEqual([1]);
    });

    it('ignores a late answer', async () => {
      const { note, answer } = setup();
      const read = note.read(recording, options);
      note.cancelReading();
      answer(result('a'));
      await read;
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().proposal).toBeUndefined();
    });

    it('ignores a late failure', async () => {
      const { note, refuse, notices } = setup();
      const read = note.read(recording, options);
      note.cancelReading();
      refuse(new ApiError('voice.not_configured', 503));
      await read;
      expect(note.getState().phase).toBe('idle');
      expect(notices).toEqual(['readCancelled']);
    });

    it('does nothing outside a read', async () => {
      const { note, notices } = await inReview('a');
      note.cancelReading();
      expect(note.getState().phase).toBe('review');
      expect(notices).toEqual([]);
    });

    it('leaves a read that settled alone', async () => {
      const { note, notices } = await failedWith(
        new ApiError('network_error', 0),
      );
      note.cancelReading();
      expect(note.getState().phase).toBe('failed');
      expect(notices).toEqual([]);
    });
  });

  describe('recording phases', () => {
    it('starts only from idle and cancels only a recording', async () => {
      const { note } = await inReview('a');
      note.startRecording('pantry');
      expect(note.getState().phase).toBe('review');
      note.cancelRecording();
      expect(note.getState().phase).toBe('review');
    });

    it('records on a page and cancels back to idle', () => {
      const { note } = setup();
      note.startRecording('pantry');
      expect(note.getState()).toMatchObject({
        phase: 'recording',
        page: 'pantry',
      });
      note.startRecording('shopping');
      expect(note.getState().page).toBe('pantry');
      note.cancelRecording();
      expect(note.getState().phase).toBe('idle');
    });
  });

  describe('wake lock', () => {
    it('is taken once for a press and a read, and released once when the read settles', async () => {
      const { note, answer, keepScreenAwake, released } = setup();
      note.pressStarted();
      const read = note.read(recording, options);
      expect(keepScreenAwake).toHaveBeenCalledOnce();
      expect(released()).toEqual([0]);
      answer(result('a'));
      await read;
      expect(released()).toEqual([1]);
    });

    it.each([
      ['fails', new ApiError('network_error', 0)],
      ['is refused', new ApiError('voice.too_long', 413)],
    ])('is released once when the read %s', async (_, error) => {
      const { note, refuse, released } = setup();
      note.pressStarted();
      const read = note.read(recording, options);
      refuse(error);
      await read;
      expect(released()).toEqual([1]);
    });

    it('is released when a press ends without a note', () => {
      const { note, released } = setup();
      note.pressStarted();
      note.pressEnded();
      note.pressEnded();
      expect(released()).toEqual([1]);
    });

    it('is released when the microphone fails', () => {
      const { note, released } = setup();
      note.pressStarted();
      note.fail('unavailable');
      expect(released()).toEqual([1]);
    });

    it('keeps the screen awake across a page switch while reading', async () => {
      const { note, answer, released } = setup();
      note.pressStarted();
      const read = note.read(recording, options);
      // The page that started the note unmounts.
      note.pressEnded();
      expect(released()).toEqual([0]);
      answer(result('a'));
      await read;
      expect(released()).toEqual([1]);
    });

    it('lets a cancelled read release nothing of a newer press', async () => {
      const ctx = setup();
      ctx.note.pressStarted();
      const old = ctx.note.read(recording, options);
      ctx.note.cancelReading();
      expect(ctx.released()).toEqual([1]);

      // A new press takes its own lock before the old answer arrives.
      ctx.note.pressStarted();
      expect(ctx.keepScreenAwake).toHaveBeenCalledTimes(2);
      ctx.refuse(new ApiError('network_error', 0), 0);
      await old;

      expect(ctx.released()).toEqual([1, 0]);
      expect(ctx.note.getState().phase).toBe('idle');
    });

    it('lets a cancelled read that answers late release nothing of a newer read', async () => {
      const ctx = setup();
      const old = ctx.note.read(recording, options);
      ctx.note.cancelReading();
      const newer = ctx.note.read(recording, options);
      ctx.answer(result('a'), 0);
      await old;
      expect(ctx.released()).toEqual([1, 0]);
      expect(ctx.note.getState().phase).toBe('reading');
      ctx.answer(result('b'), 1);
      await newer;
      expect(ctx.released()).toEqual([1, 1]);
      expect(ids(ctx.note)).toEqual(['b']);
    });
  });

  describe('notifier', () => {
    it('can be attached after the module is made, and detached', () => {
      const note = createVoiceNote({
        send: () => new Promise(() => {}),
        keepScreenAwake: () => () => {},
      });
      const heard: VoiceNotice[] = [];
      const detach = note.attachNotifier((notice) => heard.push(notice));
      void note.read(recording, options);
      note.cancelReading();
      detach();
      void note.read(recording, options);
      note.cancelReading();
      expect(heard).toEqual(['readCancelled']);
    });
  });
});
