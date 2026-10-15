import { ApiError, apiRequest } from './api';
import { barcodeCardLine, lookupBarcode } from './barcode';
import type { PlateDishes } from './plate';
import { scanQuery, type ScanMode, type ScanResponse } from './scan';
import {
  MAX_CONCURRENT_READS,
  capReached,
  dispatchScanSession,
  getScanSession,
  isBarcodeCard,
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
/** Barcode Lookups under way: free and instant, so they take no read slot. */
const lookups = new Set<string>();

/** A dropped connection gets one more try; any other error is the answer. */
const withNetworkRetry = <T>(request: () => Promise<T>) =>
  request().catch((error: unknown) =>
    error instanceof ApiError && error.code === 'network_error'
      ? request()
      : Promise.reject(error),
  );

/** A Plate Scan has no Scan Language; its photo yields dish guesses to pick from. */
function readPlate(scan: SessionScan, locale: string) {
  return withNetworkRetry(() =>
    apiRequest<PlateDishes>(`/scan/plate?${scanQuery(locale)}`, {
      method: 'POST',
      body: { plateImage: scan.image },
    }),
  ).then(({ dishes, token }) =>
    dispatchScanSession({ type: 'readDishes', id: scan.id, dishes, token }),
  );
}

async function send(
  scan: SessionScan,
  mode: keyof typeof READ,
  locale: string,
) {
  const target = READ[mode];
  const { lines } = await withNetworkRetry(() =>
    apiRequest<ScanResponse>(
      `${target.path}?${scanQuery(locale, scan.scanLanguage)}`,
      { method: 'POST', body: { [target.field]: scan.image } },
    ),
  );
  if (lines.length === 0) throw new ApiError('scan.nothing_found', 0);
  return lines;
}

/** Forgets the requests in flight; for tests, which abandon them. */
export function resetReads() {
  inFlight.clear();
  lookups.clear();
}

/** Starts the Barcode Lookup of every Barcode card waiting for one, outside the read slots and the Scan Cap. */
function startLookups(locale: string) {
  for (const scan of getScanSession().scans) {
    if (
      !isBarcodeCard(scan) ||
      scan.status !== 'reading' ||
      lookups.has(scan.id) ||
      !scan.code
    )
      continue;
    const code = scan.code;
    lookups.add(scan.id);
    lookupBarcode(code, locale)
      .then((lookup) =>
        dispatchScanSession({
          type: 'read',
          id: scan.id,
          lines: [barcodeCardLine(code, lookup)],
        }),
      )
      .catch((error: unknown) => {
        const api = error instanceof ApiError ? error : null;
        dispatchScanSession({
          type: 'fail',
          id: scan.id,
          reason: 'error',
          code: api?.code,
          params: api?.params,
        });
      })
      .finally(() => lookups.delete(scan.id));
  }
}

/**
 * Starts the reads the Scan Session has room for and carries on as they finish, so reads go on
 * after the Scan screen is left. A Scan that cannot be read stays in the Scan Session as failed, with the
 * Scan Cap as its own reason. The slots are counted by requests still out, not by the Scans'
 * status, so removing a reading Scan does not let a third request start.
 */
export function readScans(locale: string) {
  startLookups(locale);
  // Past the Scan Cap every read would fail; the rest wait until the capped Scan is retried or removed.
  if (inFlight.size >= MAX_CONCURRENT_READS || capReached(getScanSession()))
    return;
  dispatchScanSession({ type: 'start' });
  for (const scan of getScanSession().scans) {
    if (inFlight.size >= MAX_CONCURRENT_READS) return;
    if (
      scan.status !== 'reading' ||
      inFlight.has(scan.id) ||
      scan.mode === 'barcode'
    )
      continue;
    inFlight.add(scan.id);
    (scan.mode === 'plate'
      ? readPlate(scan, locale)
      : send(scan, scan.mode, locale).then((lines) =>
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
