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
  'unavailable' | 'tooShort' | 'nothingHeard' | 'failed';

/** A Voice Action as Review edits it. */
export type VoiceActionDraft = VoiceReviewAction;

export type VoiceNoteState = {
  phase: VoicePhase;
  /** The page that recorded: the default target of the Voice Note. */
  page: VoiceList;
  /** The audio, kept in memory while it is read and for Retry after a failed send. */
  recording?: {
    blob: Blob;
    mimeType: string;
    seconds: number;
    scanLanguage: ScanLanguage;
  };
  /** What the server read from the recording, then as the Member edits it. */
  proposal?: { transcript: string; actions: VoiceActionDraft[] };
  error?: VoiceErrorCode;
  /** The translated server message when `error` is `failed`. */
  errorMessage?: string;
  /** The Voice Cap, once the server reported it reached. In memory only; a reload drops it. */
  voiceCap?: { cap: number; resetsAt: number };
};

const initial: VoiceNoteState = { phase: 'idle', page: 'shopping' };

let state = initial;
const listeners = new Set<() => void>();

/** Replaces the transient fields; the Voice Cap is only touched by `setCap`. */
function go(next: Omit<VoiceNoteState, 'voiceCap'>) {
  state = { ...next, voiceCap: state.voiceCap };
  for (const listener of listeners) listener();
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
  /** The recording is being sent and read. */
  /** `page` is the list the note is sent to. */
  read(audio: Recording, scanLanguage: ScanLanguage, page: VoiceList) {
    go({
      phase: 'reading',
      page,
      recording: {
        blob: audio.blob,
        mimeType: audio.mimeType,
        seconds: audio.durationMs / 1000,
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
    for (const listener of listeners) listener();
  },
  /** Apply failed: back to Review with every edit kept. */
  applyFailed() {
    if (state.phase !== 'applying') return;
    state = { ...state, phase: 'review' };
    for (const listener of listeners) listener();
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
    for (const listener of listeners) listener();
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
    for (const listener of listeners) listener();
  },
  /** The server refused for the Voice Cap; `resetsAt` is an ISO timestamp. */
  setCap(cap: { cap: number; resetsAt: string }) {
    state = {
      ...state,
      voiceCap: { cap: cap.cap, resetsAt: Date.parse(cap.resetsAt) },
    };
    for (const listener of listeners) listener();
  },
};

/** Whether the Voice Cap is still in force at `now` (ms). It lifts at the server's reset time. */
export function isVoiceCapReached(now: number = Date.now()): boolean {
  return state.voiceCap !== undefined && now < state.voiceCap.resetsAt;
}

export function resetVoiceNote() {
  state = initial;
  for (const listener of listeners) listener();
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
