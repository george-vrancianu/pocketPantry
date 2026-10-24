import { useSyncExternalStore } from 'react';
import type { CatalogSearchResult, StorageLocation, Unit } from './catalog';
import type { ScanLanguage } from '../i18n/resources';
import { ApiError } from './api';
import {
  MicrophoneError,
  startRecording as startMicrophone,
  type MicrophoneSession,
  type Recording,
} from './microphone';
import { localIso } from './pantry';
import { keepScreenAwake } from './wakeLock';
import {
  MAX_VOICE_NOTE_MS,
  MIN_VOICE_NOTE_MS,
  sendVoiceNote,
  type VoiceDefaultTarget,
  type VoiceAnswer,
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
  /** The answer sheet for a note of only Pantry Questions; nothing to apply. */
  | 'answers'
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
  defaultTarget: VoiceDefaultTarget;
  /** The audio, kept in memory while it is read and for Retry after a failed send. */
  recording?: {
    blob: Blob;
    mimeType: string;
    durationMs: number;
    /** `undefined`: none was sent, the API used the Member's Spoken Language. */
    spokenLanguage?: ScanLanguage;
  };
  /** What the server read from the recording, then as the Member edits it. */
  proposal?: {
    transcript: string;
    actions: VoiceReviewAction[];
    /** The Pantry Questions' answers. Shown by the answer sheet when they are all there is, else by the answer card in Review. */
    answers: VoiceAnswer[];
  };
  error?: VoiceErrorCode;
  /**
   * The server's error behind a `failed` that the pill has no wording of its own for: the raw code
   * and parameters, translated by the status pill. Absent for a send that never reached the server.
   */
  rawError?: { code: string; params: Record<string, unknown> };
  /** The Voice Cap, once the server reported it reached. In memory only; a reload drops it. */
  voiceCap?: { cap: number; resetsAt: number };
  /** When the microphone went live (ms since the epoch), while recording. The clock is the card's. */
  startedAt?: number;
};

/** A notice for the Member that the module has no toast of its own for. */
export type VoiceNotice =
  /** The recording was cancelled (let go off the button, Escape). */
  | 'recordingCancelled'
  /** The recording reached 60 seconds and was stopped and sent. */
  | 'stoppedAtLimit'
  /** Cancel reading: the late answer is ignored. */
  | 'readCancelled'
  /** Discard on a failed Voice Note. */
  | 'discarded'
  /** The server has Voice Notes switched off: the note was dropped quietly. */
  | 'switchedOff';

