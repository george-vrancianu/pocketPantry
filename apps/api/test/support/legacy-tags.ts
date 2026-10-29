import { inArray } from 'drizzle-orm';
import type { Database } from '../../src/database/database.types';
import { tags } from '../../src/database/schema';
import { mirrorListEntryAsTag } from '../../src/tags/recipe-tags';

/**
 * A test that inserts Cuisine or Method rows directly gives each its Catalog Tag (the Tag with the
 * same id, as migration 0049 and the Admin lists do), so the id can go in a Recipe's `tagIds`.
 * Gone with the old lists in the contract ticket (#715).
 */
export async function mirrorAsTags(
  database: Database,
  entries: { type: 'cuisine' | 'method'; id: string }[],
): Promise<void> {
  await database.transaction(async (tx) => {
    for (const entry of entries) {
      await mirrorListEntryAsTag(tx, entry.type, entry.id);
    }
  });
}

/** Removes the Tags `mirrorAsTags` made (their Recipe links go with them). */
export async function dropTags(database: Database, ids: string[]) {
  await database.delete(tags).where(inArray(tags.id, ids));
}

/**
 * The old test documents named a `cuisineId` and a `methodId`; a Recipe document now carries
 * `tagIds`. Turns the two keys of `overrides` into that list (kept apart from the rest).
 */
export function withTagIds<T extends Record<string, unknown>>(
  overrides: T,
): Omit<T, 'cuisineId' | 'methodId'> & { tagIds?: string[] } {
  const { cuisineId, methodId, ...rest } = overrides as Record<string, unknown>;
  const ids = [cuisineId, methodId].filter(
    (id): id is string => typeof id === 'string',
  );
  return (ids.length > 0 ? { ...rest, tagIds: ids } : rest) as never;
}
