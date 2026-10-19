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
