import { useSyncExternalStore } from 'react';
import type { ScanLanguage } from '../i18n/resources';
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
  status: 'queued' | 'reading' | 'read' | 'failed';
  failure?: 'error' | 'cap';
  errorCode?: string;
  errorParams?: Record<string, unknown>;
  /** The proposed lines, once the Scan is read. */
  lines?: ProposedLine[];
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
  | {
      type: 'fail';
      id: string;
      reason: 'error' | 'cap';
      code?: string;
      params?: Record<string, unknown>;
    }
  | { type: 'retry'; id: string }
  | { type: 'remove'; id: string };

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
    case 'fail':
      return {
        scans: state.scans.map((scan) =>
          scan.id === action.id
            ? { ...scan, status: 'failed', failure: action.reason }
            : scan,
        ),
      };
    case 'retry':
      return {
        scans: state.scans.map((scan) =>
          scan.id === action.id && scan.status === 'failed'
            ? { ...scan, status: 'queued', failure: undefined }
            : scan,
        ),
      };
    case 'remove':
      return { scans: state.scans.filter((scan) => scan.id !== action.id) };
    default:
      return state;
  }
}

/** Scans still waiting or being read. */
export const pendingCount = (state: SessionState) =>
  state.scans.filter(
    (scan) => scan.status === 'queued' || scan.status === 'reading',
  ).length;

/** Whether a Scan hit the Scan Cap; no more Scans can be taken until it is retried or removed. */
export const capReached = (state: SessionState) =>
  state.scans.some((scan) => scan.failure === 'cap');

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
