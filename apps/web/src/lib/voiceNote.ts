import { useSyncExternalStore } from 'react';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { Locale, ScanLanguage } from '../i18n/resources';
import { ApiError } from './api';
import type { Recording } from './microphone';
import { localIso } from './pantry';
import { keepScreenAwake } from './wakeLock';
import {
  sendVoiceNote,
  type VoiceList,
  type VoiceNoteRequest,
  type VoiceNoteResult,
  type VoiceReviewAction,
} from './voice';

/** Where the Voice Note is: the hold-to-talk button, the status pill and Review all read this. */
export type VoicePhase =
  | 'idle'
  | 'recording'
  | 'reading'
  | 'failed'
  | 'review'
  /** Review while Apply is in flight; an error sends it back to `review` with the edits kept. */
  | 'applying';

/** Why the last Voice Note did not reach Review. */
export type VoiceErrorCode =
  | 'unavailable'
  | 'nothingHeard'
  /** The send failed (no signal, provider down): the recording is kept for Retry. */
  | 'failed'
  | 'tooLong'
  | 'unsupported'
  /** The Voice Cap is used up; the number is in `voiceCap`. */
  | 'capReached';

export type VoiceNoteState = {
  phase: VoicePhase;
  /** The page that recorded: the default target of the Voice Note. */
  page: VoiceList;
  /** The audio, kept in memory while it is read and for Retry after a failed send. */
  recording?: {
    blob: Blob;
    mimeType: string;
    durationMs: number;
    scanLanguage: ScanLanguage;
  };
  /** What the server read from the recording, then as the Member edits it. */
  proposal?: { transcript: string; actions: VoiceReviewAction[] };
  error?: VoiceErrorCode;
  /**
   * The server's error behind a `failed` that the pill has no wording of its own for: the raw code
   * and parameters, translated by the status pill. Absent for a send that never reached the server.
   */
  rawError?: { code: string; params: Record<string, unknown> };
  /** The Voice Cap, once the server reported it reached. In memory only; a reload drops it. */
  voiceCap?: { cap: number; resetsAt: number };
};

/** A notice for the Member that the module has no toast of its own for. */
export type VoiceNotice =
  /** Cancel reading: the late answer is ignored. */
  | 'readCancelled'
  /** Discard on a failed Voice Note. */
  | 'discarded'
  /** The server has Voice Notes switched off: the note was dropped quietly. */
  | 'switchedOff';

/** The outside world of the Voice Note. The microphone joins as the recording moves in. */
export type VoiceNoteAdapters = {
  /** Sends a recording to be read. */
  send: (request: VoiceNoteRequest) => Promise<VoiceNoteResult>;
  /** Keeps the screen awake; returns the function that lets it sleep again. */
  keepScreenAwake: () => () => void;
  /** Tells the Member something. Can also be attached later with `attachNotifier`. */
  notify?: (notice: VoiceNotice) => void;
};

export type VoiceNoteEdit = Partial<{
  quantity: number | null;
  unit: Unit | null;
  ingredient: CatalogSearchResult | null;
  name: string | null;
  location: StorageLocation | null;
  expiresOn: string | null;
  noExpiry: boolean;
  batchId: string | null;
  defaults: VoiceReviewAction['defaults'];
}>;

/** The longest delay `setTimeout` takes. */
const MAX_TIMEOUT = 2 ** 31 - 1;

const initial: VoiceNoteState = { phase: 'idle', page: 'shopping' };

const nextUtcMidnight = (now: number) => {
  const day = new Date(now);
  return Date.UTC(
    day.getUTCFullYear(),
    day.getUTCMonth(),
    day.getUTCDate() + 1,
  );
};

/**
 * The one owner of the Voice Note in memory, shared by the hold-to-talk button and Review on any
 * page. Nothing here is stored: a reload drops the Voice Note. A transition from the wrong phase
 * does nothing.
 */
