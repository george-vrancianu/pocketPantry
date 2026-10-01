import type { ProposedLine } from './scan';

/** Most Receipt Sections one receipt may have: each is one Scan against the Scan Cap. */
export const MAX_RECEIPT_SECTIONS = 10;

/**
 * What one Receipt Section's request returned. The endpoint returns only `{ lines }` today;
 * `merchantName` and `purchaseDate` are merged if present but unused until the API and Review expose them.
 */
export type ReceiptSectionResult = {
  lines: ProposedLine[];
  merchantName?: string | null;
  purchaseDate?: string | null;
};

export type MergedReceipt = {
  lines: ProposedLine[];
  merchantName: string | null;
  purchaseDate: string | null;
};

const firstPresent = (values: Array<string | null | undefined>) =>
  values.find((value): value is string => value != null) ?? null;

/**
 * Joins the Receipt Sections of one receipt, in order, into a single result:
 * lines are concatenated; the shop and date are the first ones any section read.
 */
export function mergeReceiptSections(
  sections: ReceiptSectionResult[],
): MergedReceipt {
  const lines = sections.flatMap((section) => section.lines);
  return {
    lines,
    merchantName: firstPresent(sections.map((s) => s.merchantName)),
    purchaseDate: firstPresent(sections.map((s) => s.purchaseDate)),
  };
}
