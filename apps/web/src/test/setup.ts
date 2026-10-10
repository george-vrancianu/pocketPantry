import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';
import { resetReads } from '../lib/scanReads';
import { resetScanSession } from '../lib/scanSession';

configure({ asyncUtilTimeout: 3000 });

afterEach(() => {
  cleanup();
  // The Scan Session is module state: do not carry Scans over to the next test.
  resetScanSession();
  resetReads();
});
