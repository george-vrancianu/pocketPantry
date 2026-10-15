import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useStapleMutations, type Staple } from './staples';
import { suggestionsQueryKey } from './queryKeys';
import { stubApi } from '../test/render';

const milk: Staple = {
  id: 'staple-milk',
  ingredientId: 'milk-id',
  name: 'Milk',
  quantity: null,
  unit: null,
  aisle: null,
};
const eggs: Staple = {
  id: 'staple-eggs',
  ingredientId: 'eggs-id',
  name: 'Eggs',
  quantity: 6,
  unit: 'pcs',
  aisle: null,
};

const failed = () =>
  Response.json({ code: 'errors.unknown', params: {} }, { status: 500 });

function setup(
  routes: Record<string, (url: URL) => Response | Promise<Response>>,
  staples: Staple[] = [eggs],
) {
  const stub = stubApi(routes);
  vi.stubGlobal('fetch', stub.fetchMock);
  const queryClient = new QueryClient();
  queryClient.setQueryData(suggestionsQueryKey, {});
  queryClient.setQueryData(['staples', 'en'], staples);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const isStale = (key: readonly unknown[]) =>
    queryClient.getQueryState(key)?.isInvalidated;
  const cached = () => queryClient.getQueryData<Staple[]>(['staples', 'en']);
  const { result } = renderHook(() => useStapleMutations('en'), { wrapper });
  return { result, isStale, cached, calls: stub.calls };
}

/** A response held until `release` is called. */
function held(response: () => Response) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => (release = resolve));
  return { handler: () => gate.then(response), release };
}

afterEach(() => vi.unstubAllGlobals());

describe('Making an Ingredient a Staple, or no longer one, shows at once', () => {
  it('adds a placeholder Staple while the add is in flight, sending only the draft', async () => {
    const save = held(() => Response.json(milk, { status: 201 }));
    const { result, cached, calls } = setup({
      'POST /api/staples': save.handler,
    });

    let done!: Promise<unknown>;
    act(() => {
      done = result.current.add.mutateAsync({
        ingredientId: 'milk-id',
        name: 'Milk',
      });
    });
    await vi.waitFor(() =>
      expect(cached()?.map((s) => [s.ingredientId, s.name])).toEqual([
        ['eggs-id', 'Eggs'],
        ['milk-id', 'Milk'],
      ]),
    );
    save.release();
    await act(() => done);
    expect(calls.find((c) => c.key === 'POST /api/staples')?.body).toEqual({
      ingredientId: 'milk-id',
    });
  });

  it('removes the Staple while the remove is in flight', async () => {
    const save = held(() => new Response(null, { status: 204 }));
    const { result, cached } = setup(
      { 'DELETE /api/staples/staple-milk': save.handler },
      [milk, eggs],
    );

    let done!: Promise<unknown>;
    act(() => {
      done = result.current.remove.mutateAsync('staple-milk');
    });
    await vi.waitFor(() => expect(cached()).toEqual([eggs]));
    save.release();
    await act(() => done);
  });

  it('takes the placeholder back when the server refuses the add', async () => {
    const { result, cached } = setup({ 'POST /api/staples': failed });
    await act(() =>
      result.current.add
        .mutateAsync({ ingredientId: 'milk-id', name: 'Milk' })
        .catch(() => undefined),
    );
    expect(cached()).toEqual([eggs]);
  });

  it('puts the Staple back in its place when the server refuses the remove', async () => {
    const { result, cached } = setup(
      { 'DELETE /api/staples/staple-milk': failed },
      [milk, eggs],
    );
    await act(() =>
      result.current.remove.mutateAsync('staple-milk').catch(() => undefined),
    );
    expect(cached()).toEqual([milk, eggs]);
  });

  it('refreshes the Staples and the suggestions once an add settles, even a refused one', async () => {
    const { result, isStale } = setup({ 'POST /api/staples': failed });
    await act(() =>
      result.current.add
        .mutateAsync({ ingredientId: 'milk-id' })
        .catch(() => undefined),
    );
    expect(isStale(['staples', 'en'])).toBe(true);
    expect(isStale(suggestionsQueryKey)).toBe(true);
  });

  it('refreshes the Staples and the suggestions once a remove settles', async () => {
    const { result, isStale } = setup(
      {
        'DELETE /api/staples/staple-milk': () =>
          new Response(null, { status: 204 }),
      },
      [milk, eggs],
    );
    await act(() => result.current.remove.mutateAsync('staple-milk'));
    expect(isStale(['staples', 'en'])).toBe(true);
    expect(isStale(suggestionsQueryKey)).toBe(true);
  });
});
