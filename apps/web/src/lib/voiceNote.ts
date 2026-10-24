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
  /** The Voice Inbox: how many Voice Notes are being read (or waiting), ready, failed, and in all. */
  inbox: {
    reading: number;
    ready: number;
    failed: number;
    total: number;
    /** Every Voice Note in recording order: its id (for `cancelReading` and the like) and phase. */
    notes: Array<{ id: number; phase: VoicePhase }>;
  };
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
  | 'switchedOff'
  /** A Voice Note was read and is ready to review. */
  | 'noteReady'
  /** A sixth Voice Note was refused: Review the others first. */
  | 'inboxFull';

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
export type StartBlocker =
  | 'active'
  /** A Review or answer sheet is open. */
  | 'review'
  | 'kept'
  /** The Voice Inbox holds its most. */
  | 'full'
  | 'capped'
  | 'none';

/** The longest delay `setTimeout` takes. */
const MAX_TIMEOUT = 2 ** 31 - 1;

/** How many Voice Notes are read at once; the rest wait in recording order. */
export const MAX_READS = 2;
/** How many Voice Notes the Voice Inbox holds. */
export const MAX_NOTES = 5;

/** One Voice Note in the list: its own phase, audio, Default List, Spoken Language, proposal and error. */
type VoiceNoteEntry = {
  id: number;
  phase: Exclude<VoicePhase, 'idle' | 'recording'>;
  defaultTarget: VoiceDefaultTarget;
  recording?: VoiceNoteState['recording'];
  proposal?: VoiceNoteState['proposal'];
  error?: VoiceErrorCode;
  rawError?: VoiceNoteState['rawError'];
  /** Setup's Say it: the note is open from the start and stays open when it is read, with no strip. */
  openWhenReady?: boolean;
};

/**
 * What the module holds: the Voice Notes (the Voice Inbox, at most MAX_NOTES), which one is open
 * (Review, the answer sheet, or a failure's pill), and the module-level Voice Cap and recording in progress.
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

const isReady = (n: VoiceNoteEntry) =>
  n.phase === 'review' || n.phase === 'answers';
/** A Review or answer sheet is on screen (or applying). */
const isSheet = (n: VoiceNoteEntry | undefined) =>
  n !== undefined && (isReady(n) || n.phase === 'applying');

