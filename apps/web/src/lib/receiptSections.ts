import type { ProposedLine } from './scan';

/** Most Receipt Sections one receipt may have: each is one Scan against the Scan Cap. */
export const MAX_RECEIPT_SECTIONS = 10;

/** What one Receipt Section's request returned. */
export type ReceiptSectionResult = { lines: ProposedLine[] };
