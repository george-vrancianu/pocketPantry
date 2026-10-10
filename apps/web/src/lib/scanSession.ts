import { useSyncExternalStore } from 'react';
import type { ScanLanguage } from '../i18n/resources';
import type { DishGuess } from './plate';
import { MAX_RECEIPT_SECTIONS } from './receiptSections';
import { reviewLinesOf, type ReviewLine } from './review';
import type { ProposedLine, ScanMode } from './scan';

/** How many Scans of a Scan Session are read at once. */
export const MAX_CONCURRENT_READS = 2;

/** Why a read failed: the Scan Cap, or any other error. */
export type ScanFailure = 'error' | 'cap';

/** The most Scans one Scan Session holds. */
export const MAX_SESSION_SCANS = 20;

/** One Scan in the Scan Session, from the double-tap until it is saved or removed. */
export type SessionScan = {
  id: string;
  mode: ScanMode;
  /** What the Scan is read in; Plate has none. */
  scanLanguage?: ScanLanguage;
  /** The prepared photo (a data URL) that is sent for reading. */
  image: string;
  thumbnail: string;
  /** `uncropped`: a gallery receipt waiting for the Member to crop it in Review. */
  status: 'uncropped' | 'queued' | 'reading' | 'read' | 'failed';
  /** The gallery photo an uncropped receipt is cropped from. */
  source?: Blob;
  /** Why a failed Scan failed. */
  failure?: ScanFailure;
  /** The API error code and params of a failed read. */
  errorCode?: string;
  errorParams?: Record<string, unknown>;
  /** The proposed lines, once the Scan is read. */
  lines?: ProposedLine[];
  /** The lines as the Member edited them in the line editor; what Add all saves. */
  edited?: ReviewLine[];
  /** A Plate Scan once read: the dish guesses to pick from, and the token that proves they are ours. */
  dishes?: DishGuess[];
  plateToken?: string;
  /** For a card made by merging receipts: the Scans it was made of, as they were, for Split. */
  sections?: SessionScan[];
};

/** The Scans taken since the camera was opened, in the order the Scans were taken. */
export type SessionState = { scans: SessionScan[] };

export type SessionAction =
  | {
      type: 'enqueue';
      scan: Pick<
        SessionScan,
        'id' | 'mode' | 'scanLanguage' | 'image' | 'thumbnail' | 'source'
      >;
    }
  | { type: 'crop'; id: string; image: string }
  | { type: 'start' }
  | { type: 'read'; id: string; lines: ProposedLine[] }
  | {
      type: 'fail';
      id: string;
      reason: ScanFailure;
      code?: string;
      params?: Record<string, unknown>;
    }
  | { type: 'retry'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'merge'; id: string }
  | { type: 'split'; id: string }
  | { type: 'readDishes'; id: string; dishes: DishGuess[]; token: string }
  | { type: 'pick'; id: string; lines: ProposedLine[] }
  | { type: 'reread'; id: string }
  | { type: 'edit'; id: string; lines: ReviewLine[] };

const update = (
  state: SessionState,
  id: string,
  change: Partial<SessionScan>,
): SessionState => ({
  scans: state.scans.map((scan) =>
    scan.id === id ? { ...scan, ...change } : scan,
  ),
});

/** A Scan ready to be read, or failed with the Scan Cap when it is already reached. */
const waiting = (state: SessionState) =>
  capReached(state)
    ? ({ status: 'failed', failure: 'cap' } as const)
    : ({ status: 'queued' } as const);

