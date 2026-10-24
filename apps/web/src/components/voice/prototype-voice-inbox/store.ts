// PROTOTYPE, throwaway: a fake Voice Inbox for judging the indicator above the Dock.
// Nothing here talks to the API; notes "read" on a timer and carry canned results.
import { useSyncExternalStore } from 'react';
import type { VoiceDefaultTarget } from '../../../lib/voice';

export type FakeState = 'reading' | 'waiting' | 'ready' | 'answers' | 'failed';

export type FakeNote = {
  id: number;
  state: FakeState;
  defaultTarget: VoiceDefaultTarget;
  language: string;
  durationS: number;
  transcript: string;
  actions: Array<{
    list: 'Shopping List' | 'Pantry' | 'Pick a list';
    text: string;
  }>;
  answers: string[];
  failure?: string;
};

export type Outcome = 'ready' | 'answers' | 'failed';

const CANNED: Array<
  Omit<FakeNote, 'id' | 'state' | 'defaultTarget' | 'language'>
> = [
  {
    durationS: 9,
    transcript:
      'put two yogurts in the fridge, they expire Friday, and we are out of eggs',
    actions: [
      { list: 'Pantry', text: 'Add 2 Yogurt, Fridge, expires Fri' },
      { list: 'Pantry', text: 'Remove all Eggs' },
    ],
    answers: [],
  },
  {
    durationS: 6,
    transcript: 'need flour and olive oil, rice is running low',
    actions: [
      { list: 'Shopping List', text: 'Add Flour' },
      { list: 'Shopping List', text: 'Add Olive oil' },
      { list: 'Pantry', text: 'Rice is Running low' },
    ],
    answers: [],
  },
  {
    durationS: 4,
    transcript: 'add tomatoes',
    actions: [{ list: 'Pick a list', text: 'Add Tomatoes' }],
    answers: [],
  },
  {
    durationS: 12,
    transcript: 'took the last of the parmesan, one onion used, and buy garlic',
    actions: [
      { list: 'Pantry', text: 'Remove Parmesan (all)' },
      { list: 'Pantry', text: 'Remove 1 Onion' },
      { list: 'Shopping List', text: 'Add Garlic' },
    ],
    answers: [],
  },
];
const QUESTION = {
  durationS: 3,
  transcript: 'do we have butter and milk?',
  actions: [],
  answers: ['Butter: yes, 250 g, Fridge', 'Milk: no, on the Shopping List'],
};

/** At most this many reads at a time (ADR 0004's number). */
const PARALLEL = 2;
export const INBOX_LIMIT = 5;

let notes: FakeNote[] = [];
let nextId = 1;
let opened = null as number[] | null;
let readMs = 4000;
const outcomes = new Map<number, Outcome>();
const listeners = new Set<() => void>();
let snapshot = { notes, opened, readMs };
const emit = () => {
  snapshot = { notes, opened, readMs };
  for (const l of listeners) l();
};

const set = (id: number, patch: Partial<FakeNote>) => {
  notes = notes.map((n) => (n.id === id ? { ...n, ...patch } : n));
};

function pump() {
  const reading = notes.filter((n) => n.state === 'reading').length;
  const waiting = notes.filter((n) => n.state === 'waiting');
  for (const note of waiting.slice(0, Math.max(0, PARALLEL - reading))) {
    set(note.id, { state: 'reading' });
    setTimeout(() => settle(note.id), readMs + Math.random() * 1500);
  }
  emit();
}

function settle(id: number) {
  const note = notes.find((n) => n.id === id);
  if (!note || note.state !== 'reading') return;
  const outcome = outcomes.get(id) ?? 'ready';
  if (outcome === 'failed') {
    set(id, { state: 'failed', failure: 'No signal. The recording is kept.' });
  } else {
    set(id, { state: outcome });
    navigator.vibrate?.(30);
  }
  pump();
}

export const inbox = {
  record(defaultTarget: VoiceDefaultTarget, outcome: Outcome = 'ready') {
    if (notes.length >= INBOX_LIMIT) return false;
    const id = nextId++;
    const canned =
      outcome === 'answers' ? QUESTION : CANNED[(id - 1) % CANNED.length];
    outcomes.set(id, outcome);
    notes = [
      ...notes,
      { ...canned, id, state: 'waiting', defaultTarget, language: 'English' },
    ];
    pump();
    return true;
  },
  retry(id: number) {
    outcomes.set(id, 'ready');
    set(id, { state: 'waiting', failure: undefined });
    pump();
  },
  discard(id: number) {
    notes = notes.filter((n) => n.id !== id);
    emit();
  },
  open(ids: number[]) {
    opened = ids;
    emit();
  },
  close() {
    opened = null;
    emit();
  },
  /** Apply or discard what is open: the notes leave the Voice Inbox together. */
  finish() {
    const done = new Set(opened ?? []);
    notes = notes.filter((n) => !done.has(n.id));
    opened = null;
    emit();
  },
  reset() {
    notes = [];
    opened = null;
    emit();
  },
  setReadMs(ms: number) {
    readMs = ms;
    emit();
  },
};

export const isOpenable = (n: FakeNote) =>
  n.state === 'ready' || n.state === 'answers';
/** Only notes with Voice Actions merge; an answers-only note opens its sheet on its own. */
export const isMergeable = (n: FakeNote) => n.state === 'ready';

export function useInbox() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snapshot,
  );
}

export function counts(list: FakeNote[]) {
  return {
    reading: list.filter((n) => n.state === 'reading' || n.state === 'waiting')
      .length,
    ready: list.filter(isOpenable).length,
    failed: list.filter((n) => n.state === 'failed').length,
  };
}

/** The indicator's one-line summary, e.g. "Reading 2 · 1 ready". */
export function summary(list: FakeNote[]) {
  const c = counts(list);
  return [
    c.reading ? `Reading ${c.reading}` : null,
    c.ready ? `${c.ready} ready` : null,
    c.failed ? `${c.failed} failed` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** What tapping the indicator does: exactly one ready note opens straight away (Q14), else the inbox list. */
export function tapTarget(list: FakeNote[]): number[] | 'list' {
  const openable = list.filter(isOpenable);
  if (openable.length === 1) return [openable[0].id];
  return 'list';
}

export const listName = (t: VoiceDefaultTarget) =>
  t === 'shopping' ? 'Shopping List' : t === 'pantry' ? 'Pantry' : 'No list';