export function createVoiceNote(
  adapters: VoiceNoteAdapters = { send: sendVoiceNote, keepScreenAwake },
) {
  let state = initial;
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of listeners) listener();
  };

  /** Replaces the transient fields; the Voice Cap is only touched by `setCap`. */
  function go(next: Omit<VoiceNoteState, 'voiceCap'>) {
    state = { ...next, voiceCap: state.voiceCap };
    emit();
  }
  const idle = () => go({ phase: 'idle', page: state.page });

  /**
   * What outlives the page that started a Voice Note, so the pill on either page can reach it: the
   * request being read (Cancel aborts it) and the lock that keeps the screen awake until it ends.
   */
  let reading: AbortController | undefined;
  let release: (() => void) | undefined;
  let notifier = adapters.notify;
  let capTimer: ReturnType<typeof setTimeout> | undefined;

  const notify = (notice: VoiceNotice) => notifier?.(notice);
  const hold = () => {
    release ??= adapters.keepScreenAwake();
  };
  const letSleep = () => {
    release?.();
    release = undefined;
  };

  /** Renders again when the Voice Cap lifts: the state itself would not change. */
  function watchCap() {
    clearTimeout(capTimer);
    if (!state.voiceCap) return;
    const wait = state.voiceCap.resetsAt - Date.now();
    if (wait <= 0) return;
    capTimer = setTimeout(
      () => {
        // A new object, so subscribers that compare snapshots render again.
        state = { ...state };
        emit();
        watchCap();
      },
      Math.min(wait, MAX_TIMEOUT),
    );
  }

  /**
   * The server refused for the Voice Cap; `resetsAt` is an ISO timestamp. One that is missing or
   * unreadable counts as the next UTC midnight (the Voice Cap's day is a UTC day), so the button
   * is never stuck capped for good nor wrongly free at once.
   */
  function setCap(cap: { cap: number; resetsAt?: string }) {
    const parsed = Date.parse(cap.resetsAt ?? '');
    state = {
      ...state,
      voiceCap: {
        cap: cap.cap,
        resetsAt: Number.isNaN(parsed) ? nextUtcMidnight(Date.now()) : parsed,
      },
    };
    watchCap();
  }

  /** The Voice Note did not reach Review; `keepRecording` holds the audio for Retry. */
  function failed(
    error: VoiceErrorCode,
    options: {
      rawError?: VoiceNoteState['rawError'];
      keepRecording?: boolean;
    } = {},
  ) {
    letSleep();
    go({
      phase: 'failed',
      page: state.page,
      recording: options.keepRecording ? state.recording : undefined,
      error,
      rawError: options.rawError,
    });
  }

  /** Maps what went wrong with the read to the state the status pill shows. */
  function settleFailure(error: unknown, audio: Recording) {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'voice.nothing_heard':
          return failed('nothingHeard');
        case 'voice.cap_reached':
          setCap({
            cap: Number(error.params.cap) || 0,
            resetsAt:
              typeof error.params.resetsAt === 'string'
                ? error.params.resetsAt
                : undefined,
          });
          return failed('capReached');
        case 'voice.too_long':
          return failed('tooLong');
        case 'voice.unsupported_audio':
          console.error('Voice Note format not supported', audio.mimeType);
          return failed('unsupported');
        case 'voice.not_configured':
          // Voice went away on the server: drop the note without a word.
          letSleep();
          idle();
          return notify('switchedOff');
      }
    }
    // No signal and a provider that is down share the pill's own wording; anything else says what it was.
    const offline =
      error instanceof ApiError &&
      (error.code === 'network_error' ||
        error.code === 'voice.provider_unavailable');
    failed('failed', {
      rawError: offline
        ? undefined
        : error instanceof ApiError
          ? { code: error.code, params: error.params }
          : { code: 'unknown', params: {} },
      keepRecording: true,
    });
  }

  /** Sends the audio and settles the note. Everything after an abort is ignored. */
  async function send(
    audio: Recording,
    scanLanguage: ScanLanguage,
    locale: Locale,
    page: VoiceList,
  ) {
    const request = new AbortController();
    reading = request;
    hold();
    go({
      phase: 'reading',
      page,
      recording: {
        blob: audio.blob,
        mimeType: audio.mimeType,
        durationMs: audio.durationMs,
        scanLanguage,
      },
    });
    try {
      const result = await adapters.send({
        recording: audio,
        scanLanguage,
        locale,
        defaultTarget: page,
        today: localIso(new Date()),
        signal: request.signal,
      });
      if (request.signal.aborted) return;
      reading = undefined;
      if (result.transcript.trim() === '') return failed('nothingHeard');
      letSleep();
      go({
        phase: 'review',
        page,
        // Kept for Review's "English · 0:09"; a discard or Apply drops it with the rest.
        recording: state.recording,
        proposal: { transcript: result.transcript, actions: result.actions },
      });
    } catch (error) {
      // Cancelled: the pill is already gone, and so is the lock (a newer press may hold its own).
      if (request.signal.aborted) return;
      reading = undefined;
      settleFailure(error, audio);
    }
  }

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
    /**
     * Attaches the function that tells the Member (the app root's toasts). Returns the function
     * that detaches it.
     */
    attachNotifier(notify: (notice: VoiceNotice) => void) {
      notifier = notify;
      return () => {
        if (notifier === notify) notifier = adapters.notify;
      };
    },

    /**
     * Interim, until the recording moves in: the Member pressed the button. The screen stays awake
     * until the note is settled.
     */
    pressStarted: hold,
    /**
     * Interim: the press ended without a note (let go too soon, no microphone, the page left). The
     * screen may sleep, unless a read in flight still needs it.
     */
    pressEnded() {
      if (!reading) letSleep();
    },

    /** The microphone is on and the Member is speaking. */
    startRecording(page: VoiceList) {
      if (state.phase !== 'idle') return;
      go({ phase: 'recording', page });
    },
    /** The Member let go or slid off to cancel without sending. */
    cancelRecording() {
      if (state.phase !== 'recording') return;
      idle();
    },
    /**
     * Sends the recording and reads it; `page` is the list the note is sent to. Settles when the
     * read has: in Review, failed, or dropped.
     */
    read(
      audio: Recording,
      options: { scanLanguage: ScanLanguage; locale: Locale; page: VoiceList },
    ): Promise<void> {
      if (state.phase !== 'idle') return Promise.resolve();
      return send(audio, options.scanLanguage, options.locale, options.page);
    },
    /** Sends the kept recording again: the same audio, in the language and for the page it had. */
    retry(locale: Locale): Promise<void> {
      const { phase, recording: kept, page } = state;
      if (phase !== 'failed' || !kept) return Promise.resolve();
      return send(
        {
          blob: kept.blob,
          mimeType: kept.mimeType,
          durationMs: kept.durationMs,
        },
        kept.scanLanguage,
        locale,
        page,
      );
    },
    /** Gives up waiting for the read. The server is not told, so the Voice Cap charge stands. */
    cancelReading() {
      if (state.phase !== 'reading') return;
      reading?.abort();
      reading = undefined;
      letSleep();
      idle();
      notify('readCancelled');
    },
    /** The Voice Note failed before or without a read (no microphone, the Voice Cap). */
    fail(error: 'unavailable' | 'capReached') {
      if (
        state.phase !== 'idle' &&
        state.phase !== 'recording' &&
        state.phase !== 'failed'
      ) {
        return;
      }
      failed(error);
    },
    /** Drops a failure and its kept recording. */
    dismiss() {
      if (state.phase !== 'failed') return;
      idle();
    },
    /** Drops a failure and its kept recording, and says so. */
    discardFailed() {
      if (state.phase !== 'failed') return;
      idle();
      notify('discarded');
    },
    /** Whether the Voice Cap is still in force at `now` (ms). It lifts at the server's reset time. */
    isCapReached: (now: number = Date.now()) =>
      state.voiceCap !== undefined && now < state.voiceCap.resetsAt,

    /** Review: drops a Voice Action. */
    remove(id: string) {
      if (state.phase !== 'review' || !state.proposal) return;
      state = {
        ...state,
        proposal: {
          ...state.proposal,
          actions: state.proposal.actions.filter((a) => a.id !== id),
        },
      };
      emit();
    },
    /** Review: changes a Voice Action. */
    edit(id: string, patch: VoiceNoteEdit) {
      if (state.phase !== 'review' || !state.proposal) return;
      state = {
        ...state,
        proposal: {
          ...state.proposal,
          actions: state.proposal.actions.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        },
      };
      emit();
    },
    /** Apply was sent: Review stays open, its buttons disabled. Only from Review. */
    applying() {
      if (state.phase !== 'review') return;
      state = { ...state, phase: 'applying' };
      emit();
    },
    /** Apply failed: back to Review with every edit kept. */
    applyFailed() {
      if (state.phase !== 'applying') return;
      state = { ...state, phase: 'review' };
      emit();
    },
    /** Closes Review once Apply has succeeded. */
    applied() {
      if (state.phase !== 'applying') return;
      idle();
    },
    /** Closes Review without applying; ignored while Apply is in flight. */
    discard() {
      if (state.phase !== 'review') return;
      idle();
    },

    /** Back to a fresh start: aborts any read, lets the screen sleep, forgets the Voice Cap. */
    reset() {
      reading?.abort();
      reading = undefined;
      letSleep();
      clearTimeout(capTimer);
      state = initial;
      emit();
    },
  };
}

export type VoiceNote = ReturnType<typeof createVoiceNote>;

/** The app's one Voice Note. */
export const voiceNote = createVoiceNote();

/** Whether the status pill is up (reading, or a failure or notice) for this phase. */
export const isPillUp = (phase: VoicePhase) =>
  phase === 'reading' || phase === 'failed';

export const useVoiceNoteState = () =>
  useSyncExternalStore(
    voiceNote.subscribe,
    voiceNote.getState,
    voiceNote.getState,
  );
