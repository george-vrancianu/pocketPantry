import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextBackgroundOrder } from '../components/background/backgroundItem';
import { createLinkReads } from './linkReads';

const requests: Array<{ url: string; force: unknown; resolve: () => void }> =
  [];

beforeEach(() => {
  requests.length = 0;
  // Every read is held until the test answers it, as a duplicate.
  vi.stubGlobal(
    'fetch',
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((resolve) => {
        const { url, force } = JSON.parse(String(init?.body)) as {
          url: string;
          force?: boolean;
        };
        requests.push({
          url,
          force,
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
    holder.submit({ kind: 'text', text: 'pasted' }, 'source', {
      replaces: running.id,
    });
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

  it('reads a link again with force when the server answers a duplicate after all, behind the ones already waiting', async () => {
    const holder = createLinkReads();
    const link = (n: number) => ({
      kind: 'link' as const,
      url: `https://site${n}.example/x`,
    });
    holder.submit(link(1), 'source');
    holder.submit(link(2), 'source');
    holder.submit(link(3), 'source');
    // 1 and 2 run, 3 waits. 1 answers as a duplicate (saved since the sheet asked): it is read again, after 3.
    requests[0].resolve();
    await vi.waitFor(() =>
      expect(holder.getState().reads[2].status).toBe('reading'),
    );
    const [one, two] = holder.getState().reads;
    holder.submit(link(4), 'source');
    expect(holder.getState().reads.find((r) => r.id === one.id)?.status).toBe(
      'waiting',
    );
    // Freeing a slot starts the read-again, not 4 (it was waiting longer).
    holder.discard(two.id);
    await vi.waitFor(() => expect(requests).toHaveLength(4));
    expect(requests[3].url).toBe('https://site1.example/x');
    expect(requests[3].force).toBe(true);
    holder.clear();
  });

  it('sends force from the start when asked to', () => {
    const holder = createLinkReads();
    holder.submit({ kind: 'link', url: 'https://a.example/x' }, 'source', {
      force: true,
    });
    expect(requests[0].force).toBe(true);
    holder.clear();
  });
});
