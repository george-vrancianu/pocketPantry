import type { TFunction } from 'i18next';
import type { RecipeDraftSummary } from './recipeDrafts';

/**
 * Where a Recipe Draft came from, for its row in the list (ADR 0028): the
 * link's domain, "Plate scan", or null for one started blank. The API works out
 * `origin` from the content's Source Link and `plateScan`.
 */
export function recipeDraftOriginLabel(
  origin: RecipeDraftSummary['origin'],
  t: TFunction<'recipes'>,
): string | null {
  if (origin === null) return null;
  if (origin.type === 'plate_scan') return t('recipeDraft.originPlateScan');
  return origin.domain.replace(/^www\./, '');
}
