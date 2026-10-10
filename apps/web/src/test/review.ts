import { screen, waitFor } from '@testing-library/react';
import type { ProposedLine, ScanMode } from '../lib/scan';
import { dispatchScanSession, resetScanSession } from '../lib/scanSession';
import type { ScanLanguage } from '../i18n/resources';

/** The route of the card `startReview` seeds. */
export const REVIEW_ROUTE = '/scan/review/card';

/** Puts one read Scan in the Scan Session, as the editor at `REVIEW_ROUTE` opens it. */
export function startReview(scan: {
  mode: ScanMode;
  lines: ProposedLine[];
  scanLanguage?: ScanLanguage;
}) {
  resetScanSession();
  dispatchScanSession({
    type: 'enqueue',
    scan: {
      id: 'card',
      mode: scan.mode,
      scanLanguage: scan.scanLanguage,
      image: 'x',
      thumbnail: 'x',
    },
  });
  dispatchScanSession({ type: 'start' });
  dispatchScanSession({ type: 'read', id: 'card', lines: scan.lines });
}

/** Names of the Review rows on screen, in display order (rows to check first). */
export const reviewRowNames = () =>
  Array.from(
    document.querySelectorAll('[id^="review-line-"][id$="-title"]'),
  ).map((name) => name.textContent);

/** A Review row's own button, once it has rendered. */
export const findReviewRow = (name: string) =>
  waitFor(() => {
    const row = screen
      .getAllByRole('button')
      .find(
        (button) =>
          button.hasAttribute('aria-expanded') &&
          button.querySelector('[id$="-title"]')?.textContent === name,
      );
    if (!row) throw new Error(`No Review row named ${name}`);
    return row;
  });
