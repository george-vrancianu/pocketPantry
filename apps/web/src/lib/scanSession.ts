import { useSyncExternalStore } from 'react';
import type { ScanLanguage } from '../i18n/resources';
import { MAX_RECEIPT_SECTIONS, mergeReceiptSections } from './receiptSections';
import type { ProposedLine, ScanMode } from './scan';

/** How many Scans of a Scan Session are read at once. */
export const MAX_CONCURRENT_READS = 2;

/** One Scan in the Scan Session, from the double-tap until it is saved or removed. */
export type SessionScan = {
  id: string;
  mode: ScanMode;
  /** What the Scan is read in; Plate has none. */
  scanLanguage?: ScanLanguage;
  /** The prepared photo (a data URL) that is sent for reading. */
  image: string;
  thumbnail: string;
  status: 'queued' | 'reading' | 'read';
  /** The proposed lines, once the Scan is read. */
  lines?: ProposedLine[];
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
        'id' | 'mode' | 'scanLanguage' | 'image' | 'thumbnail'
      >;
    }
  | { type: 'start' }
  | { type: 'read'; id: string; lines: ProposedLine[] }
  | { type: 'remove'; id: string }
  | { type: 'merge'; id: string }
  | { type: 'split'; id: string };

export const emptySession: SessionState = { scans: [] };

export function sessionReducer(
  state: SessionState,
  action: SessionAction,
): SessionState {
  switch (action.type) {
    case 'enqueue':
      return {
        scans: [...state.scans, { ...action.scan, status: 'queued' }],
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
    case 'remove':
      return { scans: state.scans.filter((scan) => scan.id !== action.id) };
    case 'merge': {
      if (!canMerge(state, action.id)) return state;
      const index = state.scans.findIndex((scan) => scan.id === action.id);
      const above = state.scans[index - 1];
      const sections = [
        ...sectionsOf(above),
        ...sectionsOf(state.scans[index]),
      ];
      const { lines } = mergeReceiptSections(
        sections.map((scan) => ({ lines: scan.lines ?? [] })),
      );
      return {
        scans: state.scans.flatMap((scan, i) =>
          i === index
            ? []
            : i === index - 1
              ? [{ ...above, lines, sections }]
              : [scan],
        ),
      };
    }
    case 'split':
      if (!state.scans.some((scan) => scan.id === action.id && scan.sections))
        return state;
      return {
        scans: state.scans.flatMap((scan) =>
          scan.id === action.id && scan.sections ? scan.sections : [scan],
        ),
      };
  }
}

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

/** Scans still waiting or being read. */
export const pendingCount = (state: SessionState) =>
  state.scans.filter((scan) => scan.status !== 'read').length;

let session = emptySession;
const listeners = new Set<() => void>();

function setSession(next: SessionState) {
  if (next === session) return;
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