/** The outside world of the Voice Note. */
export type VoiceNoteAdapters = {
  /** Sends a recording to be read. */
  send: (request: VoiceNoteRequest) => Promise<VoiceNoteResult>;
  /** Keeps the screen awake; returns the function that lets it sleep again. */
  keepScreenAwake: () => () => void;
  /** Asks for the microphone (prompting the first time) and starts recording. */
  startMicrophone: () => Promise<MicrophoneSession>;
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

/** What stopped the recording came to: sent to be read, too short to read, or nothing was recording. */
export type StopOutcome = 'sent' | 'tooShort' | 'notStarted';

/** What a start came to. Only `denied` is the Member's to act on (the microphone sheets). */
export type StartOutcome =
  | 'started'
  /** Refused by the start guard (or a note is already under way). */
  | 'refused'
  /** The Member or the browser refused the microphone. */
  | 'denied'
  /** No microphone, or this browser cannot record: the Voice Note failed. */
  | 'unavailable'
  /** Stopped or cancelled before the microphone was live: the stream was thrown away. */
  | 'cancelled';

/** Why a start would be refused: the hook shows the matching tip before asking for permission. */
export type StartBlocker = 'active' | 'busy' | 'kept' | 'capped' | 'none';

/** The longest delay `setTimeout` takes. */
const MAX_TIMEOUT = 2 ** 31 - 1;

/** One Voice Note in the list: its own phase, audio, Default List, Spoken Language, proposal and error. */
export type VoiceNoteEntry = {
  id: number;
  phase: Exclude<VoicePhase, 'idle' | 'recording'>;
  defaultTarget: VoiceDefaultTarget;
  recording?: VoiceNoteState['recording'];
  proposal?: VoiceNoteState['proposal'];
  error?: VoiceErrorCode;
  rawError?: VoiceNoteState['rawError'];
};

/**
 * What the module holds: the Voice Notes (for now at most one), which one is open in Review (and
 * read by the pill), and the module-level Voice Cap and recording in progress.
 */
type VoiceNoteStore = {
  notes: VoiceNoteEntry[];
  openId?: number;
  /** The recording in progress (the microphone is live); it is not a Voice Note yet. */
  live?: { defaultTarget: VoiceDefaultTarget; startedAt: number };
  /** The Default List of the last note, kept for the idle view. */
  lastTarget: VoiceDefaultTarget;
  voiceCap?: { cap: number; resetsAt: number };
};

const initial: VoiceNoteStore = { notes: [], lastTarget: 'shopping' };

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
  adapters: VoiceNoteAdapters = {
    send: sendVoiceNote,
    keepScreenAwake,
    startMicrophone,
  },
) {
  let store = initial;
  let nextId = 1;
  let view: VoiceNoteState = { phase: 'idle', defaultTarget: 'shopping' };
  const listeners = new Set<() => void>();
  /** The flat view of what is on screen: the recording in progress, else the open Voice Note, else idle. */
  const project = (): VoiceNoteState => {
    const { live, voiceCap } = store;
    if (live) {
      return {
        phase: 'recording',
        defaultTarget: live.defaultTarget,
        startedAt: live.startedAt,
        voiceCap,
      };
    }
    const open = store.notes.find((n) => n.id === store.openId);
    if (!open) {
      return { phase: 'idle', defaultTarget: store.lastTarget, voiceCap };
    }
    const { id: _id, ...fields } = open;
    return { ...fields, voiceCap };
  };
  /** Publishes the store: a new view object, so subscribers that compare snapshots render again. */
  const emit = () => {
    view = project();
    for (const listener of listeners) listener();
  };
  const openNote = () => store.notes.find((n) => n.id === store.openId);
  const phase = (): VoicePhase => view.phase;

  /** Puts a new Voice Note in the list and opens it (it replaces the one there: the list holds one for now). */
  function go(next: Omit<VoiceNoteEntry, 'id'>) {
    const id = nextId++;
    store = {
      ...store,
      notes: [{ id, ...next }],
      openId: id,
      live: undefined,
      lastTarget: next.defaultTarget,
    };
    emit();
  }
  /** Changes the open Voice Note in place. */
  function patchOpen(patch: (note: VoiceNoteEntry) => VoiceNoteEntry) {
    store = {
      ...store,
      notes: store.notes.map((n) => (n.id === store.openId ? patch(n) : n)),
    };
    emit();
  }
  /** Review: swaps the chosen list's resolution into each action with a list to pick that `matches`. `byList` stays, so the pick can change. */
  const swapLists = (
    list: VoiceList,
    matches: (action: VoiceReviewAction) => boolean,
  ) => {
    const proposal = openNote()?.proposal;
    if (phase() !== 'review' || !proposal) return;
    patchOpen((n) => ({
      ...n,
      proposal: {
        ...proposal,
        actions: proposal.actions.map((a) =>
          a.byList && matches(a) ? { ...a.byList[list], byList: a.byList } : a,
        ),
      },
    }));
  };
  /** Nothing recording and no note open: the list is emptied (it holds at most one for now). */
  const idle = () => {
    store = { ...store, notes: [], openId: undefined, live: undefined };
    emit();
  };

  /**
   * What outlives the page that started a Voice Note, so the pill on either page can reach it: the
   * request being read (Cancel aborts it) and the lock that keeps the screen awake until it ends.
   */
  let reading: AbortController | undefined;
  let release: (() => void) | undefined;
  let notifier = adapters.notify;
  let capTimer: ReturnType<typeof setTimeout> | undefined;
  /** The microphone: being asked for, then live; and what the recording is for. */
  let starting: { cancelled: boolean } | undefined;
  let session: MicrophoneSession | undefined;
  let limitTimer: ReturnType<typeof setTimeout> | undefined;
  let recordingFor: { spokenLanguage?: ScanLanguage } | undefined;
  /** The audio of a stopped recording is being finalised. */
  let finishing = false;

  const notify = (notice: VoiceNotice) => notifier?.(notice);
  const keepAwake = () => {
    release ??= adapters.keepScreenAwake();
  };
  const letSleep = () => {
    release?.();
    release = undefined;
  };

  /** Renders again when the Voice Cap lifts: the state itself would not change. */
  function watchCap() {
    clearTimeout(capTimer);
    if (!store.voiceCap) return;
    const wait = store.voiceCap.resetsAt - Date.now();
    if (wait <= 0) return;
    capTimer = setTimeout(
      () => {
        // A new object, so subscribers that compare snapshots render again.
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
    store = {
      ...store,
      voiceCap: {
        cap: cap.cap,
        resetsAt: Number.isNaN(parsed) ? nextUtcMidnight(Date.now()) : parsed,
      },
    };
    view = project();
    watchCap();
  }

  /** Ends the microphone without sending: a live session is cancelled, a start in flight on arrival. */
  function dropMicrophone() {
    clearTimeout(limitTimer);
    limitTimer = undefined;
    session?.cancel();
    session = undefined;
    if (starting) starting.cancelled = true;
  }

  /** The Voice Note did not reach Review; `keepRecording` holds the audio for Retry. */
  function failed(
    error: VoiceErrorCode,
    options: {
      rawError?: VoiceNoteState['rawError'];
      keepRecording?: boolean;
    } = {},
  ) {
    dropMicrophone();
    letSleep();
    go({
      phase: 'failed',
      defaultTarget: view.defaultTarget,
      recording: options.keepRecording ? view.recording : undefined,
      error,
      rawError: options.rawError,
    });
  }

  /** Whether the Voice Cap is still in force. It lifts at the server's reset time. */
  function isCapReached() {
    return store.voiceCap !== undefined && Date.now() < store.voiceCap.resetsAt;
  }

  /** The Voice Note failed before or without a read (no microphone, the Voice Cap). */
  function failBeforeRead(error: 'unavailable' | 'capReached') {
    if (phase() !== 'idle' && phase() !== 'recording' && phase() !== 'failed') {
      return;
    }
    failed(error);
  }

  /** The Voice Note cannot be recorded: no microphone, or this browser cannot record. */
  const fail = (error: 'unavailable') => failBeforeRead(error);

  /** Why a start would be refused right now. */
  function startBlocker(): StartBlocker {
    // A note is already under way (the microphone starting, recording, audio being finalised): ignore silently.
    if (starting || session || finishing) return 'active';
    if (phase() === 'reading') return 'busy';
    if (phase() === 'failed' && view.recording) return 'kept';
    return isCapReached() ? 'capped' : 'none';
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
    spokenLanguage: ScanLanguage | undefined,
    defaultTarget: VoiceDefaultTarget,
  ) {
    const request = new AbortController();
    reading = request;
    keepAwake();
    go({
      phase: 'reading',
      defaultTarget,
      recording: {
        blob: audio.blob,
        mimeType: audio.mimeType,
        durationMs: audio.durationMs,
        spokenLanguage,
      },
    });
    try {
      const result = await adapters.send({
        recording: audio,
        spokenLanguage,
        defaultTarget,
        today: localIso(new Date()),
        signal: request.signal,
      });
      if (request.signal.aborted) return;
      reading = undefined;
      if (result.transcript.trim() === '') return failed('nothingHeard');
      letSleep();
      const answers = result.answers ?? [];
      // Only Pantry Questions: the answer sheet, with nothing to review or apply.
      const answersOnly = result.actions.length === 0 && answers.length > 0;
      go({
        phase: answersOnly ? 'answers' : 'review',
        defaultTarget,
        // Kept for the sheet's "English · 0:09"; closing it or Apply drops it with the rest.
        recording: view.recording,
        proposal: {
          transcript: result.transcript,
          actions: result.actions,
          answers,
        },
      });
    } catch (error) {
      // Cancelled: the pill is already gone, and so is the lock (a newer press may hold its own).
      if (request.signal.aborted) return;
      reading = undefined;
      settleFailure(error, audio);
    }
  }

  /**
   * Turns the microphone on and keeps the screen awake until the note is settled. Enforces the
   * start guard again: a capped start moves the note to the Voice Cap failure. Resolves once the
   * microphone is live, or why it is not. `spokenLanguage` is for the read.
   */
  async function start(options: {
    defaultTarget: VoiceDefaultTarget;
    spokenLanguage?: ScanLanguage;
  }): Promise<StartOutcome> {
    const blocker = startBlocker();
    if (blocker === 'active') return 'refused';
    if (blocker === 'capped') {
      failBeforeRead('capReached');
      return 'refused';
    }
    if (blocker !== 'none') return 'refused';
    // A failure without a kept recording is dropped by the next press.
    if (phase() === 'failed') idle();
    if (phase() !== 'idle') return 'refused';
    const attempt = { cancelled: false };
    starting = attempt;
    keepAwake();
    let live: MicrophoneSession;
    try {
      live = await adapters.startMicrophone();
    } catch (error) {
      starting = undefined;
      if (!attempt.cancelled) letSleep();
      if (error instanceof MicrophoneError && error.reason === 'denied') {
        return 'denied';
      }
      fail('unavailable');
      return 'unavailable';
    }
    starting = undefined;
    // Stopped or cancelled on the way (its lock is already let go): the stream is not wanted.
    if (attempt.cancelled || phase() !== 'idle') {
      live.cancel();
      if (!attempt.cancelled) letSleep();
      return 'cancelled';
    }
    session = live;
    recordingFor = { spokenLanguage: options.spokenLanguage };
    limitTimer = setTimeout(() => {
      notify('stoppedAtLimit');
      void stopRecording();
    }, MAX_VOICE_NOTE_MS);
    store = {
      ...store,
      live: {
        defaultTarget: options.defaultTarget,
        startedAt: Date.now(),
      },
      lastTarget: options.defaultTarget,
    };
    emit();
    return 'started';
  }

  /**
   * The Member let go: ends the recording and sends it to be read. Can be called while the
   * microphone is still starting, which then throws its stream away when it arrives.
   */
  async function stopRecording(): Promise<StopOutcome> {
    if (starting) {
      starting.cancelled = true;
      letSleep();
      return 'notStarted';
    }
    const active = session;
    const mine = recordingFor;
    if (!active || !mine) return 'notStarted';
    clearTimeout(limitTimer);
    limitTimer = undefined;
    session = undefined;
    recordingFor = undefined;
    // Not recording any more, even while the audio is finalised.
    finishing = true;
    idle();
    let audio: Recording;
    try {
      audio = await active.stop();
    } catch {
      finishing = false;
      fail('unavailable');
      return 'notStarted';
    }
    finishing = false;
    if (audio.durationMs < MIN_VOICE_NOTE_MS) {
      letSleep();
      return 'tooShort';
    }
    // Something else ended the note while the audio was finalised.
    if (phase() !== 'idle') {
      letSleep();
      return 'notStarted';
    }
    void send(audio, mine.spokenLanguage, view.defaultTarget);
    return 'sent';
  }

  /**
   * Throws the recording away. Says so unless `quiet` (the page was left). With nothing
   * recording or starting it does nothing: a read in flight and its wake lock are left alone.
   */
  function cancel(options: { quiet?: boolean } = {}) {
    if (!starting && !session) return;
    dropMicrophone();
    letSleep();
    if (phase() === 'recording') idle();
    if (!options.quiet) notify('recordingCancelled');
  }

  /** The input loudness, 0 to 1, for the Listening card's meter; 0 when nothing records. */
  const level = () => session?.level() ?? 0;

  return {
    getState: () => view,
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

    /** Why a start would be refused right now; read it before asking for the microphone. */
    startBlocker,
    start,
    stop: stopRecording,
    cancel,
    level,
    fail,

    /** Sends the kept recording again: the same audio, in the language and for the page it had. */
    retry(): Promise<void> {
      const { phase: now, recording: kept, defaultTarget } = view;
      if (now !== 'failed' || !kept) return Promise.resolve();
      return send(
        {
          blob: kept.blob,
          mimeType: kept.mimeType,
          durationMs: kept.durationMs,
        },
        kept.spokenLanguage,
        defaultTarget,
      );
    },
    /** Gives up waiting for the read. The server is not told, so the Voice Cap charge stands. */
    cancelReading() {
      if (phase() !== 'reading') return;
      reading?.abort();
      reading = undefined;
      letSleep();
      idle();
      notify('readCancelled');
    },
    /** Drops a failure and its kept recording. */
    dismiss() {
      if (phase() !== 'failed') return;
      idle();
    },
    /** Drops a failure and its kept recording, and says so. */
    discardFailed() {
      if (phase() !== 'failed') return;
      idle();
      notify('discarded');
    },
    isCapReached,

    /** Review: drops a Voice Action. */
    remove(id: string) {
      const proposal = openNote()?.proposal;
      if (phase() !== 'review' || !proposal) return;
      patchOpen((n) => ({
        ...n,
        proposal: {
          ...proposal,
          actions: proposal.actions.filter((a) => a.id !== id),
        },
      }));
    },
    /** Review: puts a `needsList` action on a list, swapping in that list's resolution. The pick can change. */
    pickList(id: string, list: VoiceList) {
      swapLists(list, (a) => a.id === id);
    },
    /** Review: puts every action that has a list to pick on one list. */
    pickAllLists(list: VoiceList) {
      swapLists(list, () => true);
    },
    /** Review: changes a Voice Action. */
    edit(id: string, patch: VoiceNoteEdit) {
      const proposal = openNote()?.proposal;
      if (phase() !== 'review' || !proposal) return;
      patchOpen((n) => ({
        ...n,
        proposal: {
          ...proposal,
          actions: proposal.actions.map((a) =>
            a.id === id ? { ...a, ...patch } : a,
          ),
        },
      }));
    },
    /** Apply was sent: Review stays open, its buttons disabled. Only from Review. */
    applying() {
      if (phase() !== 'review') return;
      patchOpen((n) => ({ ...n, phase: 'applying' }));
    },
    /** Apply failed: back to Review with every edit kept. */
    applyFailed() {
      if (phase() !== 'applying') return;
      patchOpen((n) => ({ ...n, phase: 'review' }));
    },
    /** Closes Review once Apply has succeeded. */
    applied() {
      if (phase() !== 'applying') return;
      idle();
    },
    /** Done on the answer sheet: closes it. Nothing was written, so nothing is sent. */
    closeAnswers() {
      if (phase() !== 'answers') return;
      idle();
    },
    /** Closes Review without applying; ignored while Apply is in flight. */
    discard() {
      if (phase() !== 'review') return;
      idle();
    },
  };
}

export type VoiceNote = ReturnType<typeof createVoiceNote>;

/** The app's one Voice Note. */
export const voiceNote = createVoiceNote();

/** Whether the status pill is up (reading or failed) for this phase. */
export const isPillUp = (phase: VoicePhase) =>
  phase === 'reading' || phase === 'failed';

export const useVoiceNoteState = () =>
  useSyncExternalStore(
    voiceNote.subscribe,
    voiceNote.getState,
    voiceNote.getState,
  );
