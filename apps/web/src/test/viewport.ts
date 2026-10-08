import { vi } from 'vitest';

/** A `matchMedia` stub answering each query through `matches`. */
export function stubMatchMedia(matches: (query: string) => boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
  }));
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
