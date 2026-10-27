import { useEffect, useSyncExternalStore } from 'react';
import { nextBackgroundOrder } from '../components/background/backgroundItem';
import {
  readRecipeLink,
  type ReadingLanguage,
  type RecipeFromLink,
} from './linkRecipe';

/** At most this many link reads run at once; the rest wait in the order they were started. */
export const MAX_LINK_READS = 2;
/** At most this many link reads are held (waiting, reading, ready or failed) until the Member reviews some. */
export const MAX_HELD_LINK_READS = 5;

/**
 * `waiting` for a free slot, `reading`, `ready` (a Recipe Draft is kept), `failed`, or `capped`
 * (the Link Cap refused it; driven by the failure handling, not yet set here).
 */
export type LinkReadStatus =
  'waiting' | 'reading' | 'ready' | 'failed' | 'capped';

/** What a Member asked to read: a link or pasted text, never both. */
export type LinkReadSource =
  { kind: 'link'; url: string } | { kind: 'text'; text: string };

export type LinkRead = {
  /** Ascends with the order the reads were started. */
  id: number;
  /** `nextBackgroundOrder` when started: orders its row against other kinds of background item. */
  order: number;
  source: LinkReadSource;
  language: ReadingLanguage;
  status: LinkReadStatus;
  /** The page's site (`example.com`) for a link; null for pasted text. */
  site: string | null;
  /** When ready: the Recipe Draft the server kept. */
  recipeDraftId?: string;
  /** When failed: why. */
  error?: unknown;
};

export type LinkReadsState = { reads: LinkRead[] };

/** `full`: the holder is at its limit; the Member must review some first. */
export type SubmitOutcome = 'started' | 'full';

/** The site of a link, as the Member would say it: the host without `www.`. */
export function siteOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}

/**
 * The link-read holder: the Member's link reads, kept in memory outside any page, like the Voice Inbox.
 * It reads with plain API requests, not a page's mutation or the query cache, so a read outlives the
 * sheet that started it and every page change. At most `MAX_LINK_READS` run; the rest wait in the
 * order started. Sign-out clears it, dropping every read silently.
 */
export function createLinkReads() {
  let state: LinkReadsState = { reads: [] };
  let nextId = 1;
  const listeners = new Set<() => void>();
  const finishedListeners = new Set<() => void>();
  /** One per running read: aborting it abandons that request, and only it. */
  const controllers = new Map<number, AbortController>();
  /** Reads to send with `force` (the Member chose "Read again"). */
  const forced = new Set<number>();

  const set = (reads: LinkRead[]) => {
    state = { reads };
    listeners.forEach((listener) => listener());
  };
  const patch = (id: number, changes: Partial<LinkRead>) =>
    set(state.reads.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  const find = (id: number) => state.reads.find((r) => r.id === id);

  /** Starts waiting reads while there is a free slot. */
  function pump() {
    for (;;) {
      const running = state.reads.filter((r) => r.status === 'reading').length;
      if (running >= MAX_LINK_READS) return;
      // Oldest first by order: a read started again goes behind the ones already waiting.
      const next = state.reads
        .filter((r) => r.status === 'waiting')
        .sort((a, b) => a.order - b.order)[0];
      if (!next) return;
      run(next);
    }
  }

  function run(read: LinkRead) {
    const attempt = new AbortController();
    controllers.set(read.id, attempt);
    patch(read.id, { status: 'reading', error: undefined });
    const force = forced.delete(read.id);
    readRecipeLink({
      ...(read.source.kind === 'link'
        ? { url: read.source.url, ...(force ? { force } : {}) }
        : { text: read.source.text }),
      language: read.language,
      signal: attempt.signal,
    }).then(
      (result: RecipeFromLink) => {
        // A discarded (aborted) read never reports.
        if (attempt.signal.aborted || controllers.get(read.id) !== attempt)
          return;
        controllers.delete(read.id);
        if (result.kind === 'duplicate') {
          // The sheet asked first and the link was not a Recipe then; one was saved since. The Member asked
          // for this read, so read it anyway rather than leave a row with nothing to review.
          forced.add(read.id);
          patch(read.id, { status: 'waiting', order: nextBackgroundOrder() });
          pump();
          return;
        }
        patch(read.id, {
          status: 'ready',
          recipeDraftId: result.recipeDraftId,
        });
        finishedListeners.forEach((listener) => listener());
        pump();
      },
      (error: unknown) => {
        if (attempt.signal.aborted || controllers.get(read.id) !== attempt)
          return;
        controllers.delete(read.id);
        patch(read.id, { status: 'failed', error });
        pump();
      },
    );
  }

  return {
    getState: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Told when a read keeps a Recipe Draft (the Recipe Drafts list is out of date). */
    onDraftKept: (listener: () => void) => {
      finishedListeners.add(listener);
      return () => {
        finishedListeners.delete(listener);
      };
    },
    /** Holds a read and starts it as soon as a slot is free. `full`: five are held already; nothing was added. */
    submit(
      source: LinkReadSource,
      language: ReadingLanguage,
      /** The link is already one of the Recipes and the Member chose "Read again". */
      options: { force?: boolean } = {},
    ): SubmitOutcome {
      if (state.reads.length >= MAX_HELD_LINK_READS) return 'full';
      const id = nextId++;
      if (options.force) forced.add(id);
      set([
        ...state.reads,
        {
          id,
          order: nextBackgroundOrder(),
          source,
          language,
          status: 'waiting',
          site: source.kind === 'link' ? siteOf(source.url) : null,
        },
      ]);
      pump();
      return 'started';
    },
    /** Lets a read go: aborts its request if it is running, and only that one. Frees its slot. */
    discard(id: number) {
      if (!find(id)) return;
      controllers.get(id)?.abort();
      controllers.delete(id);
      forced.delete(id);
      set(state.reads.filter((r) => r.id !== id));
      pump();
    },
    /** Drops every read silently (sign-out). */
    clear() {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      forced.clear();
      set([]);
    },
  };
}

export type LinkReads = ReturnType<typeof createLinkReads>;

/** The app's one link-read holder. */
export const linkReads = createLinkReads();

/**
 * While a link read is waiting or reading, asks before the page unloads (closing the tab, reloading):
 * the read lasts as long as its page and would be lost. Ready and failed reads need no prompt.
 * Mounted once, by the app layout.
 */
export function useUnloadPromptWhileReading() {
  const { reads } = useLinkReads();
  const reading = reads.some(
    (r) => r.status === 'waiting' || r.status === 'reading',
  );
  useEffect(() => {
    if (!reading) return;
    const ask = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Older browsers need a return value to show the prompt.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', ask);
    return () => window.removeEventListener('beforeunload', ask);
  }, [reading]);
}

export const useLinkReads = (): LinkReadsState =>
  useSyncExternalStore(
    linkReads.subscribe,
    linkReads.getState,
    linkReads.getState,
  );
