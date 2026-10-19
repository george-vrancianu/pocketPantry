import { PantryService } from '../../pantry/pantry.service';
import { RunningLowService } from '../../pantry/running-low.service';
import {
  skippingKnownErrors,
  type VoiceActionHandler,
} from '../voice-handlers';
import { batchesOfDraft, candidatesOf, rowOf } from './pantry-matching';

/**
 * Pantry Running low: flags an Ingredient the Pantry has a Batch of. A
 * matched Ingredient with no Batch becomes a Shopping List add, done by the
 * Shopping add handler. An Unmatched name is Not found (only adds may be
 * Unmatched).
 */
export function pantryRunningLowHandler(
  pantry: PantryService,
  runningLow: RunningLowService,
  shoppingAdd: VoiceActionHandler,
): VoiceActionHandler {
  return {
    async resolve(draft, ctx) {
      if (draft.ingredientId === null) {
        return { status: 'notFound', rows: {}, defaults: {} };
      }
      const batches = batchesOfDraft(draft, await ctx.lists.pantryBatches());
      return {
        status: 'ready',
        rows:
          batches.length > 0
            ? { batches: batches.map(rowOf) }
            : { shoppingFallback: true },
        defaults: {},
      };
    },

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        if (draft.ingredientId === null) {
          return { applied: false, reason: 'voice.invalid_action' };
        }
        const ingredientId = draft.ingredientId;
        const rows = await candidatesOf(pantry, draft, ctx);
        if (rows.length > 0) {
          const flagged = await runningLow.setIn(
            ctx.tx,
            ctx.memberId,
            ingredientId,
          );
          return {
            applied: true,
            list: 'pantry',
            rowId: rows[0].id,
            alreadyDone: !flagged,
          };
        }
        return shoppingAdd.apply(
          {
            ...draft,
            target: 'shopping',
            op: 'add',
            quantity: null,
            unit: null,
          },
          ctx,
        );
      }),
  };
}
