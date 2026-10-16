import { ApiException } from '../../common/api-exception';
import { normalizeName } from '../../catalog/normalize';
import { PantryService } from '../../pantry/pantry.service';
import type { VoiceActionDraft } from '../voice-actions';
import type { VoiceActionHandler } from '../voice-handlers';
import { batchesOfDraft, rowOf } from './pantry-matching';
import {
  planPicked,
  planRemoval,
  type PlanBatch,
  type RemovalStep,
} from './pantry-removal';

/**
 * Pantry remove: "finished the milk" takes the Batch expiring soonest, "out
 * of milk" every Batch, "used 500 g" subtracts soonest-expiring first. What
 * does not fit needs a Batch picked in Review. Writes go through the Pantry's
 * normal delete and update paths, so Used Up and Running low behave as for a
 * manual remove.
 */
export function pantryRemoveHandler(pantry: PantryService): VoiceActionHandler {
  return {
    async resolve(draft, ctx) {
      const batches = batchesOfDraft(draft, await ctx.lists.pantryBatches());
      if (batches.length === 0) {
        return { status: 'notFound', rows: {}, defaults: {} };
      }
      const steps = planRemoval(draft, batches);
      if (steps === null) {
        return {
          status: 'needsBatch',
          rows: { batches: batches.map(rowOf) },
          defaults: {},
        };
      }
      const byId = new Map(batches.map((batch) => [batch.id, batch]));
      return {
        status: 'ready',
        rows: {
          batches: steps.map((step) => ({
            ...rowOf(byId.get(step.id) as (typeof batches)[number]),
            take: step.take,
          })),
        },
        defaults: {},
      };
    },

    async apply(draft, ctx) {
      const gone = {
        applied: false,
        reason: 'pantry.batch_not_found',
      } as const;
      let steps: RemovalStep[] | null;
      if (draft.batchId !== null || draft.batchIds.length > 0) {
        const ids = draft.batchId ? [draft.batchId] : draft.batchIds;
        const rows = await pantry.findBatchRows(ctx.tx, ctx.memberId, { ids });
        if (rows.length < new Set(ids).size) return gone;
        steps = draft.batchId
          ? [planPicked(draft, toPlan(rows[0]))]
          : planRemoval(draft, rows.map(toPlan));
      } else {
        const rows = await candidatesOf(pantry, draft, ctx);
        if (rows.length === 0) return gone;
        steps = planRemoval(draft, rows.map(toPlan));
      }
      if (steps === null) {
        return { applied: false, reason: 'voice.batch_required' };
      }
      try {
        for (const step of steps) {
          if (step.take !== null) {
            await pantry.updateInTransaction(ctx.tx, ctx.memberId, step.id, {
              quantity: step.remaining,
            });
          }
        }
        const deleted = steps.filter((step) => step.take === null);
        if (deleted.length > 0) {
          await pantry.removeInTransaction(
            ctx.tx,
            ctx.memberId,
            deleted.map((step) => step.id),
          );
        }
        return { applied: true };
      } catch (error) {
        if (error instanceof ApiException) {
          return { applied: false, reason: error.code };
        }
        throw error;
      }
    },
  };
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

/** The Batch rows (locked) the draft's Ingredient or Unmatched name has right now. */
export async function candidatesOf(
  pantry: PantryService,
  draft: Pick<VoiceActionDraft, 'ingredientId' | 'name'>,
  ctx: { memberId: string; tx: Parameters<PantryService['findBatchRows']>[0] },
) {
  if (draft.ingredientId !== null) {
    return pantry.findBatchRows(ctx.tx, ctx.memberId, {
      ingredientId: draft.ingredientId,
    });
  }
  if (draft.name === null) return [];
  const wanted = normalizeName(draft.name);
  const rows = await pantry.findBatchRows(ctx.tx, ctx.memberId, {
    unmatched: true,
  });
  return rows.filter((row) => normalizeName(row.rawName ?? '') === wanted);
}
