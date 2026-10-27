import { useSyncExternalStore } from 'react';
import { nextBackgroundOrder } from '../components/background/backgroundItem';
import { ApiError } from './api';
import {
  readRecipeLink,
  type ReadingLanguage,
  type RecipeFromLink,
} from './linkRecipe';

/** At most this many link reads run at once; the rest wait in the order they were started. */
export const MAX_LINK_READS = 2;
/** At most this many link reads are held (waiting, reading, ready or failed) until the Member reviews some. */
export const MAX_HELD_LINK_READS = 5;

/** A read that fails for want of a network is tried once more after this long, before it shows failed. */
export const LINK_AUTO_RETRY_MS = 1500;

/**
 * `waiting` for a free slot, `reading`, `ready` (a Recipe Draft is kept, or the link is already a
 * Recipe), `failed`, or `capped` (the Link Cap refused it, or it was waiting behind the read the cap
 * refused; Retry tries again, like a capped Scan in ADR 0004).
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
  /** When ready without a draft: the Family Recipe this link already is. */
  duplicateOf?: string;
  /** When failed or capped: why (an `ApiError` for the Link Cap carries its `cap` and `resetsAt`). */
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

/** No response at all (the request never got an answer), not an answer that says no. */
const isNetworkError = (error: unknown) =>
  error instanceof ApiError && error.code === 'network_error';

/** The API answered that the Link Cap is reached. */
export const isCapReached = (error: unknown) =>
  error instanceof ApiError && error.code === 'link.cap_reached';

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
  /** Reads already tried again after a network error: one automatic retry each. */
  const retried = new Set<number>();
  /** The pending automatic retry of a read: it keeps its slot meanwhile. */
  /** How many failed or capped reads the strip has announced as an alert. Outlives the strip, which remounts. */
  let announcedFailed = 0;
  const retryTimers = new Map<number, ReturnType<typeof setTimeout>>();

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
        patch(
          read.id,
          result.kind === 'duplicate'
            ? { status: 'ready', duplicateOf: result.recipeId }
            : { status: 'ready', recipeDraftId: result.recipeDraftId },
        );
        if (result.kind === 'draft') {
          finishedListeners.forEach((listener) => listener());
        }
        pump();
      },
      (error: unknown) => {
        if (attempt.signal.aborted || controllers.get(read.id) !== attempt)
          return;
        controllers.delete(read.id);
        if (isNetworkError(error) && !retried.has(read.id)) {
          // No answer at all: once more before the Member sees a failure. The read stays "reading".
          retried.add(read.id);
          if (force) forced.add(read.id);
          retryTimers.set(
            read.id,
            setTimeout(() => {
              retryTimers.delete(read.id);
              const again = find(read.id);
              if (again) run(again);
            }, LINK_AUTO_RETRY_MS),
          );
          return;
        }
        if (isCapReached(error)) {
          // The cap refuses every read from here: those waiting behind it are held with it.
          set(
            state.reads.map((r) =>
              r.id === read.id || r.status === 'waiting'
                ? { ...r, status: 'capped', error }
                : r,
            ),
          );
        } else {
          patch(read.id, { status: 'failed', error });
        }
        pump();
      },
    );
  }

  /** Lets a read go: aborts its request if it is running, and only that one. Frees its slot. */
  function discard(id: number) {
    if (!find(id)) return;
    controllers.get(id)?.abort();
    controllers.delete(id);
    forced.delete(id);
    retried.delete(id);
    clearTimeout(retryTimers.get(id));
    retryTimers.delete(id);
    set(state.reads.filter((r) => r.id !== id));
    pump();
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
    /**
     * Holds a read and starts it as soon as a slot is free. `full`: five are held already; nothing was
     * added. `replaces`: a read this one stands in for ("Paste text instead" on a page that could not
     * be read); it is let go first, so it never fills the last place.
     */
    submit(
      source: LinkReadSource,
      language: ReadingLanguage,
      replaces?: number,
    ): SubmitOutcome {
      if (replaces !== undefined) discard(replaces);
      if (state.reads.length >= MAX_HELD_LINK_READS) return 'full';
      const id = nextId++;
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
    /** A duplicate answer, read anyway: the same link again with `force`. */
    readAgain(id: number) {
      const read = find(id);
      if (
        !read ||
        read.source.kind !== 'link' ||
        read.duplicateOf === undefined
      )
        return;
      forced.add(id);
      patch(id, {
        status: 'waiting',
        duplicateOf: undefined,
        order: nextBackgroundOrder(),
      });
      pump();
    },
    /**
     * Tries a failed or capped read again. Retrying a capped read releases every read the cap held
     * (ADR 0004); each goes back to waiting in its place, and the Link Cap decides again.
     */
    retry(id: number) {
      const read = find(id);
      if (!read || (read.status !== 'failed' && read.status !== 'capped'))
        return;
      const releasing = (r: LinkRead) =>
        r.id === id || (read.status === 'capped' && r.status === 'capped');
      retried.delete(id);
      set(
        state.reads.map((r) =>
          releasing(r) ? { ...r, status: 'waiting', error: undefined } : r,
        ),
      );
      pump();
    },
    discard,
    announcedFailed: () => announcedFailed,
    announceFailed(failed: number) {
      announcedFailed = failed;
    },
    /** Drops every read silently (sign-out). */
    clear() {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      forced.clear();
      retried.clear();
      retryTimers.forEach((timer) => clearTimeout(timer));
      retryTimers.clear();
      announcedFailed = 0;
      set([]);
    },
  };
}

export type LinkReads = ReturnType<typeof createLinkReads>;

/** The app's one link-read holder. */
export const linkReads = createLinkReads();

export const useLinkReads = (): LinkReadsState =>
  useSyncExternalStore(
    linkReads.subscribe,
    linkReads.getState,
    linkReads.getState,
  );
