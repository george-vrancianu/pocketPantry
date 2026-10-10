import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSaveScan } from './saveScan';
import type { ProposedLine } from './scan';
import type { SessionScan } from './scanSession';
import { stubApi } from '../test/render';

const line = (
  name: string,
  extra: Partial<ProposedLine> = {},
): ProposedLine => ({
  name,
  match: {
    id: `${name}-id`,
    name,
    defaultUnit: 'pcs',
    leafCategory: { id: 'l', name: 'Leaf' },
    parentCategory: { id: 'p', name: 'Parent', aisle: 'Aisle' },
    defaults: { expiryDays: 7, location: 'fridge' },
  },
  lowConfidence: false,
  quantity: 1,
  unit: 'pcs',
  expiryDate: null,
  sourceText: null,
  productDescription: null,
  ...extra,
});

const scanOf = (
  mode: SessionScan['mode'],
  lines: ProposedLine[],
  scanLanguage: SessionScan['scanLanguage'] = 'en',
): SessionScan => ({
  id: 'a',
  mode,
  scanLanguage,
  image: 'x',
  thumbnail: 'x',
  status: 'read',
  lines,
});

function setup() {
  const stub = stubApi({
    'POST /api/pantry/batches/bulk': () => Response.json({ batches: [] }),
    'POST /api/scan/receipt/confirm': () =>
      Response.json({ batches: [], matchedShoppingItemIds: [] }),
    'POST /api/shopping-list/items/bulk': () => Response.json({ items: [] }),
  });
  vi.stubGlobal('fetch', stub.fetchMock);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
  const { result } = renderHook(() => useSaveScan('en'), { wrapper });
  return { save: result.current, calls: stub.calls };
}

afterEach(() => vi.unstubAllGlobals());

describe('useSaveScan', () => {
  it('saves Product and Ingredients through the bulk Batch endpoint', async () => {
    const { save, calls } = setup();
    await save(scanOf('product', [line('Milk')]));
    await save(scanOf('ingredients', [line('Rice')]));
    expect(calls.map((c) => c.key)).toEqual([
      'POST /api/pantry/batches/bulk',
      'POST /api/pantry/batches/bulk',
    ]);
  });

  it('saves a Receipt through Receipt confirm', async () => {
    const { save, calls } = setup();
    await save(scanOf('receipt', [line('Eggs')]));
    expect(calls[0].key).toBe('POST /api/scan/receipt/confirm');
  });

  it('saves a Plate Scan to the Shopping List', async () => {
    const { save, calls } = setup();
    await save(scanOf('plate', [line('Pasta')]));
    expect(calls[0].key).toBe('POST /api/shopping-list/items/bulk');
  });

  it('sends the Scan own Scan Language', async () => {
    const { save, calls } = setup();
    await save(scanOf('product', [line('Milk')], 'da'));
    expect(new URLSearchParams(calls[0].search).get('scanLanguage')).toBe('da');
  });

  it('leaves out lines the Scan excluded', async () => {
    const { save, calls } = setup();
    await save(
      scanOf('receipt', [
        line('Eggs'),
        line('Bag', { excluded: { reason: 'not_food' } }),
      ]),
    );
    expect((calls[0].body as { batches: unknown[] }).batches).toHaveLength(1);
  });

  it('rejects when the save fails', async () => {
    const { save } = setup();
    vi.stubGlobal('fetch', () =>
      Promise.resolve(
        Response.json({ code: 'boom', params: {} }, { status: 500 }),
      ),
    );
    await expect(save(scanOf('product', [line('Milk')]))).rejects.toMatchObject(
      {
        code: 'boom',
      },
    );
  });
});
