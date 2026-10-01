import { and, eq, inArray } from 'drizzle-orm';
import type { Database } from '../database/database.types';
import { catalogTranslations } from '../database/schema';
import { type CatalogLocale, FALLBACK_LOCALE } from './catalog.schemas';

export type EntityType =
  (typeof catalogTranslations.entityType.enumValues)[number];

export type DisplayNames = {
  /** The name in the requested locale, else English, else the canonical name. */
  pick: (type: EntityType, id: string, canonical: string) => string;
};

/** Loads display names for the given Catalog entities in `locale`, with the English fallback. */
export async function loadDisplayNames(
  database: Database,
  locale: CatalogLocale,
  entityIds: string[],
): Promise<DisplayNames> {
  const rows =
    entityIds.length === 0
      ? []
      : await database
          .select({
            entityType: catalogTranslations.entityType,
            entityId: catalogTranslations.entityId,
            locale: catalogTranslations.locale,
            value: catalogTranslations.value,
          })
          .from(catalogTranslations)
          .where(
            and(
              eq(catalogTranslations.kind, 'name'),
              inArray(catalogTranslations.locale, [locale, FALLBACK_LOCALE]),
              inArray(catalogTranslations.entityId, [...new Set(entityIds)]),
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
