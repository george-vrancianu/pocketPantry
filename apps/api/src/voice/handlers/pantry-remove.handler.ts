import { PantryService } from '../../pantry/pantry.service';
import { sameSubject } from '../voice-actions';
import {
  skippingKnownErrors,
  type VoiceActionHandler,
} from '../voice-handlers';
import { batchesOfDraft, candidatesOf, rowOf, toPlan } from './pantry-matching';
import { planPicked, planRemoval, type RemovalStep } from './pantry-removal';

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
          // Each candidate shows what picking it does: the whole Batch, or an amount.
          rows: {
            batches: batches.map((batch) => ({
              ...rowOf(batch),
              take: planPicked(draft, toPlan(batch)).take,
            })),
          },
          defaults: {},
        };
      }
      const byId = new Map(batches.map((batch) => [batch.id, batch]));
      return {
        status: 'ready',
        rows: {
          batches: steps.flatMap((step) => {
            const batch = byId.get(step.id);
            return batch ? [{ ...rowOf(batch), take: step.take }] : [];
          }),
        },
        defaults: {},
      };
    },

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        const gone = {
          applied: false,
          reason: 'pantry.batch_not_found',
        } as const;
        let steps: RemovalStep[] | null;
        let loaded: { id: string; location: string }[];
        if (draft.batchId !== null || draft.batchIds.length > 0) {
          const ids = draft.batchId ? [draft.batchId] : draft.batchIds;
          const found = await pantry.findBatchRows(ctx.tx, ctx.memberId, {
            ids,
          });
          // Ids come from the client: only this Ingredient's own Batches count.
          const matches = sameSubject(draft);
          const rows = found.filter((row) =>
            matches({
              ingredientId: row.ingredientId,
              name: row.rawName ?? '',
            }),
          );
          if (rows.length < new Set(ids).size) return gone;
          loaded = rows;
          steps = draft.batchId
            ? [planPicked(draft, toPlan(rows[0]))]
            : planRemoval(draft, rows.map(toPlan));
        } else {
          const rows = await candidatesOf(pantry, draft, ctx);
          if (rows.length === 0) return gone;
          loaded = rows;
          steps = planRemoval(draft, rows.map(toPlan));
        }
        if (steps === null) {
          return { applied: false, reason: 'voice.batch_required' };
        }
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
        // A deleted Batch is gone and cannot flash. Each Location the removal touched is its own
        // roll-up row on the Pantry page, so name one Batch still there in each: the reduced one,
        // else any left of the same Ingredient in that Location.
        const locationOf = new Map(loaded.map((row) => [row.id, row.location]));
        // Read lazily: only a Location with no reduced Batch needs the lookup (deletions are in this transaction).
        let left: Awaited<ReturnType<typeof candidatesOf>> | undefined;
        const rowIds: string[] = [];
        const reduced = steps.filter((step) => step.take !== null);
        for (const step of reduced) rowIds.push(step.id);
        const covered = new Set(reduced.map((step) => locationOf.get(step.id)));
        for (const step of deleted) {
          const location = locationOf.get(step.id);
          if (covered.has(location)) continue;
          left ??= await candidatesOf(pantry, draft, ctx);
          const survivor = left.find((row) => row.location === location);
          if (survivor) {
            rowIds.push(survivor.id);
            covered.add(location);
          }
        }
        return {
          applied: true,
          list: 'pantry',
          ...(rowIds.length > 0 ? { rowId: rowIds[0], rowIds } : {}),
          alreadyDone: false,
        };
      }),
  };
}