export const emptySession: SessionState = { scans: [] };

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case 'enqueue':
      return {
        scans: [
          ...state.scans,
          {
            ...action.scan,
            ...(action.scan.source ? { status: 'uncropped' } : waiting(state)),
          },
        ],
      };
    case 'crop':
      return {
        scans: state.scans.map((scan) =>
          scan.id === action.id
            ? {
                ...scan,
                image: action.image,
                ...waiting(state),
                source: undefined,
              }
            : scan,
        ),
      };
    case 'start': {
      // Promote the oldest waiting Scans into the free read slots.
      let free =
        MAX_CONCURRENT_READS -
        state.scans.filter((scan) => scan.status === 'reading').length;
      if (free <= 0) return state;
      return {
        scans: state.scans.map((scan) =>
          scan.status === 'queued' && free-- > 0
            ? { ...scan, status: 'reading' }
            : scan,
        ),
      };
    }
    case 'read':
      return {
        scans: state.scans.map((scan) =>
          scan.id === action.id
            ? { ...scan, status: 'read', lines: action.lines }
            : scan,
        ),
      };
    case 'fail':
      return {
        scans: state.scans.map((scan) =>
          scan.id === action.id
            ? {
                ...scan,
                status: 'failed',
                failure: action.reason,
                errorCode: action.code,
                errorParams: action.params,
              }
            : // Past the Scan Cap every waiting read would fail too: hold them with the cap.
              action.reason === 'cap' && scan.status === 'queued'
              ? { ...scan, status: 'failed', failure: 'cap' }
              : scan,
        ),
      };
    case 'retry': {
      const target = state.scans.find((scan) => scan.id === action.id);
      // Retrying a Scan held by the cap releases every Scan the cap held.
      const retried = (scan: SessionScan) =>
        scan.status === 'failed' &&
        (scan.id === action.id ||
          (target?.failure === 'cap' && scan.failure === 'cap'));
      // A cap failure elsewhere keeps a retried Scan held too.
      const held = target?.failure !== 'cap' && capReached(state);
      return {
        scans: state.scans.map((scan) =>
          retried(scan)
            ? {
                ...scan,
                ...(held
                  ? { status: 'failed', failure: 'cap' }
                  : { status: 'queued', failure: undefined }),
                errorCode: undefined,
                errorParams: undefined,
              }
            : scan,
        ),
      };
    }
    case 'remove':
      return { scans: state.scans.filter((scan) => scan.id !== action.id) };
    case 'readDishes':
      return update(state, action.id, {
        status: 'read',
        dishes: action.dishes,
        plateToken: action.token,
      });
    case 'pick':
      return update(state, action.id, {
        lines: action.lines,
        edited: undefined,
        dishes: undefined,
        plateToken: undefined,
      });
    case 'reread':
      return update(state, action.id, {
        status: 'queued',
        dishes: undefined,
        plateToken: undefined,
      });
    case 'edit':
      return update(state, action.id, { edited: action.lines });
    case 'merge': {
      if (!canMerge(state, action.id)) return state;
      const index = state.scans.findIndex((scan) => scan.id === action.id);
      const above = state.scans[index - 1];
      const sections = [
        ...sectionsOf(above),
        ...sectionsOf(state.scans[index]),
      ];
      const lines = sections.flatMap((scan) => scan.lines ?? []);
      // Edits made before the merge come along; the editor's lines win over `sections` in reviewLinesOf.
      const below = state.scans[index];
      const edited =
        above.edited || below.edited
          ? [...reviewLinesOf(above), ...reviewLinesOf(below)]
          : undefined;
      return {
        scans: state.scans.flatMap((scan, i) =>
          i === index
            ? []
            : i === index - 1
              ? [{ ...above, lines, sections, edited }]
              : [scan],
        ),
      };
    }
    case 'split': {
      const card = state.scans.find((scan) => scan.id === action.id);
      if (
        !card?.sections ||
        state.scans.length - 1 + card.sections.length > MAX_SESSION_SCANS
      )
        return state;
      return {
        scans: state.scans.flatMap((scan) =>
          scan.id === action.id && scan.sections ? scan.sections : [scan],
        ),
      };
    }
  }
}

/** Errors a retry cannot fix: the same photo would fail the same way. */
const FINAL_ERRORS = [
  'scan.too_many_items',
  'scan.image_too_large',
  'scan.image_invalid',
  'scan.nothing_found',
];

/** Whether tapping a failed Scan to read it again can change anything. */
export const canRetry = (scan: SessionScan) =>
  !FINAL_ERRORS.includes(scan.errorCode ?? '');

const sectionsOf = (scan: SessionScan) => scan.sections ?? [scan];

/** Whether the receipt Scan `id` may join the receipt Scan above it: both read, within the section limit. */
export function canMerge(state: SessionState, id: string): boolean {
  const index = state.scans.findIndex((scan) => scan.id === id);
  if (index < 1) return false;
  const [above, scan] = [state.scans[index - 1], state.scans[index]];
  return (
    [above, scan].every((s) => s.mode === 'receipt' && s.status === 'read') &&
    sectionsOf(above).length + sectionsOf(scan).length <= MAX_RECEIPT_SECTIONS
  );
}

/** How a Scan shows: waiting for a crop, being read (or waiting for a read slot), failed, or read. */
export type ScanDisplayState = 'uncropped' | 'reading' | 'failed' | 'read';

export const scanDisplayState = (scan: SessionScan): ScanDisplayState =>
  scan.status === 'queued' ? 'reading' : scan.status;

/** Scans not read yet and not failed: waiting for a crop, for a read slot, or being read. */
export const pendingCount = (state: SessionState) =>
  state.scans.filter(
    (scan) => scan.status !== 'read' && scan.status !== 'failed',
  ).length;

/** Gallery receipts waiting for the Member to crop them. */
export const uncroppedCount = (state: SessionState) =>
  state.scans.filter((scan) => scan.status === 'uncropped').length;

/** Whether a Scan hit the Scan Cap; no more Scans can be taken until it is retried or removed. */
export const capReached = (state: SessionState) =>
  state.scans.some((scan) => scan.failure === 'cap');

let session = emptySession;
const listeners = new Set<() => void>();

function setSession(next: SessionState) {
  if (next === session) return;
  // A gallery receipt's thumbnail is an object URL: free it when the Scan goes or is cropped.
  // A merged card keeps its sections' thumbnails for Split.
  const thumbnailsOf = (scans: SessionScan[]): string[] =>
    scans.flatMap((scan) => [
      scan.thumbnail,
      ...thumbnailsOf(scan.sections ?? []),
    ]);
  const kept = new Set(thumbnailsOf(next.scans));
  thumbnailsOf(session.scans).forEach((thumbnail) => {
    if (thumbnail.startsWith('blob:') && !kept.has(thumbnail))
      URL.revokeObjectURL(thumbnail);
  });
  session = next;
  listeners.forEach((listener) => listener());
}

export const getScanSession = () => session;
export const dispatchScanSession = (action: SessionAction) =>
  setSession(sessionReducer(session, action));
export const resetScanSession = () => setSession(emptySession);

/** The Scan Session, re-rendering when it changes. It outlives the screens that show it. */
export function useScanSession(): SessionState {
  return useSyncExternalStore((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, getScanSession);
}
