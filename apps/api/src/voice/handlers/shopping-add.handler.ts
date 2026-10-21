import { unitsMerge } from '../../recipes/matching/units';
import { ShoppingService } from '../../shopping/shopping.service';
import { amountOf, hasSubject, sameSubject, subjectOf } from '../voice-actions';
import {
  skippingKnownErrors,
  type VoiceActionHandler,
} from '../voice-handlers';

/**
 * Shopping add: merges by the Shopping List's usual add rules (same Ingredient
 * or Unmatched name, same or convertible unit (g/kg, ml/l), quantities summed). An Unmatched name is added
 * and queued for curation by the Shopping List service.
 */
export function shoppingAddHandler(
  shopping: ShoppingService,
): VoiceActionHandler {
  return {
    async resolve(draft, ctx) {
      const same = sameSubject(draft);
      const target = (await ctx.lists.shoppingItems()).find(
        (item) => same(item) && unitsMerge(item.unit, amountOf(draft).unit),
      );
      return {
        status: 'ready',
        rows: { shoppingItem: target ?? null },
        defaults: {},
      };
    },

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        if (!hasSubject(draft)) {
          return { applied: false, reason: 'voice.invalid_action' };
        }
        const { quantity, unit } = amountOf(draft);
        const { id } = await shopping.addInTransaction(
          ctx.tx,
          ctx.memberId,
          {
            ...subjectOf(draft, 'name'),
            ...(quantity === null || unit === null ? {} : { quantity, unit }),
            // Queued for curation like any typed name.
            source: 'manual',
          },
          // The Unmatched name is written in the UI locale (the read prompt asks
          // for it), so that is the queue's source language.
          ctx.locale,
        );
        return {
          applied: true,
          list: 'shopping',
          rowId: id,
          alreadyDone: false,
        };
      }),
  };
}
