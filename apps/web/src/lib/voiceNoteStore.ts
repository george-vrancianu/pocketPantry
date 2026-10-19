import { useSyncExternalStore } from 'react';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { ScanLanguage } from '../i18n/resources';
import type { Recording } from './microphone';
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

const initial: VoiceNoteState = { phase: 'idle', page: 'shopping' };

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

/**
 * The Voice Note in memory, shared by the hold-to-talk button and Review on any
 * page, so the Pantry page can reuse both. Nothing here is stored: a reload
 * drops the Voice Note.
 */
export const voiceNote = {
  /** The microphone is on and the Member is speaking. */
  startRecording: (page: VoiceList) => go({ phase: 'recording', page }),
  /** The Member let go or slid off to cancel without sending. */
  cancelRecording: () => go({ phase: 'idle', page: state.page }),
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
  /** Apply was sent: Review stays open, its buttons disabled. */
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
  /** Drops a failure and its kept recording. */
  dismiss: () => go({ phase: 'idle', page: state.page }),
  /** Closes Review without applying; not while Apply is in flight. */
  discard() {
    if (state.phase === 'applying') return;
    go({ phase: 'idle', page: state.page });
  },
  /** Closes Review once Apply has succeeded. */
  applied: () => go({ phase: 'idle', page: state.page }),
  remove(id: string) {
    if (!state.proposal) return;
    state = {
      ...state,
      proposal: {
        ...state.proposal,
        actions: state.proposal.actions.filter((a) => a.id !== id),
      },
    };
    emit();
  },
  edit(
    id: string,
    patch: Partial<{
      quantity: number | null;
      unit: Unit | null;
      ingredient: CatalogSearchResult | null;
      name: string | null;
      location: StorageLocation | null;
      expiresOn: string | null;
      noExpiry: boolean;
      batchId: string | null;
      defaults: VoiceReviewAction['defaults'];
    }>,
  ) {
    if (!state.proposal) return;
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
};

const nextUtcMidnight = (now: number) => {
  const day = new Date(now);
  return Date.UTC(
    day.getUTCFullYear(),
    day.getUTCMonth(),
    day.getUTCDate() + 1,
  );
};

/** Whether the Voice Cap is still in force at `now` (ms). It lifts at the server's reset time. */
export function isVoiceCapReached(now: number = Date.now()): boolean {
  return state.voiceCap !== undefined && now < state.voiceCap.resetsAt;
}

/**
 * What outlives the page that started a Voice Note, so the pill on either page can reach it: the request
 * being read (Cancel aborts it) and the lock that keeps the screen awake until it ends.
 */
export const inFlight: {
  read?: AbortController;
  release?: () => void;
} = {};

export function resetVoiceNote() {
  inFlight.read?.abort();
  inFlight.read = undefined;
  inFlight.release?.();
  inFlight.release = undefined;
  state = initial;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

export const getVoiceNoteState = () => state;

export const useVoiceNoteState = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
