import { useSyncExternalStore } from 'react';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { ScanLanguage } from '../i18n/resources';
import type { Recording } from './microphone';
import { keepScreenAwake } from './wakeLock';
import type { VoiceList, VoiceNoteResult, VoiceReviewAction } from './voice';

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
  /** The translated server message when `error` is `failed`. */
  errorMessage?: string;
  /** The Voice Cap, once the server reported it reached. In memory only; a reload drops it. */
  voiceCap?: { cap: number; resetsAt: number };
};

/** The outside world of the Voice Note. More adapters (sender, microphone, notifier) join as the read and the recording move in. */
export type VoiceNoteAdapters = {
  /** Keeps the screen awake; returns the function that lets it sleep again. */
  keepScreenAwake: () => () => void;
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
  adapters: VoiceNoteAdapters = { keepScreenAwake },
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
  let read: AbortController | undefined;
  let release: (() => void) | undefined;

  return {
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },

    /** The microphone is on and the Member is speaking. */
    startRecording: (page: VoiceList) => go({ phase: 'recording', page }),
    /** The Member let go or slid off to cancel without sending. */
    cancelRecording: idle,
    /** The recording is being sent and read; `page` is the list the note is sent to. */
    read(audio: Recording, scanLanguage: ScanLanguage, page: VoiceList) {
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
    },
    /** The Voice Note did not reach Review; `keepRecording` holds the audio for Retry. */
    fail(
      error: VoiceErrorCode,
      options: { message?: string; keepRecording?: boolean } = {},
    ) {
      go({
        phase: 'failed',
        page: state.page,
        recording: options.keepRecording ? state.recording : undefined,
        error,
        errorMessage: options.message,
      });
    },
    /** The server read the recording: open Review on the Voice Actions. */
    review(result: VoiceNoteResult) {
      go({
        phase: 'review',
        page: state.page,
        // Kept for Review's "English · 0:09"; a discard or Apply drops it with the rest.
        recording: state.recording,
        proposal: { transcript: result.transcript, actions: result.actions },
      });
    },
    /** Drops a failure and its kept recording. */
    dismiss: idle,
    /**
     * The server refused for the Voice Cap; `resetsAt` is an ISO timestamp. One that is missing or
     * unreadable counts as the next UTC midnight (the Voice Cap's day is a UTC day), so the button
     * is never stuck capped for good nor wrongly free at once.
     */
    setCap(cap: { cap: number; resetsAt?: string }) {
      const parsed = Date.parse(cap.resetsAt ?? '');
      state = {
        ...state,
        voiceCap: {
          cap: cap.cap,
          resetsAt: Number.isNaN(parsed) ? nextUtcMidnight(Date.now()) : parsed,
        },
      };
      emit();
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

    beginRead(request: AbortController) {
      read = request;
    },
    /** Forgets the read, unless a newer one has taken its place. */
    endRead(request: AbortController) {
      if (read === request) read = undefined;
    },
    isReading: () => read !== undefined,
    /** Aborts the read in flight, if any. */
    abortRead() {
      read?.abort();
      read = undefined;
    },
    /** Keeps the screen awake from the press until the note is settled (Review, a notice, cancelled). */
    stayAwake() {
      release ??= adapters.keepScreenAwake();
    },
    releaseAwake() {
      release?.();
      release = undefined;
    },

    /** Back to a fresh start: aborts any read, lets the screen sleep, forgets the Voice Cap. */
    reset() {
      read?.abort();
      read = undefined;
      release?.();
      release = undefined;
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

export const useVoiceNoteState = (instance: VoiceNote = voiceNote) =>
  useSyncExternalStore(
    instance.subscribe,
    instance.getState,
    instance.getState,
  );
