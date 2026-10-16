import { normalizeName } from '../../catalog/normalize';
import type { VoiceActionDraft, ResolvedBatchRow } from '../voice-actions';
import type { VoiceListsView } from '../voice-handlers';

type ViewBatch = Awaited<ReturnType<VoiceListsView['pantryBatches']>>[number];

/** The Batches a Voice Action is about: the Match's, or Unmatched ones of the same name. */
export function batchesOfDraft(
  draft: Pick<VoiceActionDraft, 'ingredientId' | 'name'>,
  all: ViewBatch[],
): ViewBatch[] {
  if (draft.ingredientId !== null) {
    return all.filter((batch) => batch.ingredientId === draft.ingredientId);
  }
  if (draft.name === null) return [];
  const wanted = normalizeName(draft.name);
  return all.filter(
    (batch) =>
      batch.ingredientId === null && normalizeName(batch.name) === wanted,
  );
}

export const rowOf = (batch: ViewBatch): ResolvedBatchRow => ({
  id: batch.id,
  name: batch.name,
  quantity: batch.quantity,
  unit: batch.unit,
  location: batch.location,
  expiresOn: batch.expiryDate,
});
