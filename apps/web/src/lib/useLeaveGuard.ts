import type { ContextType } from 'react';
import { useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { UNSAFE_NavigationContext, useLocation } from 'react-router-dom';

/**
 * Asks before the Member leaves while `shouldAsk()` is true (unsaved work).
 *
 * The app runs on `<BrowserRouter>`, where React Router's `useBlocker` is not
 * available (it needs a data router), so this hook guards the three doors itself:
 *  - in-app navigation (links, `navigate(...)`, `navigate(-1)`): it wraps the
 *    router's `navigator.push / replace / go` while mounted, and asks with
 *    `window.confirm` (the same dialog the Scan screen uses);
 *  - the browser's Back and Forward buttons: a capturing `popstate` listener
 *    runs before the router's, asks, and on "stay" undoes the move with
 *    `history.go` (a `replace` to the same path, such as putting `?draft=` in
 *    the address, never asks);
 *  - closing, reloading or leaving the site: `beforeunload`, with the browser's
 *    own wording.
 * `shouldAsk` is read at the moment of leaving, so it is current even in the
 * same tick as the state change that cleared it.
 */
export function useLeaveGuard(shouldAsk: () => boolean, message: string): void {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const location = useLocation();
  const latest = useRef({ shouldAsk, message });
  // Where the history entry we stand on sits, to undo a Back the Member declined.
  const position = useRef<number | null>(null);
  const here = useRef(location.pathname);
  useLayoutEffect(() => {
    latest.current = { shouldAsk, message };
    here.current = location.pathname;
  });
  useEffect(() => {
    position.current = historyIndex();
  }, [location.key]);

  useEffect(() => {
    /** True when leaving may go ahead. */
    const ask = () =>
      !latest.current.shouldAsk() || window.confirm(latest.current.message);

    const restore = guardNavigator(navigator, ask, () => here.current);

    let undoing = false;
    const onPop = (event: PopStateEvent) => {
      if (undoing) {
        undoing = false;
        event.stopImmediatePropagation();
        return;
      }
      if (!latest.current.shouldAsk()) return;
      if (window.confirm(latest.current.message)) return;
      // Declined: the browser has already moved, so put it back before the router hears of it.
      event.stopImmediatePropagation();
      const from = position.current;
      const to = historyIndex();
      if (from !== null && to !== null && from !== to) {
        undoing = true;
        window.history.go(from - to);
      }
    };
    window.addEventListener('popstate', onPop, true);

    const onUnload = (event: BeforeUnloadEvent) => {
      if (!latest.current.shouldAsk()) return;
      event.preventDefault();
      // Older browsers read this.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onUnload);

    return () => {
      window.removeEventListener('popstate', onPop, true);
      window.removeEventListener('beforeunload', onUnload);
      restore();
    };
  }, [navigator]);
}

/** React Router keeps each entry's position in `history.state.idx`. */
function historyIndex(): number | null {
  const idx = (window.history.state as { idx?: unknown } | null)?.idx;
  return typeof idx === 'number' ? idx : null;
}

function pathOf(target: string): string {
  return target.split(/[?#]/)[0];
}

type Navigator = NonNullable<
  ContextType<typeof UNSAFE_NavigationContext>
>['navigator'];

/** Makes `push`, `replace` and `go` ask first; returns the undo. */
function guardNavigator(
  navigator: Navigator,
  ask: () => boolean,
  currentPath: () => string,
): () => void {
  const { push, replace, go } = navigator;
  navigator.push = (...args: Parameters<typeof push>) => {
    if (ask()) push.apply(navigator, args);
  };
  navigator.replace = (...args: Parameters<typeof replace>) => {
    const [to] = args;
    const target = typeof to === 'string' ? to : (to.pathname ?? currentPath());
    // Same page (the address gaining its `draft` id) is not leaving.
    if (pathOf(target) === currentPath() || ask()) {
      replace.apply(navigator, args);
    }
  };
  navigator.go = (delta: number) => {
    if (ask()) go.call(navigator, delta);
  };
  return () => {
    navigator.push = push;
    navigator.replace = replace;
    navigator.go = go;
  };
}
