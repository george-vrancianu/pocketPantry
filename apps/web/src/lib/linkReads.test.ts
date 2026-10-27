import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextBackgroundOrder } from '../components/background/backgroundItem';
import { createLinkReads } from './linkReads';

const requests: Array<{ url: string; resolve: () => void }> = [];

beforeEach(() => {
  requests.length = 0;
  // Every read is held until the test answers it, as a duplicate.
  vi.stubGlobal(
    'fetch',
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((resolve) => {
        const { url } = JSON.parse(String(init?.body)) as { url: string };
        requests.push({
          url,
          resolve: () =>
            resolve(Response.json({ kind: 'duplicate', recipeId: 'r1' })),
        });
      }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('link reads', () => {
  it('lets go of a replaced read only when it has failed', () => {
    const holder = createLinkReads();
    holder.submit({ kind: 'link', url: 'https://a.example/x' }, 'source');
    const [running] = holder.getState().reads;
    // A stale id (router state survives a reload): the read it names is not a failed one.
    holder.submit({ kind: 'text', text: 'pasted' }, 'source', running.id);
    expect(holder.getState().reads.map((r) => r.id)).toContain(running.id);
    expect(holder.getState().reads).toHaveLength(2);
    holder.clear();
  });

  it('stamps each read on the clock every background item shares', () => {
    const holder = createLinkReads();
    const before = nextBackgroundOrder();
    holder.submit({ kind: 'link', url: 'https://a.example/x' }, 'source');
    holder.submit({ kind: 'link', url: 'https://b.example/x' }, 'source');
    const [first, second] = holder.getState().reads;
    expect(first.order).toBeGreaterThan(before);
    expect(second.order).toBeGreaterThan(first.order);
    expect(nextBackgroundOrder()).toBeGreaterThan(second.order);
    holder.clear();
  });

  it('starts a read that was read again after the ones already waiting', async () => {
    const holder = createLinkReads();
    const link = (n: number) => ({
      kind: 'link' as const,
      url: `https://site${n}.example/x`,
    });
    holder.submit(link(1), 'source');
    holder.submit(link(2), 'source');
    holder.submit(link(3), 'source');
    // 1 and 2 run, 3 waits. 1 answers as a duplicate and frees a slot for 3.
    requests[0].resolve();
    await vi.waitFor(() =>
      expect(holder.getState().reads[2].status).toBe('reading'),
    );
    const [one, two] = holder.getState().reads;
    holder.submit(link(4), 'source');
    holder.readAgain(one.id);
    // 2 and 3 run; 4 was waiting before the re-read. Freeing a slot starts 4, not 1.
    holder.discard(two.id);
    const status = (id: number) =>
      holder.getState().reads.find((r) => r.id === id)?.status;
    expect(status(4)).toBe('reading');
    expect(status(one.id)).toBe('waiting');
    holder.clear();
  });
});
