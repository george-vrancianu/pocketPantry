import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api';
import { createVoiceNote, type VoiceNote, type VoiceNotice } from './voiceNote';
import { MicrophoneError, type MicrophoneSession } from './microphone';
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

/** A live fake microphone session that stops with `audio`. */
const fakeSession = (audio = recording) => ({
  stop: vi.fn(() => Promise.resolve(audio)),
  cancel: vi.fn(),
  level: vi.fn(() => 0),
});

/** Lets every promise already on its way settle. */
const settle = async () => {
  for (let i = 0; i < 10; i++) await Promise.resolve();
};

/** Records with the fake microphone and lets go: the note is sent to be read. */
async function record(
  note: VoiceNote,
  startOptions: {
    scanLanguage: 'en' | 'ro';
    locale: 'en' | 'ro';
    page: 'shopping' | 'pantry';
  } = options,
) {
  await note.start(startOptions);
  await note.stop();
}

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
  // The microphone hands out a session per start; a test can hold a start back with `micOpens`.
  const sessions: Array<ReturnType<typeof fakeSession>> = [];
  const startMicrophone = vi.fn((): Promise<MicrophoneSession> => {
    const live = fakeSession();
    sessions.push(live);
    return Promise.resolve(live);
  });
  const note = createVoiceNote({
    send,
    keepScreenAwake,
    startMicrophone,
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
    startMicrophone,
    sessions,
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
  await record(ctx.note, options);
  ctx.answer(result(...ids));
  await settle();
  return ctx;
}

/** Reads one recording and fails it with `error`. */
async function failedWith(error: unknown) {
  const ctx = setup();
  await record(ctx.note, options);
  ctx.refuse(error);
  await settle();
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
      await record(note, options);
      note.applying();
      expect(note.getState().phase).toBe('reading');
      answer(result('a'));
      await settle();
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

  describe('sending', () => {
    it('sends the recording with its language, locale, page and local date', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 19, 12));
      try {
        const { note, requests, answer } = setup();
        await record(note, {
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
        await settle();
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
      await record(note, options);
      await record(note, options);
      expect(send).toHaveBeenCalledOnce();
    });

    it('does not read while a failure waits', async () => {
      const { note, send } = await failedWith(new ApiError('network_error', 0));
      await record(note, options);
      expect(send).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('failed');
    });
  });

  describe('failures', () => {
    it('hears nothing from an empty transcript', async () => {
      const ctx = setup();
      await record(ctx.note, options);
      ctx.answer({ transcript: '  ', actions: [] } as never);
      await settle();
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

    it('does not fail a read in flight', async () => {
      const { note } = setup();
      await record(note, options);
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
      await record(note, options);
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
      await record(ctx.note, {
        scanLanguage: 'ro',
        locale: 'en',
        page: 'pantry',
      });
      ctx.refuse(new ApiError('network_error', 0));
      await settle();

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
      await record(ctx.note, options);
      ctx.refuse(new ApiError('network_error', 0));
      await settle();
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
    it('aborts the request, drops the note and tells the Member', async () => {
      const { note, requests, notices, released } = setup();
      await record(note, options);
      note.cancelReading();
      expect(requests[0].signal?.aborted).toBe(true);
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().recording).toBeUndefined();
      expect(notices).toEqual(['readCancelled']);
      expect(released()).toEqual([1]);
    });

    it('ignores a late answer', async () => {
      const { note, answer } = setup();
      await record(note, options);
      note.cancelReading();
      answer(result('a'));
      await settle();
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(note.getState().proposal).toBeUndefined();
    });

    it('ignores a late failure', async () => {
      const { note, refuse, notices } = setup();
      await record(note, options);
      note.cancelReading();
      refuse(new ApiError('voice.not_configured', 503));
      await settle();
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

  describe('recording', () => {
    it('goes live on a page, stamped with the time it started', async () => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 19, 12));
      try {
        const { note, startMicrophone } = setup();
        const outcome = await note.start({ ...options, page: 'pantry' });
        expect(outcome).toBe('started');
        expect(startMicrophone).toHaveBeenCalledOnce();
        expect(note.getState()).toMatchObject({
          phase: 'recording',
          page: 'pantry',
          startedAt: Date.now(),
        });
      } finally {
        vi.useRealTimers();
      }
    });

    it('sends what it recorded when the Member lets go', async () => {
      const { note, requests } = setup();
      await note.start({ scanLanguage: 'ro', locale: 'ro', page: 'pantry' });
      expect(await note.stop()).toBe('sent');
      expect(note.getState()).toMatchObject({
        phase: 'reading',
        page: 'pantry',
      });
      expect(note.getState().startedAt).toBeUndefined();
      expect(requests[0]).toMatchObject({
        recording,
        scanLanguage: 'ro',
        locale: 'ro',
        defaultTarget: 'pantry',
      });
    });

    it('reads the input level through the live session, and 0 otherwise', async () => {
      const { note, sessions } = setup();
      expect(note.level()).toBe(0);
      await note.start(options);
      sessions[0].level.mockReturnValue(0.6);
      expect(note.level()).toBe(0.6);
      await note.stop();
      expect(note.level()).toBe(0);
    });

    it('drops a recording that is too short, without a read', async () => {
      const { note, send, notices, released, startMicrophone } = setup();
      startMicrophone.mockResolvedValueOnce(
        fakeSession({ ...recording, durationMs: 299 }),
      );
      await note.start(options);
      expect(await note.stop()).toBe('tooShort');
      expect(send).not.toHaveBeenCalled();
      expect(note.getState().phase).toBe('idle');
      expect(notices).toEqual([]);
      expect(released()).toEqual([1]);
    });

    it('reads a recording of exactly the minimum length', async () => {
      const { note, send, startMicrophone } = setup();
      startMicrophone.mockResolvedValueOnce(
        fakeSession({ ...recording, durationMs: 300 }),
      );
      await note.start(options);
      expect(await note.stop()).toBe('sent');
      expect(send).toHaveBeenCalledOnce();
    });

    it('has nothing to stop when nothing records', async () => {
      const { note, released } = setup();
      expect(await note.stop()).toBe('notStarted');
      expect(released()).toEqual([]);
    });

    it('fails when the audio cannot be finalised', async () => {
      const { note, startMicrophone, released } = setup();
      const broken = fakeSession();
      broken.stop.mockRejectedValue(new Error('boom'));
      startMicrophone.mockResolvedValueOnce(broken);
      await note.start(options);
      expect(await note.stop()).toBe('notStarted');
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error: 'unavailable',
      });
      expect(released()).toEqual([1]);
    });

    it('starts one microphone at a time', async () => {
      const { note, startMicrophone } = setup();
      const first = note.start(options);
      expect(await note.start(options)).toBe('refused');
      await first;
      expect(await note.start(options)).toBe('refused');
      expect(startMicrophone).toHaveBeenCalledOnce();
    });

    it('shuts the session when a failure arrives mid-recording', async () => {
      const { note, sessions, released } = setup();
      await note.start(options);
      note.fail('unavailable');
      expect(sessions[0].cancel).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('failed');
      expect(released()).toEqual([1]);
    });

    it('does not send when the note ended while the audio was finalised', async () => {
      const { note, send, startMicrophone, released } = setup();
      let finish!: (audio: typeof recording) => void;
      const slow = fakeSession();
      slow.stop.mockReturnValue(new Promise((resolve) => (finish = resolve)));
      startMicrophone.mockResolvedValueOnce(slow);
      await note.start(options);
      const stopped = note.stop();
      note.fail('unavailable');
      finish(recording);
      expect(await stopped).toBe('notStarted');
      expect(send).not.toHaveBeenCalled();
      expect(note.getState().phase).toBe('failed');
      expect(released()).toEqual([1]);
    });
  });

  describe('letting go before the microphone is live', () => {
    /** A microphone that opens only when the test says so. */
    function slowMicrophone() {
      const ctx = setup();
      const live = fakeSession();
      let open!: () => void;
      ctx.startMicrophone.mockReturnValueOnce(
        new Promise((resolve) => (open = () => resolve(live))),
      );
      return { ...ctx, live, open };
    }

    it('cancels the stream when it arrives and never records', async () => {
      const { note, send, live, open, released } = slowMicrophone();
      const started = note.start(options);
      expect(await note.stop()).toBe('notStarted');
      expect(live.cancel).not.toHaveBeenCalled();
      open();
      expect(await started).toBe('cancelled');
      expect(live.cancel).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('idle');
      expect(send).not.toHaveBeenCalled();
      expect(released()).toEqual([1]);
    });

    it('cancels the stream when it arrives after a cancel, and says so', async () => {
      const { note, live, open, notices, released } = slowMicrophone();
      const started = note.start(options);
      note.cancel();
      open();
      expect(await started).toBe('cancelled');
      expect(live.cancel).toHaveBeenCalledOnce();
      expect(notices).toEqual(['recordingCancelled']);
      expect(released()).toEqual([1]);
    });

    it('lets the screen sleep at once, not when the stream arrives', async () => {
      const { note, released } = slowMicrophone();
      void note.start(options);
      expect(released()).toEqual([0]);
      await note.stop();
      expect(released()).toEqual([1]);
    });

    it('does not let a new note start until the old stream is dealt with', async () => {
      const { note, live, open, startMicrophone } = slowMicrophone();
      const started = note.start(options);
      await note.stop();
      expect(await note.start(options)).toBe('refused');
      open();
      await started;
      expect(live.cancel).toHaveBeenCalledOnce();
      expect(startMicrophone).toHaveBeenCalledOnce();
    });

    it('reports a refused microphone even if the Member already let go', async () => {
      const { note, startMicrophone, released } = setup();
      let refuse!: (error: unknown) => void;
      startMicrophone.mockReturnValueOnce(
        new Promise((_, reject) => (refuse = reject)),
      );
      const started = note.start(options);
      await note.stop();
      refuse(new MicrophoneError('denied'));
      expect(await started).toBe('denied');
      expect(note.getState().phase).toBe('idle');
      expect(released()).toEqual([1]);
    });
  });

  describe('microphone refusals', () => {
    it('leaves the note idle when the microphone is denied, for the permission sheets', async () => {
      const { note, startMicrophone, released } = setup();
      startMicrophone.mockRejectedValueOnce(new MicrophoneError('denied'));
      expect(await note.start(options)).toBe('denied');
      expect(note.getState().phase).toBe('idle');
      expect(released()).toEqual([1]);
    });

    it.each([
      ['no microphone', new MicrophoneError('unavailable')],
      ['an unknown error', new Error('boom')],
    ])('fails the note on %s', async (_, error) => {
      const { note, startMicrophone, released } = setup();
      startMicrophone.mockRejectedValueOnce(error);
      expect(await note.start(options)).toBe('unavailable');
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error: 'unavailable',
      });
      expect(released()).toEqual([1]);
    });
  });

  describe('start blocker', () => {
    it('is none when idle, and for a failure with no kept recording', async () => {
      const { note } = setup();
      expect(note.startBlocker()).toBe('none');
      const failed = await failedWith(new ApiError('voice.too_long', 413));
      expect(failed.note.startBlocker()).toBe('none');
    });

    it('is active while the microphone is starting', async () => {
      const ctx = setup();
      let open!: () => void;
      ctx.startMicrophone.mockReturnValueOnce(
        new Promise((resolve) => (open = () => resolve(fakeSession()))),
      );
      const started = ctx.note.start(options);
      expect(ctx.note.startBlocker()).toBe('active');
      expect(await ctx.note.start(options)).toBe('refused');
      expect(ctx.startMicrophone).toHaveBeenCalledOnce();
      open();
      expect(await started).toBe('started');
    });

    it('is active while recording', async () => {
      const { note, startMicrophone } = setup();
      await note.start(options);
      expect(note.startBlocker()).toBe('active');
      expect(await note.start(options)).toBe('refused');
      expect(startMicrophone).toHaveBeenCalledOnce();
    });

    it('is active while the audio is being finalised', async () => {
      const ctx = setup();
      let finish!: () => void;
      const live = fakeSession();
      live.stop.mockReturnValueOnce(
        new Promise((resolve) => (finish = () => resolve(recording))),
      );
      ctx.startMicrophone.mockReturnValueOnce(Promise.resolve(live));
      await ctx.note.start(options);
      const stopped = ctx.note.stop();
      expect(ctx.note.startBlocker()).toBe('active');
      expect(await ctx.note.start(options)).toBe('refused');
      finish();
      expect(await stopped).toBe('sent');
      expect(ctx.note.startBlocker()).toBe('busy');
    });

    it('is busy while a note is being read, and a start is refused', async () => {
      const { note, startMicrophone } = setup();
      await record(note);
      expect(note.startBlocker()).toBe('busy');
      expect(await note.start(options)).toBe('refused');
      expect(startMicrophone).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('reading');
    });

    it('is kept while a failed note waits for Retry, and a start is refused', async () => {
      const { note, startMicrophone } = await failedWith(
        new ApiError('network_error', 0),
      );
      expect(note.startBlocker()).toBe('kept');
      expect(await note.start(options)).toBe('refused');
      expect(startMicrophone).toHaveBeenCalledOnce();
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error: 'failed',
      });
    });

    it('is capped after the Voice Cap, and a capped start fails the note', async () => {
      const { note, startMicrophone } = await failedWith(
        new ApiError('voice.cap_reached', 429, {
          cap: 5,
          resetsAt: '2999-01-01T00:00:00.000Z',
        }),
      );
      note.dismiss();
      expect(note.startBlocker()).toBe('capped');
      expect(await note.start(options)).toBe('refused');
      expect(startMicrophone).toHaveBeenCalledOnce();
      expect(note.getState()).toMatchObject({
        phase: 'failed',
        error: 'capReached',
      });
    });

    it('does not take the wake lock for a capped start', async () => {
      const ctx = await failedWith(
        new ApiError('voice.cap_reached', 429, {
          cap: 5,
          resetsAt: '2999-01-01T00:00:00.000Z',
        }),
      );
      ctx.note.dismiss();
      await ctx.note.start(options);
      expect(ctx.keepScreenAwake).toHaveBeenCalledOnce();
      expect(ctx.released()).toEqual([1]);
    });

    it('starts after a failure with no kept recording, dropping it', async () => {
      const { note } = await failedWith(new ApiError('voice.too_long', 413));
      expect(await note.start(options)).toBe('started');
      expect(note.getState().phase).toBe('recording');
      expect(note.getState().error).toBeUndefined();
    });

    it('refuses to start over Review', async () => {
      const { note, startMicrophone } = await inReview('a');
      expect(await note.start(options)).toBe('refused');
      expect(note.getState().phase).toBe('review');
      expect(startMicrophone).toHaveBeenCalledOnce();
    });
  });

  describe('the 60-second limit', () => {
    afterEach(() => vi.useRealTimers());

    it('stops, tells the Member and sends the note', async () => {
      vi.useFakeTimers();
      const { note, notices, requests, sessions } = setup();
      await note.start(options);
      await vi.advanceTimersByTimeAsync(59_999);
      expect(note.getState().phase).toBe('recording');
      expect(notices).toEqual([]);
      await vi.advanceTimersByTimeAsync(1);
      expect(notices).toEqual(['stoppedAtLimit']);
      expect(sessions[0].stop).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('reading');
      expect(requests).toHaveLength(1);
    });

    it('is not kept running by a recording that was let go', async () => {
      vi.useFakeTimers();
      const { note, notices, send } = setup();
      await note.start(options);
      await note.stop();
      await vi.advanceTimersByTimeAsync(120_000);
      expect(notices).toEqual([]);
      expect(send).toHaveBeenCalledOnce();
    });

    it('is not kept running by a cancelled recording', async () => {
      vi.useFakeTimers();
      const { note, notices, sessions } = setup();
      await note.start(options);
      note.cancel({ quiet: true });
      await vi.advanceTimersByTimeAsync(120_000);
      expect(notices).toEqual([]);
      expect(sessions[0].stop).not.toHaveBeenCalled();
    });

    it('starts counting when the microphone is live, not when asked', async () => {
      vi.useFakeTimers();
      const { note, startMicrophone, notices } = setup();
      let open!: () => void;
      startMicrophone.mockReturnValueOnce(
        new Promise((resolve) => (open = () => resolve(fakeSession()))),
      );
      const started = note.start(options);
      await vi.advanceTimersByTimeAsync(50_000);
      open();
      await started;
      await vi.advanceTimersByTimeAsync(59_000);
      expect(notices).toEqual([]);
      await vi.advanceTimersByTimeAsync(1_000);
      expect(notices).toEqual(['stoppedAtLimit']);
    });
  });

  describe('cancel', () => {
    it('throws the recording away and says so', async () => {
      const { note, sessions, send, notices, released } = setup();
      await note.start(options);
      note.cancel();
      expect(sessions[0].cancel).toHaveBeenCalledOnce();
      expect(note.getState()).toMatchObject({ phase: 'idle' });
      expect(send).not.toHaveBeenCalled();
      expect(notices).toEqual(['recordingCancelled']);
      expect(released()).toEqual([1]);
    });

    it('says nothing when quiet (the page was left)', async () => {
      const { note, sessions, notices, released } = setup();
      await note.start(options);
      note.cancel({ quiet: true });
      expect(sessions[0].cancel).toHaveBeenCalledOnce();
      expect(note.getState().phase).toBe('idle');
      expect(notices).toEqual([]);
      expect(released()).toEqual([1]);
    });

    it.each([[false], [true]])(
      'leaves a read in flight and its wake lock alone (quiet: %s)',
      async (quiet) => {
        const { note, requests, notices, released } = setup();
        await record(note);
        note.cancel({ quiet });
        expect(note.getState().phase).toBe('reading');
        expect(requests[0].signal?.aborted).toBe(false);
        expect(notices).toEqual([]);
        expect(released()).toEqual([0]);
      },
    );

    it('does nothing, and says nothing, with nothing recording', () => {
      const { note, notices, released } = setup();
      note.cancel();
      expect(notices).toEqual([]);
      expect(released()).toEqual([]);
    });

    it('cancels once however often it is called', async () => {
      const { note, sessions, notices, released } = setup();
      await note.start(options);
      note.cancel();
      note.cancel();
      expect(sessions[0].cancel).toHaveBeenCalledOnce();
      expect(notices).toEqual(['recordingCancelled']);
      expect(released()).toEqual([1]);
    });
  });

  describe('wake lock', () => {
    it('is taken at start and kept while recording', async () => {
      const { note, keepScreenAwake, released } = setup();
      await note.start(options);
      expect(keepScreenAwake).toHaveBeenCalledOnce();
      expect(released()).toEqual([0]);
    });

    it('is taken as the microphone is asked for, before it is live', async () => {
      const { note, keepScreenAwake, startMicrophone } = setup();
      startMicrophone.mockReturnValueOnce(new Promise(() => {}));
      void note.start(options);
      expect(keepScreenAwake).toHaveBeenCalledOnce();
    });

    it('is the same lock from start through the read, released once when the read settles', async () => {
      const { note, answer, keepScreenAwake, released } = setup();
      await record(note);
      expect(keepScreenAwake).toHaveBeenCalledOnce();
      expect(released()).toEqual([0]);
      answer(result('a'));
      await settle();
      expect(note.getState().phase).toBe('review');
      expect(released()).toEqual([1]);
    });

    it.each([
      ['fails', new ApiError('network_error', 0)],
      ['is refused', new ApiError('voice.too_long', 413)],
    ])('is released once when the read %s', async (_, error) => {
      const { note, refuse, released } = setup();
      await record(note);
      refuse(error);
      await settle();
      expect(released()).toEqual([1]);
    });

    it('is released once when nothing was heard', async () => {
      const { note, answer, released } = setup();
      await record(note);
      answer({ transcript: '', actions: [] } as never);
      await settle();
      expect(released()).toEqual([1]);
    });

    it('is released when Voice Notes are switched off', async () => {
      const { released } = await failedWith(
        new ApiError('voice.not_configured', 503),
      );
      expect(released()).toEqual([1]);
    });

    it('is released once when the Member cancels while recording', async () => {
      const { note, released } = setup();
      await note.start(options);
      note.cancel();
      note.cancel({ quiet: true });
      expect(released()).toEqual([1]);
    });

    it('takes the lock again for a Retry and releases it once', async () => {
      const ctx = await failedWith(new ApiError('network_error', 0));
      expect(ctx.released()).toEqual([1]);
      void ctx.note.retry('en');
      expect(ctx.released()).toEqual([1, 0]);
      ctx.answer(result('a'));
      await settle();
      expect(ctx.released()).toEqual([1, 1]);
    });

    it('keeps the screen awake across a page switch while reading', async () => {
      const { note, answer, released } = setup();
      await note.start(options);
      await note.stop();
      // The page that started the note unmounts.
      note.cancel({ quiet: true });
      expect(released()).toEqual([0]);
      answer(result('a'));
      await settle();
      expect(released()).toEqual([1]);
    });

    it('leaks nothing when a transition is a no-op because of a phase guard', async () => {
      const ctx = await inReview('a');
      // A start over Review, a stop and a cancel with nothing recording: none may take or keep a lock.
      await ctx.note.start(options);
      await ctx.note.stop();
      ctx.note.cancel();
      expect(ctx.keepScreenAwake).toHaveBeenCalledOnce();
      expect(ctx.released()).toEqual([1]);

      // A start while a failure waits for Retry is refused before it takes a lock.
      const kept = await failedWith(new ApiError('network_error', 0));
      await kept.note.start(options);
      expect(kept.keepScreenAwake).toHaveBeenCalledOnce();
      expect(kept.released()).toEqual([1]);

      // A start while one is already starting takes no second lock.
      const busy = setup();
      busy.startMicrophone.mockReturnValueOnce(new Promise(() => {}));
      void busy.note.start(options);
      await busy.note.start(options);
      expect(busy.keepScreenAwake).toHaveBeenCalledOnce();
    });

    it('is released when something fails the note while the microphone is starting', async () => {
      const ctx = setup();
      let open!: () => void;
      ctx.startMicrophone.mockReturnValueOnce(
        new Promise((resolve) => (open = () => resolve(fakeSession()))),
      );
      const started = ctx.note.start(options);
      ctx.note.fail('unavailable');
      expect(ctx.released()).toEqual([1]);
      open();
      expect(await started).toBe('cancelled');
      expect(ctx.released()).toEqual([1]);
      expect(ctx.note.getState().phase).toBe('failed');
    });

    it('lets a cancelled read release nothing of a newer note', async () => {
      const ctx = setup();
      await record(ctx.note);
      ctx.note.cancelReading();
      expect(ctx.released()).toEqual([1]);

      // A new note takes its own lock before the old answer arrives.
      await ctx.note.start(options);
      expect(ctx.keepScreenAwake).toHaveBeenCalledTimes(2);
      ctx.refuse(new ApiError('network_error', 0), 0);
      await settle();

      expect(ctx.released()).toEqual([1, 0]);
      expect(ctx.note.getState().phase).toBe('recording');
    });

    it('lets a cancelled read that answers late release nothing of a newer read', async () => {
      const ctx = setup();
      await record(ctx.note);
      ctx.note.cancelReading();
      await record(ctx.note);
      ctx.answer(result('a'), 0);
      await settle();
      expect(ctx.released()).toEqual([1, 0]);
      expect(ctx.note.getState().phase).toBe('reading');
      ctx.answer(result('b'), 1);
      await settle();
      expect(ctx.released()).toEqual([1, 1]);
      expect(ids(ctx.note)).toEqual(['b']);
    });
  });

  describe('notifier', () => {
    it('can be attached after the module is made, and detached', async () => {
      const note = createVoiceNote({
        send: () => new Promise(() => {}),
        keepScreenAwake: () => () => {},
        startMicrophone: () => Promise.resolve(fakeSession()),
      });
      const heard: VoiceNotice[] = [];
      const detach = note.attachNotifier((notice) => heard.push(notice));
      await record(note, options);
      note.cancelReading();
      detach();
      await record(note, options);
      note.cancelReading();
      expect(heard).toEqual(['readCancelled']);
    });
  });
});