/**
 * The one owner of the Voice Inbox in memory, shared by the hold-to-talk button and Review on any
 * page. Nothing here is stored: a reload drops the Voice Notes. A transition from the wrong phase
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
  let view: VoiceNoteState = {
    phase: 'idle',
    defaultTarget: 'shopping',
    inbox: { reading: 0, ready: 0, failed: 0, total: 0, notes: [] },
  };
  const listeners = new Set<() => void>();
  const openNote = () => store.notes.find((n) => n.id === store.openId);
  const countInbox = (): VoiceNoteState['inbox'] => ({
    reading: store.notes.filter((n) => n.phase === 'reading').length,
    ready: store.notes.filter((n) => isReady(n) || n.phase === 'applying')
      .length,
    failed: store.notes.filter((n) => n.phase === 'failed').length,
    total: store.notes.length,
    notes: store.notes.map((n) => ({ id: n.id, phase: n.phase })),
  });
  /** The flat view of what is on screen: the recording in progress, else the open Voice Note, else idle. */
  const project = (): VoiceNoteState => {
    const { live, voiceCap } = store;
    const inbox = countInbox();
    if (live) {
      return {
        phase: 'recording',
        defaultTarget: live.defaultTarget,
        startedAt: live.startedAt,
        voiceCap,
        inbox,
      };
    }
    const open = openNote();
    if (!open) {
      return {
        phase: 'idle',
        defaultTarget: store.lastTarget,
        voiceCap,
        inbox,
      };
    }
    const { id: _id, openWhenReady: _open, ...fields } = open;
    return { ...fields, voiceCap, inbox };
  };
  /** Asks the browser to confirm leaving while the Voice Inbox holds a note. */
  const confirmLeave = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  };
  let guarding = false;
  const guardUnload = () => {
    const want = store.notes.length > 0;
    if (want === guarding || typeof window === 'undefined') return;
    guarding = want;
    if (want) window.addEventListener('beforeunload', confirmLeave);
    else window.removeEventListener('beforeunload', confirmLeave);
  };
  /** Publishes the store: a new view object, so subscribers that compare snapshots render again. */
  const emit = () => {
    view = project();
    guardUnload();
    for (const listener of listeners) listener();
  };
  const phase = (): VoicePhase => view.phase;

  /** Adds a Voice Note to the end of the list (recording order) and returns its id. */
  function append(next: Omit<VoiceNoteEntry, 'id'>) {
    const id = nextId++;
    store = {
      ...store,
      notes: [...store.notes, { id, ...next }],
      lastTarget: next.defaultTarget,
    };
    return id;
  }
  /** Changes one Voice Note in place, by id. */
  function patchNote(
    id: number,
    patch: (note: VoiceNoteEntry) => VoiceNoteEntry,
  ) {
    store = {
      ...store,
      notes: store.notes.map((n) => (n.id === id ? patch(n) : n)),
    };
  }
  /** Changes the open Voice Note in place. */
  function patchOpen(patch: (note: VoiceNoteEntry) => VoiceNoteEntry) {
    if (store.openId === undefined) return;
    patchNote(store.openId, patch);
    emit();
  }
  /** A failure comes up on the pill, unless a Review or answer sheet is open. */
  function surface(id: number) {
    const open = openNote();
    if (!open || open.phase === 'failed') store = { ...store, openId: id };
  }
  /** Takes a Voice Note out of the list; a waiting failure, if any, comes up. */
  function removeNote(id: number) {
    store = {
      ...store,
      notes: store.notes.filter((n) => n.id !== id),
      openId: store.openId === id ? undefined : store.openId,
    };
    if (store.openId === undefined) {
      const waiting = store.notes.find((n) => n.phase === 'failed');
      if (waiting) store = { ...store, openId: waiting.id };
    }
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
  /** Closes the open Voice Note's sheet by taking it out of the list. */
  const removeOpen = () => {
    if (store.openId !== undefined) removeNote(store.openId);
  };

  /**
   * What outlives the page that started a Voice Note: each request being read has its own handle
   * (Cancel aborts it), and the lock that keeps the screen awake lasts while anything holds it.
   */
  const reads = new Map<number, AbortController>();
  const holds = new Set<number | 'mic'>();
  let release: (() => void) | undefined;
  let notifier = adapters.notify;
  let capTimer: ReturnType<typeof setTimeout> | undefined;
  /** The microphone: being asked for, then live; and what the recording is for. */
  let starting: { cancelled: boolean } | undefined;
  let session: MicrophoneSession | undefined;
  let limitTimer: ReturnType<typeof setTimeout> | undefined;
  let recordingFor:
    { spokenLanguage?: ScanLanguage; openWhenReady?: boolean } | undefined;
  /** The audio of a stopped recording is being finalised. */
  let finishing = false;
  /** Bumped by `clear`, so a recording finalised after it is thrown away. */
  let epoch = 0;

  const notify = (notice: VoiceNotice) => notifier?.(notice);
  /** The screen stays awake while anything holds it: the microphone, or a read in flight. */
  const keepAwake = (holder: number | 'mic') => {
    holds.add(holder);
    release ??= adapters.keepScreenAwake();
  };
  const letSleep = (holder: number | 'mic') => {
    holds.delete(holder);
    if (holds.size > 0) return;
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

  /** A read note did not reach Review; `keepRecording` holds the audio for Retry. */
  function failNote(
    id: number,
    error: VoiceErrorCode,
    options: {
      rawError?: VoiceNoteState['rawError'];
      keepRecording?: boolean;
    } = {},
  ) {
    patchNote(id, (n) => ({
      ...n,
      phase: 'failed',
      error,
      rawError: options.rawError,
      recording: options.keepRecording ? n.recording : undefined,
    }));
    surface(id);
    emit();
  }

  /** The recording failed before a read (no microphone, the Voice Cap): a failed note with no audio. */
  function failBeforeRead(error: 'unavailable' | 'capReached') {
    // The audio being finalised is not wanted any more.
    if (finishing) epoch++;
    dropMicrophone();
    letSleep('mic');
    const open = openNote();
    // A failure with nothing kept is dropped by the next one.
    if (open?.phase === 'failed' && !open.recording) {
      store = { ...store, openId: undefined };
      store = { ...store, notes: store.notes.filter((n) => n.id !== open.id) };
    }
    const id = append({
      phase: 'failed',
      defaultTarget: store.live?.defaultTarget ?? store.lastTarget,
      error,
    });
    store = { ...store, live: undefined };
    surface(id);
    emit();
  }

  /** The Voice Note cannot be recorded: no microphone, or this browser cannot record. */
  const fail = (error: 'unavailable') => failBeforeRead(error);

  /** Whether the Voice Cap is still in force. It lifts at the server's reset time. */
  function isCapReached() {
    return store.voiceCap !== undefined && Date.now() < store.voiceCap.resetsAt;
  }

  /** Why a start would be refused right now. */
  function startBlocker(): StartBlocker {
    // A note is already under way (the microphone starting, recording, audio being finalised): ignore silently.
    if (starting || session || finishing) return 'active';
    // The mic is not offered while a Review or answer sheet is open.
    if (isSheet(openNote())) return 'review';
    const open = openNote();
    if (open?.phase === 'failed' && open.recording) return 'kept';
    // A failure with nothing kept is dropped by this press, so it does not count.
    const dropped = open?.phase === 'failed' && !open.recording ? 1 : 0;
    if (store.notes.length - dropped >= MAX_NOTES) return 'full';
    return isCapReached() ? 'capped' : 'none';
  }

  /** Maps what went wrong with the read to the state the note shows. */
  function settleFailure(id: number, error: unknown, audio: Recording) {
    if (error instanceof ApiError) {
      switch (error.code) {
        case 'voice.nothing_heard':
          return failNote(id, 'nothingHeard');
        case 'voice.cap_reached':
          setCap({
            cap: Number(error.params.cap) || 0,
            resetsAt:
              typeof error.params.resetsAt === 'string'
                ? error.params.resetsAt
                : undefined,
          });
          return failNote(id, 'capReached');
        case 'voice.too_long':
          return failNote(id, 'tooLong');
        case 'voice.unsupported_audio':
          console.error('Voice Note format not supported', audio.mimeType);
          return failNote(id, 'unsupported');
        case 'voice.not_configured':
          // Voice went away on the server: drop the note without a word.
          removeNote(id);
          return notify('switchedOff');
      }
    }
    // No signal and a provider that is down share the pill's own wording; anything else says what it was.
    const offline =
      error instanceof ApiError &&
      (error.code === 'network_error' ||
        error.code === 'voice.provider_unavailable');
    failNote(id, 'failed', {
      rawError: offline
        ? undefined
        : error instanceof ApiError
          ? { code: error.code, params: error.params }
          : { code: 'unknown', params: {} },
      keepRecording: true,
    });
  }

  /** Starts reading the oldest waiting notes while fewer than MAX_READS are in flight. */
  function pump() {
    while (reads.size < MAX_READS) {
      const next = store.notes.find(
        (n) => n.phase === 'reading' && !reads.has(n.id),
      );
      if (!next) return;
      void read(next.id);
    }
  }

  /** Reads one Voice Note with its own Default List and Spoken Language. Everything after an abort is ignored. */
  async function read(id: number) {
    const note = store.notes.find((n) => n.id === id);
    if (!note?.recording) return;
    const { defaultTarget, recording: kept } = note;
    const audio: Recording = {
      blob: kept.blob,
      mimeType: kept.mimeType,
      durationMs: kept.durationMs,
    };
    const request = new AbortController();
    reads.set(id, request);
    keepAwake(id);
    const settled = () => {
      reads.delete(id);
      letSleep(id);
    };
    try {
      const result = await adapters.send({
        recording: audio,
        spokenLanguage: kept.spokenLanguage,
        defaultTarget,
        today: localIso(new Date()),
        signal: request.signal,
      });
      if (request.signal.aborted) return;
      settled();
      if (result.transcript.trim() === '') {
        failNote(id, 'nothingHeard');
      } else {
        const answers = result.answers ?? [];
        // Only Pantry Questions: the answer sheet, with nothing to review or apply.
        const answersOnly = result.actions.length === 0 && answers.length > 0;
        patchNote(id, (n) => ({
          ...n,
          phase: answersOnly ? 'answers' : 'review',
          proposal: {
            transcript: result.transcript,
            actions: result.actions,
            answers,
          },
        }));
        emit();
        notify('noteReady');
      }
    } catch (error) {
      // Cancelled: the note is already gone, and so is its lock.
      if (request.signal.aborted) return;
      settled();
      settleFailure(id, error, audio);
    }
    pump();
  }

  /** Puts a recording in the Voice Inbox (after the others) and reads it as soon as a read is free. */
  function send(
    audio: Recording,
    spokenLanguage: ScanLanguage | undefined,
    defaultTarget: VoiceDefaultTarget,
    openWhenReady?: boolean,
  ) {
    const id = append({
      phase: 'reading',
      defaultTarget,
      recording: {
        blob: audio.blob,
        mimeType: audio.mimeType,
        durationMs: audio.durationMs,
        spokenLanguage,
      },
      openWhenReady,
    });
    if (openWhenReady) store = { ...store, openId: id };
    emit();
    pump();
  }

  /**
   * Turns the microphone on and keeps the screen awake until the note is settled. Enforces the
   * start guard again: a capped start moves the note to the Voice Cap failure. Resolves once the
   * microphone is live, or why it is not. `spokenLanguage` is for the read.
   */
  async function start(options: {
    defaultTarget: VoiceDefaultTarget;
    spokenLanguage?: ScanLanguage;
    /** Setup's Say it: the note opens straight away and is reviewed as soon as it is read. */
    openWhenReady?: boolean;
  }): Promise<StartOutcome> {
    const blocker = startBlocker();
    if (blocker === 'active') return 'refused';
    if (blocker === 'capped') {
      failBeforeRead('capReached');
      return 'refused';
    }
    if (blocker === 'full') {
      notify('inboxFull');
      return 'refused';
    }
    if (blocker !== 'none') return 'refused';
    // A failure without a kept recording is dropped by the next press.
    const open = openNote();
    if (open?.phase === 'failed') removeNote(open.id);
    const attempt = { cancelled: false };
    starting = attempt;
    keepAwake('mic');
    let live: MicrophoneSession;
    try {
      live = await adapters.startMicrophone();
    } catch (error) {
      starting = undefined;
      if (!attempt.cancelled) letSleep('mic');
      if (error instanceof MicrophoneError && error.reason === 'denied') {
        return 'denied';
      }
      fail('unavailable');
      return 'unavailable';
    }
    starting = undefined;
    // Stopped or cancelled on the way (its lock is already let go): the stream is not wanted.
    if (attempt.cancelled || isSheet(openNote())) {
      live.cancel();
      if (!attempt.cancelled) letSleep('mic');
      return 'cancelled';
    }
    session = live;
    recordingFor = {
      spokenLanguage: options.spokenLanguage,
      openWhenReady: options.openWhenReady,
    };
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
      letSleep('mic');
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
    const target = store.live?.defaultTarget ?? store.lastTarget;
    const mark = epoch;
    store = { ...store, live: undefined };
    emit();
    let audio: Recording;
    try {
      audio = await active.stop();
    } catch {
      finishing = false;
      if (mark === epoch) fail('unavailable');
      return 'notStarted';
    }
    finishing = false;
    if (audio.durationMs < MIN_VOICE_NOTE_MS) {
      letSleep('mic');
      return 'tooShort';
    }
    // Signed out while the audio was finalised.
    if (mark !== epoch) {
      letSleep('mic');
      return 'notStarted';
    }
    send(audio, mine.spokenLanguage, target, mine.openWhenReady);
    // The read holds the lock itself once it starts.
    letSleep('mic');
    return 'sent';
  }

  /**
   * Throws the recording away. Says so unless `quiet` (the page was left). With nothing
   * recording or starting it does nothing: reads in flight and their wake lock are left alone.
   */
  function cancel(options: { quiet?: boolean } = {}) {
    if (!starting && !session) return;
    dropMicrophone();
    letSleep('mic');
    if (store.live) {
      store = { ...store, live: undefined };
      emit();
    }
    if (!options.quiet) notify('recordingCancelled');
  }

  /** Gives up waiting for one read (without an id: the open one, else the oldest): the late answer is ignored. */
  function cancelRead(id?: number) {
    const note =
      store.notes.find((n) => n.id === id) ??
      (id === undefined
        ? [openNote(), ...store.notes].find((n) => n?.phase === 'reading')
        : undefined);
    if (!note || note.phase !== 'reading') return;
    reads.get(note.id)?.abort();
    reads.delete(note.id);
    letSleep(note.id);
    removeNote(note.id);
    notify('readCancelled');
    pump();
  }

  /** Sign-out: everything goes, the recording, every read and the Voice Cap. */
  function clear() {
    epoch++;
    dropMicrophone();
    for (const request of reads.values()) request.abort();
    reads.clear();
    holds.clear();
    release?.();
    release = undefined;
    clearTimeout(capTimer);
    store = { ...initial };
    emit();
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

    /** Sends the kept recording of the open failed note again: the same audio, in the language and for the page it had. */
    retry(): Promise<void> {
      const open = openNote();
      if (open?.phase !== 'failed' || !open.recording) return Promise.resolve();
      patchNote(open.id, (n) => ({
        ...n,
        phase: 'reading',
        error: undefined,
        rawError: undefined,
      }));
      store = { ...store, openId: open.openWhenReady ? open.id : undefined };
      emit();
      pump();
      return Promise.resolve();
    },
    /** Gives up waiting for the read of one Voice Note (the open one without an id). The server is not told, so the Voice Cap charge stands. */
    cancelReading: cancelRead,
    /** Sign-out: forgets every Voice Note, read and recording. */
    clear,
    /** Opens the oldest Voice Note that is ready: its Review, or its answer sheet. Nothing is open already. */
    openReady() {
      if (store.live || isSheet(openNote())) return;
      const next = store.notes.find(isReady);
      if (!next) return;
      store = { ...store, openId: next.id };
      emit();
    },
    /** Drops a failure and its kept recording. */
    dismiss() {
      if (phase() !== 'failed') return;
      removeOpen();
    },
    /** Drops a failure and its kept recording, and says so. */
    discardFailed() {
      if (phase() !== 'failed') return;
      removeOpen();
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
      removeOpen();
    },
    /** Done on the answer sheet: closes it. Nothing was written, so nothing is sent. */
    closeAnswers() {
      if (phase() !== 'answers') return;
      removeOpen();
    },
    /** Closes Review without applying; ignored while Apply is in flight. */
    discard() {
      if (phase() !== 'review') return;
      removeOpen();
    },
  };
}

export type VoiceNote = ReturnType<typeof createVoiceNote>;

/** The app's one Voice Note. */
export const voiceNote = createVoiceNote();

/** Whether the status pill is up (reading or failed) for this phase. */
export const isPillUp = (phase: VoicePhase) =>
  phase === 'reading' || phase === 'failed';

/** Whether the Voice Inbox strip is up: notes being read or ready, with nothing else on screen. */
export const isStripUp = (state: VoiceNoteState) =>
  state.phase === 'idle' && state.inbox.reading + state.inbox.ready > 0;

export const useVoiceNoteState = () =>
  useSyncExternalStore(
    voiceNote.subscribe,
    voiceNote.getState,
    voiceNote.getState,
  );
