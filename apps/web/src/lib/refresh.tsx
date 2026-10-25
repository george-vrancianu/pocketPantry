import { useQueryClient } from '@tanstack/react-query';
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

export type RefreshState = 'idle' | 'busy' | 'done' | 'failed';

type Refresh = { state: RefreshState; run: () => Promise<void> };

const DONE_MS = 2500;
const FAILED_MS = 4000;

const RefreshContext = createContext<Refresh | undefined>(undefined);

/** Owns the screen refresh for the app layout: the header (mark, status line) and the content region both read it. */
export function RefreshProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<RefreshState>('idle');
  const busy = useRef(false);

  // `done` and `failed` clear on their own.
  useEffect(() => {
    if (state !== 'done' && state !== 'failed') return;
    const timer = setTimeout(
      () => setState('idle'),
      state === 'done' ? DONE_MS : FAILED_MS,
    );
    return () => clearTimeout(timer);
  }, [state]);

  const run = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    setState('busy');
    let failed = false;
    try {
      await queryClient.refetchQueries(
        { type: 'active' },
        { throwOnError: true },
      );
    } catch {
      failed = true;
    }
    if (
      queryClient
        .getQueryCache()
        .findAll({ type: 'active' })
        .some((query) => query.state.status === 'error')
    ) {
      failed = true;
    }
    busy.current = false;
    setState(failed ? 'failed' : 'done');
  }, [queryClient]);

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
