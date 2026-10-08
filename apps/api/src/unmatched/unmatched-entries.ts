import { normalizeName } from '../catalog/normalize';
import type { Tx } from '../database/database.types';
import { unmatchedEntries } from '../database/schema';

export type UnmatchedSource =
  (typeof unmatchedEntries.source.enumValues)[number];

/** The sources a client may claim when saving Batches from the Review screen. */
export const BATCH_SOURCES = [
  'product',
  'receipt',
  'ingredients',
  'manual',
] as const satisfies UnmatchedSource[];

/** The sources a client may claim when adding a Shopping Item. */
export const SHOPPING_ITEM_SOURCES = [
  'manual',
  'plate',
] as const satisfies UnmatchedSource[];

export type UnmatchedRecord = {
  rawName: string;
  locale: string;
  /** The text as printed and the Scan Language it was read in; both or neither. */
  sourceText?: string;
  sourceLanguage?: string;
  source: UnmatchedSource;
} & ({ batchId: string } | { shoppingItemId: string });

/**
 * Queues Unmatched names for Admin curation. Call it in the same transaction
 * that saves the Batch or Shopping Item, so a name is never saved without its
 * queue entry (or the other way round).
 */
export async function recordUnmatched(
  tx: Tx,
  records: UnmatchedRecord[],
): Promise<void> {
  if (records.length === 0) return;
  await tx.insert(unmatchedEntries).values(
    records.map((record) => ({
      normalizedName: normalizeName(record.rawName),
      rawName: record.rawName,
      locale: record.locale,
      sourceText: record.sourceText ?? null,
      sourceLanguage: record.sourceText
        ? (record.sourceLanguage ?? null)
        : null,
      source: record.source,
      batchId: 'batchId' in record ? record.batchId : null,
      shoppingItemId: 'shoppingItemId' in record ? record.shoppingItemId : null,
    })),
  );
}
