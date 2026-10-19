import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetReads } from '../lib/scanReads';
import { resetScanSession } from '../lib/scanSession';

configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  cleanup();
  // First-use hints are remembered in storage: start each test unseen.
  localStorage.clear();
  // The Scan Session is module state: do not carry Scans over to the next test.
  resetScanSession();
  resetReads();
});

// jsdom does not implement scrolling; screens that scroll to the top just need it to exist.
window.scrollTo = () => {};

// jsdom has no matchMedia, which every browser has: without one MUI cannot
// resolve Match system. Default to a light system where every query is false;
// tests stub their own through `test/viewport.ts`.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }) as MediaQueryList;

// A real pointer (a mouse, the first finger) is primary; jsdom defaults `isPrimary` to false,
// which the Voice Note button ignores. Make a plain pointer event primary unless a test says not.
if (typeof window.PointerEvent === 'function') {
  const JsdomPointerEvent = window.PointerEvent;
  window.PointerEvent = class extends JsdomPointerEvent {
    private readonly primary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.primary = init.isPrimary ?? true;
    }
    get isPrimary() {
      return this.primary;
    }
  };
}
