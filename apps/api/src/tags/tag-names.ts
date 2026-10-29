import { and, eq, isNull } from 'drizzle-orm';
import { ApiException } from '../common/api-exception';
import { normalizeName } from '../catalog/normalize';
import type { Executor } from '../database/database.types';
import { catalogTranslations, tags } from '../database/schema';

/** Longest Tag name (ADR 0033), counted after trimming. */
export const MAX_TAG_NAME_LENGTH = 30;

/**
 * What a Member typed as a Tag name, cleaned and checked: trimmed, inner whitespace collapsed,
 * not empty and at most 30 characters. Errors `tags.name_required` / `tags.name_too_long {max}`.
 */
export function cleanTagName(raw: string): {
  name: string;
  normalized: string;
} {
  const name = raw.trim().replace(/\s+/g, ' ');
  const normalized = normalizeName(name);
  if (normalized === '') throw new ApiException(400, 'tags.name_required');
  if ([...name].length > MAX_TAG_NAME_LENGTH) {
    throw new ApiException(400, 'tags.name_too_long', {
      max: MAX_TAG_NAME_LENGTH,
    });
  }
  return { name, normalized };
}

/** The Catalog Tag whose source name or any shared translation has this normalized name. */
export async function findCatalogTag(
  executor: Executor,
  normalized: string,
): Promise<string | null> {
  const [byName] = await executor
    .select({ id: tags.id })
    .from(tags)
    .where(and(isNull(tags.familyId), eq(tags.normalizedName, normalized)));
  if (byName) return byName.id;
  // Display names and shared Synonyms in every language; a Family's own Synonyms do not count.
  const [byTranslation] = await executor
    .select({ id: catalogTranslations.entityId })
    .from(catalogTranslations)
    .innerJoin(tags, eq(tags.id, catalogTranslations.entityId))
    .where(
      and(
        eq(catalogTranslations.entityType, 'tag'),
        eq(catalogTranslations.normalizedValue, normalized),
        isNull(catalogTranslations.ownerFamilyId),
        isNull(tags.familyId),
      ),
    )
    .orderBy(catalogTranslations.entityId)
    .limit(1);
  return byTranslation?.id ?? null;
}

/** The Family's own Tag with this normalized name. */
export async function findFamilyTag(
  executor: Executor,
  familyId: string,
  normalized: string,
): Promise<string | null> {
  const [row] = await executor
    .select({ id: tags.id })
    .from(tags)
    .where(
      and(eq(tags.familyId, familyId), eq(tags.normalizedName, normalized)),
    );
  return row?.id ?? null;
}
