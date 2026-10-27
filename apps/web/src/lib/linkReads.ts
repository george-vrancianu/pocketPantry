import { useSyncExternalStore } from 'react';
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

/**
 * `waiting` for a free slot, `reading`, `ready` (a Recipe Draft is kept, or the link is already a
 * Recipe), `failed`, or `capped` (the Link Cap refused it; driven by the failure handling, not yet set here).
 */
export type LinkReadStatus =
  'waiting' | 'reading' | 'ready' | 'failed' | 'capped';

/** What a Member asked to read: a link or pasted text, never both. */
export type LinkReadSource =
  { kind: 'link'; url: string } | { kind: 'text'; text: string };

export type LinkRead = {
  /** Ascends with the order the reads were started. */
  id: number;
  source: LinkReadSource;
  language: ReadingLanguage;
  status: LinkReadStatus;
  /** The page's site (`example.com`) for a link; null for pasted text. */
  site: string | null;
  /** When ready: the Recipe Draft the server kept. */
  recipeDraftId?: string;
  /** When ready without a draft: the Family Recipe this link already is. */
  duplicateOf?: string;
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

/** The error code of a failed read, if the API gave one. */
export const errorCodeOf = (read: LinkRead): string | null =>
  read.error instanceof ApiError ? read.error.code : null;

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
      const next = state.reads.find((r) => r.status === 'waiting');
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
    submit(source: LinkReadSource, language: ReadingLanguage): SubmitOutcome {
      if (state.reads.length >= MAX_HELD_LINK_READS) return 'full';
      const id = nextId++;
      set([
        ...state.reads,
        {
          id,
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
      patch(id, { status: 'waiting', duplicateOf: undefined });
      pump();
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

export const useLinkReads = (): LinkReadsState =>
  useSyncExternalStore(
    linkReads.subscribe,
    linkReads.getState,
    linkReads.getState,
  );
