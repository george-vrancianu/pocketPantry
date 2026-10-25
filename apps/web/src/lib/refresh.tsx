import { onlineManager, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

export type RefreshState = 'idle' | 'busy' | 'done' | 'failed';

type Refresh = { state: RefreshState; run: () => Promise<void> };

const DONE_MS = 2500;
const FAILED_MS = 4000;

const RefreshContext = createContext<Refresh | undefined>(undefined);

/** Owns the screen refresh for the app layout: the header (mark, status line) and the content region both read it. */
export function RefreshProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  // The state belongs to the screen it was set on: on another path it reads as idle.
  const [entry, setEntry] = useState<{ state: RefreshState; path: string }>({
    state: 'idle',
    path: pathname,
  });
  const state = entry.path === pathname ? entry.state : 'idle';
  const setState = useCallback(
    (next: RefreshState) => setEntry({ state: next, path: pathname }),
    [pathname],
  );
  const busy = useRef(false);
  // Bumped on each run and on each path change: a run whose id is stale started on another screen.
  const runId = useRef(0);

  // A run in flight on the screen just left is dropped.
  useEffect(() => {
    runId.current += 1;
    busy.current = false;
  }, [pathname]);

  // `done` and `failed` clear on their own.
  useEffect(() => {
    if (state !== 'done' && state !== 'failed') return;
    const timer = setTimeout(
      () => setState('idle'),
      state === 'done' ? DONE_MS : FAILED_MS,
    );
    return () => clearTimeout(timer);
  }, [state, setState]);

  const run = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    const id = ++runId.current;
    setState('busy');
    let failed = false;
    try {
      // Without `throwOnError` this waits for every query and swallows their errors.
      await queryClient.refetchQueries({ type: 'active' });
    } catch {
      failed = true;
    }
    if (id !== runId.current) return;
    // A paused query (offline) resolves at once and keeps its old data: that is not an update.
    if (
      !onlineManager.isOnline() ||
      queryClient
        .getQueryCache()
        .findAll({ type: 'active' })
        .some(
          (query) =>
            query.state.status === 'error' ||
            query.state.fetchStatus === 'paused',
        )
    ) {
      failed = true;
    }
    busy.current = false;
    setState(failed ? 'failed' : 'done');
  }, [queryClient, setState]);

  const value = useMemo(() => ({ state, run }), [state, run]);
  return <RefreshContext value={value}>{children}</RefreshContext>;
}

/** The refresh, or undefined outside the app layout (a header rendered alone then has no mark). */
export function useOptionalRefreshScreen(): Refresh | undefined {
  return useContext(RefreshContext);
}

/** The refresh of everything the screen shows: `run` refetches every active query and does nothing while busy. */
export function useRefreshScreen(): Refresh {
  const value = useContext(RefreshContext);
  if (!value) throw new Error('useRefreshScreen needs a RefreshProvider');
  return value;
}
