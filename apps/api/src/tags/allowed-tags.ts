import { catalogScope } from '../catalog/catalog-scope';
import type { CatalogLocale } from '../catalog/catalog.schemas';
import type { Executor } from '../database/database.types';
import type { AllowedTags } from './ai-tags';
import { loadPickableTags } from './recipe-tags';

/**
 * Loads the allowed Tags for `familyId`. Catalog Tags come first, in the order the pickers use,
 * and the Family's Tags last: the Catalog part of the text is then identical for every Family
 * reading in a language, so a provider's prompt cache still matches up to where the Family's
 * own Tags begin, and a Family adding a Tag never shifts a Catalog Tag's index.
 */
export async function loadAllowedTags(
  executor: Executor,
  familyId: string,
  locale: CatalogLocale,
): Promise<AllowedTags> {
  const pickable = await loadPickableTags(
    executor,
    catalogScope(familyId),
    locale,
    familyId,
  );
  const ordered = [
    ...pickable.filter((tag) => tag.kind === 'catalog'),
    ...pickable.filter((tag) => tag.kind === 'family'),
  ];
  return { tags: ordered.map(({ id, name }) => ({ id, name })) };
}
