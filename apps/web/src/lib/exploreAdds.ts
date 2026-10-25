import { useSyncExternalStore } from 'react';

/**
 * The Recipes added this Explore visit, net of Undo: the Back badge. It lives outside the page so
 * it survives a round trip through a Catalog Recipe's preview, which unmounts Explore; adds made in
 * the preview count too. Explore resets it on a fresh visit and when the Member goes Back.
 */
let net = 0;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());

export const exploreAdds = {
  get: () => net,
  bump(delta: 1 | -1) {
    net = Math.max(0, net + delta);
    emit();
  },
  reset() {
    if (net === 0) return;
    net = 0;
    emit();
  },
};

export function useExploreAdds() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    exploreAdds.get,
    exploreAdds.get,
  );
}
