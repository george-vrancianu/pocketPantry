import { ApiError, apiRequest } from './api';
import { scanQuery, type ScanMode, type ScanResponse } from './scan';
import {
  dispatchScanSession,
  getScanSession,
  type SessionScan,
} from './scanSession';

/** Where each Scan Mode's photo is sent, and the body field it goes in. Plate keeps its own flow. */
const READ: Partial<Record<ScanMode, { path: string; field: string }>> = {
  product: { path: '/scan/product', field: 'productImage' },
  ingredients: { path: '/scan/ingredients', field: 'ingredientsImage' },
  receipt: { path: '/scan/receipt', field: 'receiptImage' },
};

const inFlight = new Set<string>();

function send(scan: SessionScan, locale: string) {
  const target = READ[scan.mode];
  if (!target) return Promise.reject(new ApiError('unknown', 0));
  return apiRequest<ScanResponse>(
    `${target.path}?${scanQuery(locale, scan.scanLanguage)}`,
    { method: 'POST', body: { [target.field]: scan.image } },
  ).then(({ lines }) => {
    if (lines.length === 0) throw new ApiError('scan.nothing_found', 0);
    return lines;
  });
}

/**
 * Starts the reads the Scan Session has room for and carries on as they finish, so reads go on
 * after the Scan screen is left. A Scan that cannot be read is removed and reported to `onFail`.
 */
export function readScans(locale: string, onFail: (error: unknown) => void) {
  dispatchScanSession({ type: 'start' });
  for (const scan of getScanSession().scans) {
    if (scan.status !== 'reading' || inFlight.has(scan.id)) continue;
    inFlight.add(scan.id);
    send(scan, locale)
      .then((lines) =>
        dispatchScanSession({ type: 'read', id: scan.id, lines }),
      )
      .catch((error: unknown) => {
        dispatchScanSession({ type: 'remove', id: scan.id });
        onFail(error);
      })
      .finally(() => {
        inFlight.delete(scan.id);
        readScans(locale, onFail);
      });
  }
}
