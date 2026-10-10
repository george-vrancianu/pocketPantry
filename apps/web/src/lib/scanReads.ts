import { ApiError, apiRequest } from './api';
import type { PlateDishes } from './plate';
import { scanQuery, type ScanMode, type ScanResponse } from './scan';
import {
  MAX_CONCURRENT_READS,
  capReached,
  dispatchScanSession,
  getScanSession,
  type SessionScan,
} from './scanSession';

/** Where each Scan Mode's photo is sent, and the body field it goes in. Plate is read apart: it yields dish guesses, not lines. */
const READ: Record<
  Exclude<ScanMode, 'plate'>,
  { path: string; field: string }
> = {
  product: { path: '/scan/product', field: 'productImage' },
  ingredients: { path: '/scan/ingredients', field: 'ingredientsImage' },
  receipt: { path: '/scan/receipt', field: 'receiptImage' },
};

const inFlight = new Set<string>();

/** A Plate Scan has no Scan Language; its photo yields dish guesses to pick from. */
function readPlate(scan: SessionScan, locale: string) {
  return apiRequest<PlateDishes>(`/scan/plate?${scanQuery(locale)}`, {
    method: 'POST',
    body: { plateImage: scan.image },
  }).then(({ dishes, token }) =>
    dispatchScanSession({ type: 'readDishes', id: scan.id, dishes, token }),
  );
}

async function send(scan: SessionScan, locale: string) {
  const target = READ[scan.mode as keyof typeof READ];
  const request = () =>
    apiRequest<ScanResponse>(
      `${target.path}?${scanQuery(locale, scan.scanLanguage)}`,
      { method: 'POST', body: { [target.field]: scan.image } },
    );
  // A dropped connection gets one more try; any other error is the answer.
  const { lines } = await request().catch((error: unknown) =>
    error instanceof ApiError && error.code === 'network_error'
      ? request()
      : Promise.reject(error),
  );
  if (lines.length === 0) throw new ApiError('scan.nothing_found', 0);
  return lines;
}

/** Forgets the requests in flight; for tests, which abandon them. */
export function resetReads() {
  inFlight.clear();
}

/**
 * Starts the reads the Scan Session has room for and carries on as they finish, so reads go on
 * after the Scan screen is left. A Scan that cannot be read stays in the Scan Session as failed, with the
 * Scan Cap as its own reason. The slots are counted by requests still out, not by the Scans'
 * status, so removing a reading Scan does not let a third request start.
 */
export function readScans(locale: string) {
  // Past the Scan Cap every read would fail; the rest wait until the capped Scan is retried or removed.
  if (inFlight.size >= MAX_CONCURRENT_READS || capReached(getScanSession()))
    return;
  dispatchScanSession({ type: 'start' });
  for (const scan of getScanSession().scans) {
    if (inFlight.size >= MAX_CONCURRENT_READS) return;
    if (scan.status !== 'reading' || inFlight.has(scan.id)) continue;
    inFlight.add(scan.id);
    (scan.mode === 'plate'
      ? readPlate(scan, locale)
      : send(scan, locale).then((lines) =>
          dispatchScanSession({ type: 'read', id: scan.id, lines }),
        )
    )
      .catch((error: unknown) => {
        const api = error instanceof ApiError ? error : null;
        dispatchScanSession({
          type: 'fail',
          id: scan.id,
          reason: api?.code === 'scan.cap_reached' ? 'cap' : 'error',
          code: api?.code,
          params: api?.params,
        });
      })
      .finally(() => {
        inFlight.delete(scan.id);
        readScans(locale);
      });
  }
}
