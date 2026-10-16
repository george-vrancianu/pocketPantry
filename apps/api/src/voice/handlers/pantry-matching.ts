import { normalizeName } from '../../catalog/normalize';
import type { VoiceActionDraft, ResolvedBatchRow } from '../voice-actions';
import type { PantryService } from '../../pantry/pantry.service';
import type { PlanBatch } from './pantry-removal';
import type { VoiceListsView } from '../voice-handlers';

type ViewBatch = Awaited<ReturnType<VoiceListsView['pantryBatches']>>[number];

/** The one rule: a Match's Batches, or Unmatched Batches with the same normalized name. */
function belongsTo(
  draft: Pick<VoiceActionDraft, 'ingredientId' | 'name'>,
): (batch: { ingredientId: string | null; name: string }) => boolean {
  if (draft.ingredientId !== null) {
    return (batch) => batch.ingredientId === draft.ingredientId;
  }
  if (draft.name === null) return () => false;
  const wanted = normalizeName(draft.name);
  return (batch) =>
    batch.ingredientId === null && normalizeName(batch.name) === wanted;
}

/** The Batches a Voice Action is about: the Match's, or Unmatched ones of the same name. */
export function batchesOfDraft(
  draft: Pick<VoiceActionDraft, 'ingredientId' | 'name'>,
  all: ViewBatch[],
): ViewBatch[] {
  return all.filter(belongsTo(draft));
}

/** The Batch rows (locked) the draft's Ingredient or Unmatched name has right now. */
export async function candidatesOf(
  pantry: PantryService,
  draft: Pick<VoiceActionDraft, 'ingredientId' | 'name'>,
  ctx: { memberId: string; tx: Parameters<PantryService['findBatchRows']>[0] },
) {
  if (draft.ingredientId === null && draft.name === null) return [];
  const rows = await pantry.findBatchRows(
    ctx.tx,
    ctx.memberId,
    draft.ingredientId !== null
      ? { ingredientId: draft.ingredientId }
      : { unmatched: true },
  );
  const matches = belongsTo(draft);
  return rows.filter((row) =>
    matches({ ingredientId: row.ingredientId, name: row.rawName ?? '' }),
  );
}

export const toPlan = (row: {
  id: string;
  quantity: number | null;
  unit: PlanBatch['unit'];
  expiryDate: string | null;
}): PlanBatch => ({
  id: row.id,
  quantity: row.quantity,
  unit: row.unit,
  expiryDate: row.expiryDate,
});

export const rowOf = (batch: ViewBatch): ResolvedBatchRow => ({
  id: batch.id,
  name: batch.name,
  quantity: batch.quantity,
  unit: batch.unit,
  location: batch.location,
  expiresOn: batch.expiryDate,
});
