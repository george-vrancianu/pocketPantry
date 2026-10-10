import { useSyncExternalStore } from 'react';
import { ApiError, apiRequest } from './api';
import { scanQuery, type ScanMode, type ScanResponse } from './scan';
import {
  MAX_CONCURRENT_READS,
  dispatchScanSession,
  getScanSession,
  type SessionScan,
} from './scanSession';

/** Where each Scan Mode's photo is sent, and the body field it goes in. Plate keeps its own flow. */
const READ: Record<
  Exclude<ScanMode, 'plate'>,
  { path: string; field: string }
> = {
  product: { path: '/scan/product', field: 'productImage' },
  ingredients: { path: '/scan/ingredients', field: 'ingredientsImage' },
  receipt: { path: '/scan/receipt', field: 'receiptImage' },
};

const inFlight = new Set<string>();

function send(scan: SessionScan, locale: string) {
  const target = READ[scan.mode as keyof typeof READ];
  return apiRequest<ScanResponse>(
    `${target.path}?${scanQuery(locale, scan.scanLanguage)}`,
    { method: 'POST', body: { [target.field]: scan.image } },
  ).then(({ lines }) => {
    if (lines.length === 0) throw new ApiError('scan.nothing_found', 0);
    return lines;
  });
}

let failure: unknown = null;
const failureListeners = new Set<() => void>();

function setFailure(next: unknown) {
  failure = next;
  failureListeners.forEach((listener) => listener());
}

/** Forgets the requests in flight and the last failure; for tests, which abandon them. */
export function resetReads() {
  inFlight.clear();
  setFailure(null);
}

/** Forgets the last failed read, e.g. when the Member scans again. */
export const clearReadFailure = () => setFailure(null);

/** The last read that failed, until it is cleared. It outlives the Scan screen that was open. */
export function useReadFailure(): unknown {
  return useSyncExternalStore(
    (listener) => {
      failureListeners.add(listener);
      return () => failureListeners.delete(listener);
    },
    () => failure,
  );
}

/**
 * Starts the reads the Scan Session has room for and carries on as they finish, so reads go on
 * after the Scan screen is left. A Scan that cannot be read is removed and its reason kept for
 * `useReadFailure`. The slots are counted by requests still out, not by the Scans' status, so
 * removing a reading Scan does not let a third request start.
 */
export function readScans(locale: string) {
  if (inFlight.size >= MAX_CONCURRENT_READS) return;
  dispatchScanSession({ type: 'start' });
  for (const scan of getScanSession().scans) {
    if (inFlight.size >= MAX_CONCURRENT_READS) return;
    if (scan.status !== 'reading' || inFlight.has(scan.id)) continue;
    inFlight.add(scan.id);
    send(scan, locale)
      .then((lines) =>
        dispatchScanSession({ type: 'read', id: scan.id, lines }),
      )
      .catch((error: unknown) => {
        // A Scan the Member discarded meanwhile has no one to tell.
        if (!getScanSession().scans.some((s) => s.id === scan.id)) return;
        dispatchScanSession({ type: 'remove', id: scan.id });
        setFailure(error);
      })
      .finally(() => {
        inFlight.delete(scan.id);
        readScans(locale);
      });
  }
}
