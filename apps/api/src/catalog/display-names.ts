import { and, eq, inArray } from 'drizzle-orm';
import type { Executor } from '../database/database.types';
import { catalogEntityType } from '../database/schema';
import type { CatalogScope } from './catalog-scope';
import { type CatalogLocale, FALLBACK_LOCALE } from './catalog.schemas';

export type EntityType = (typeof catalogEntityType.enumValues)[number];

export type DisplayNames = {
  /** The name in the requested locale, else English, else the canonical name. */
  pick: (type: EntityType, id: string, canonical: string) => string;
};

/** Loads display names for the given Catalog entities in `locale`, with the English fallback. */
export async function loadDisplayNames(
  database: Executor,
  scope: CatalogScope,
  locale: CatalogLocale,
  entityIds: string[],
): Promise<DisplayNames> {
  const translations = scope.translations(database);
  const rows =
    entityIds.length === 0
      ? []
      : await database
          .select({
            entityType: translations.entityType,
            entityId: translations.entityId,
            locale: translations.locale,
            value: translations.value,
          })
          .from(translations)
          .where(
            and(
              eq(translations.kind, 'name'),
              inArray(translations.locale, [locale, FALLBACK_LOCALE]),
              inArray(translations.entityId, [...new Set(entityIds)]),
            ),
          );
  const byKey = new Map(
    rows.map((row) => [
      `${row.entityType}:${row.entityId}:${row.locale}`,
      row.value,
    ]),
  );
  return {
    pick: (type, id, canonical) =>
      byKey.get(`${type}:${id}:${locale}`) ??
      byKey.get(`${type}:${id}:${FALLBACK_LOCALE}`) ??
      canonical,
  };
}
