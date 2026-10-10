import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetReads, readScans } from './scanReads';
import {
  dispatchScanSession,
  getScanSession,
  resetScanSession,
  type SessionScan,
} from './scanSession';

const lines = [
  {
    name: 'Milk',
    match: null,
    lowConfidence: false,
    quantity: null,
    unit: null,
    expiryDate: null,
    sourceText: null,
    productDescription: null,
  },
];

const enqueue = (
  id: string,
  mode: SessionScan['mode'] = 'product',
  scanLanguage: SessionScan['scanLanguage'] = 'en',
) =>
  dispatchScanSession({
    type: 'enqueue',
    scan: { id, mode, scanLanguage, image: `image-${id}`, thumbnail: 'thumb' },
  });
const scan = (id: string) => getScanSession().scans.find((s) => s.id === id)!;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

type Call = { path: string; search: string; body: Record<string, unknown> };
let calls: Call[];
let answer: (call: Call, n: number) => Promise<Response> | Response;

beforeEach(() => {
  resetScanSession();
  resetReads();
  calls = [];
  answer = () => Response.json({ lines });
  vi.stubGlobal('fetch', (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), window.location.origin);
    const call = {
      path: url.pathname,
      search: url.search,
      body: JSON.parse(String(init?.body)),
    };
    calls.push(call);
    return Promise.resolve(answer(call, calls.length));
  });
});
afterEach(() => vi.unstubAllGlobals());

const error = (code: string, status: number) =>
  Response.json({ code, params: {} }, { status });

describe('readScans', () => {
  it('reads at most 2 Scans at once and starts the next as one finishes', async () => {
    const releases: Array<() => void> = [];
    answer = () =>
      new Promise<Response>((resolve) =>
        releases.push(() => resolve(Response.json({ lines }))),
      );
    ['a', 'b', 'c'].forEach((id) => enqueue(id));
    readScans('en');
    await settle();
    expect(calls).toHaveLength(2);
    expect(scan('c').status).toBe('queued');
    releases[0]();
    await settle();
    expect(calls).toHaveLength(3);
    expect(scan('a').status).toBe('read');
    expect(scan('a').lines).toEqual(lines);
  });

  it('sends each Scan to its mode endpoint, in its own Scan Language', async () => {
    enqueue('a', 'product', 'ro');
    enqueue('b', 'receipt', 'da');
    readScans('en');
    await settle();
    expect(calls[0]).toMatchObject({
      path: '/api/scan/product',
      body: { productImage: 'image-a' },
    });
    expect(new URLSearchParams(calls[0].search).get('scanLanguage')).toBe('ro');
    expect(calls[1]).toMatchObject({
      path: '/api/scan/receipt',
      body: { receiptImage: 'image-b' },
    });
    expect(new URLSearchParams(calls[1].search).get('scanLanguage')).toBe('da');
  });

  it('tries once more after a network error', async () => {
    answer = (_call, n) =>
      n === 1
        ? Promise.reject(new TypeError('offline'))
        : Response.json({ lines });
    enqueue('a');
    readScans('en');
    await settle();
    expect(calls).toHaveLength(2);
    expect(scan('a').status).toBe('read');
  });

  it('fails the Scan when the retry fails too', async () => {
    answer = () => Promise.reject(new TypeError('offline'));
    enqueue('a');
    readScans('en');
    await settle();
    expect(calls).toHaveLength(2);
    expect(scan('a')).toMatchObject({
      status: 'failed',
      failure: 'error',
      errorCode: 'network_error',
    });
  });

  it('does not retry a 4xx answer', async () => {
    answer = () => error('scan.image_invalid', 400);
    enqueue('a');
    readScans('en');
    await settle();
    expect(calls).toHaveLength(1);
    expect(scan('a')).toMatchObject({
      status: 'failed',
      errorCode: 'scan.image_invalid',
    });
  });

  it('fails a read that finds nothing as scan.nothing_found', async () => {
    answer = () => Response.json({ lines: [] });
    enqueue('a');
    readScans('en');
    await settle();
    expect(scan('a')).toMatchObject({
      status: 'failed',
      errorCode: 'scan.nothing_found',
    });
  });

  it('stops starting reads once a Scan hits the Scan Cap', async () => {
    answer = () => error('scan.cap_reached', 429);
    ['a', 'b', 'c', 'd'].forEach((id) => enqueue(id));
    readScans('en');
    await settle();
    expect(calls).toHaveLength(2);
    expect(scan('a').failure).toBe('cap');
    expect(scan('c').status).not.toBe('reading');
  });

  it('reads a Plate Scan into dish guesses with its token', async () => {
    answer = () =>
      Response.json({
        dishes: [{ title: 'Pasta', confidence: 0.9 }],
        token: 't',
      });
    enqueue('a', 'plate', undefined);
    readScans('en');
    await settle();
    expect(calls[0]).toMatchObject({
      path: '/api/scan/plate',
      body: { plateImage: 'image-a' },
    });
    expect(scan('a')).toMatchObject({ status: 'read', plateToken: 't' });
  });

  it('tries a Plate read once more after a network error (epic review #8)', async () => {
    answer = (_call, n) =>
      n === 1
        ? Promise.reject(new TypeError('offline'))
        : Response.json({
            dishes: [{ title: 'Pasta', confidence: 0.9 }],
            token: 't',
          });
    enqueue('a', 'plate', undefined);
    readScans('en');
    await settle();
    expect(calls).toHaveLength(2);
    expect(scan('a').status).toBe('read');
  });
});
