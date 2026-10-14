import { vi } from 'vitest';

type MediaListener = (event: { matches: boolean; media: string }) => void;

/**
 * A `matchMedia` stub answering each query through `matches`. Listeners
 * registered on the returned lists are kept; after changing what `matches`
 * answers, call the returned `notify` to tell them, as a browser does.
 */
export function stubMatchMedia(matches: (query: string) => boolean) {
  const lists: {
    media: string;
    listeners: Set<MediaListener>;
    last: boolean;
  }[] = [];
  vi.stubGlobal('matchMedia', (query: string) => {
    const entry = {
      media: query,
      listeners: new Set<MediaListener>(),
      last: matches(query),
    };
    lists.push(entry);
    const add = (listener: MediaListener) => {
      entry.listeners.add(listener);
    };
    const remove = (listener: MediaListener) => {
      entry.listeners.delete(listener);
    };
    return {
      get matches() {
        return matches(query);
      },
      media: query,
      addEventListener: (_type: string, listener: MediaListener) =>
        add(listener),
      removeEventListener: (_type: string, listener: MediaListener) =>
        remove(listener),
      addListener: add,
      removeListener: remove,
    };
  });
  return {
    /** Calls the listeners of every query whose answer changed since it was last reported. */
    notify() {
      for (const entry of lists) {
        const now = matches(entry.media);
        if (now === entry.last) continue;
        entry.last = now;
        for (const listener of entry.listeners) {
          listener({ matches: now, media: entry.media });
        }
      }
    },
  };
}

/** Make `window.matchMedia` answer `(min-width)` / `(max-width)` queries for a viewport of this width; any other query is false. */
export function stubViewport(width: number) {
  stubMatchMedia((query) => {
    const min = /min-width:\s*([\d.]+)px/.exec(query);
    const max = /max-width:\s*([\d.]+)px/.exec(query);
    if (!min && !max) return false;
    return (
      (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]))
    );
  });
}

/** Answer `(prefers-reduced-motion: reduce)` with `reduce`; every other query is false. */
export function stubMotion(reduce: boolean) {
  stubMatchMedia((query) => reduce && query.includes('prefers-reduced-motion'));
}

/**
 * Answer `(prefers-color-scheme: dark)` with the system scheme; every other
 * query is false. `setDark` switches the system scheme and notifies listeners.
 */
export function stubSystemScheme(dark: boolean) {
  let systemDark = dark;
  const media = stubMatchMedia(
    (query) => systemDark && query.includes('prefers-color-scheme: dark'),
  );
  return {
    setDark(next: boolean) {
      systemDark = next;
      media.notify();
    },
  };
}
