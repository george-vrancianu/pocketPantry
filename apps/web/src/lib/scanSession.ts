import type { ScanLanguage } from '../i18n/resources';
import type { ProposedLine, ScanMode } from './scan';

// Stub: the implementation follows the tests in scanSession.test.ts.
export const MAX_CONCURRENT_READS = 2;

export type SessionScan = {
  id: string;
  mode: ScanMode;
  scanLanguage?: ScanLanguage;
  image: string;
  thumbnail: string;
  status: 'queued' | 'reading' | 'read';
  lines?: ProposedLine[];
};

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
  | { type: 'remove'; id: string };

export const emptySession: SessionState = { scans: [] };

export function sessionReducer(
  state: SessionState,
  _action: SessionAction,
): SessionState {
  return state;
}

export const pendingCount = (_state: SessionState) => 0;

export const dispatchScanSession = (_action: SessionAction) => {};
export const resetScanSession = () => {};
