import { useSyncExternalStore } from 'react';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { Recording } from './microphone';
import type { VoiceList, VoiceNoteResult, VoiceReviewAction } from './voice';

/** Why the last Voice Note did not reach Review. */
export type VoiceNotice =
  | { kind: 'denied' }
  | { kind: 'unavailable' }
  | { kind: 'tooShort' }
  | { kind: 'nothingHeard' }
  | { kind: 'failed'; message: string; canRetry: boolean };

/** A Voice Note being reviewed: what was said, and the Voice Actions as the Member is editing them. */
export type VoiceReviewNote = {
  transcript: string;
  actions: VoiceReviewAction[];
  /** The list of the page that recorded it. */
  defaultTarget: VoiceList;
};

export type VoiceNoteState = {
  sending: boolean;
  notice: VoiceNotice | null;
  /** A recording that failed to send, kept for Retry; never persisted, so a reload drops it. */
  pending: Recording | null;
  note: VoiceReviewNote | null;
};

const initial: VoiceNoteState = {
  sending: false,
  notice: null,
  pending: null,
  note: null,
};

let state = initial;
const listeners = new Set<() => void>();

function set(patch: Partial<VoiceNoteState>) {
  state = { ...state, ...patch };
  for (const listener of listeners) listener();
}

/**
 * The Voice Note in memory, shared by the hold-to-talk button and Review on any
 * page, so the Pantry page can reuse both. Nothing here is stored: a reload
 * drops the Voice Note.
 */
export const voiceNote = {
  setSending: (sending: boolean) => set({ sending }),
  setNotice: (notice: VoiceNotice | null) => set({ notice }),
  setPending: (pending: Recording | null) => set({ pending }),
  open(result: VoiceNoteResult, defaultTarget: VoiceList) {
    set({
      note: {
        transcript: result.transcript,
        actions: result.actions,
        defaultTarget,
      },
    });
  },
  discard: () => set({ note: null }),
  remove(id: string) {
    if (!state.note) return;
    set({
      note: {
        ...state.note,
        actions: state.note.actions.filter((a) => a.id !== id),
      },
    });
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
    }>,
  ) {
    if (!state.note) return;
    set({
      note: {
        ...state.note,
        actions: state.note.actions.map((a) =>
          a.id === id ? { ...a, ...patch } : a,
        ),
      },
    });
  },
};

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
