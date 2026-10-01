import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReceiptSections } from './useReceiptSections';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={
      new QueryClient({ defaultOptions: { mutations: { retry: false } } })
    }
  >
    {children}
  </QueryClientProvider>
);

const IMAGE = 'data:image/jpeg;base64,YQ==';

describe('useReceiptSections', () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubDeferred = (respond: () => Response) => {
    let release: () => void = () => undefined;
    const gate = new Promise<void>((resolve) => (release = resolve));
    vi.stubGlobal('fetch', () => gate.then(respond));
    return release;
  };

  it('discards a result that arrives after reset', async () => {
    const release = stubDeferred(() => Response.json({ lines: [] }));
    const { result } = renderHook(() => useReceiptSections('en'), { wrapper });
    let submitted: Promise<unknown> = Promise.resolve();
    act(() => {
      submitted = result.current.submit(IMAGE);
    });
    expect(result.current.pending).toBe(true);
    act(() => result.current.reset());
    await act(async () => {
      release();
      await submitted;
    });
    expect(result.current.sections).toEqual([]);
    expect(result.current.selected).toBeNull();
    expect(result.current.pending).toBe(false);
  });

  it('discards an error that arrives after reset', async () => {
    const release = stubDeferred(() =>
      Response.json(
        { code: 'scan.provider_incomplete', params: {} },
        { status: 502 },
      ),
    );
    const { result } = renderHook(() => useReceiptSections('en'), { wrapper });
    let submitted: Promise<unknown> = Promise.resolve();
    act(() => {
      submitted = result.current.submit(IMAGE);
    });
    act(() => result.current.reset());
    await act(async () => {
      release();
      await submitted;
    });
    expect(result.current.error).toBeNull();
    expect(result.current.pending).toBe(false);
  });
});
