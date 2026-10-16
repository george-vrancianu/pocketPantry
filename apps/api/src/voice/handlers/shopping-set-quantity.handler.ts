import { ShoppingService } from '../../shopping/shopping.service';
import { amountOf } from '../voice-actions';
import type { VoiceActionHandler } from '../voice-handlers';
import {
  currentShoppingTarget,
  hasSubject,
  resolveShoppingTarget,
  skippingKnownErrors,
} from './shopping-target';

/** "Make the eggs twelve": replaces the quantity and unit of the item on the list. */
export function shoppingSetQuantityHandler(
  shopping: ShoppingService,
): VoiceActionHandler {
  return {
    resolve: (draft, ctx) => resolveShoppingTarget(draft, ctx),

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        if (!hasSubject(draft) || draft.quantity === null) {
          return { applied: false, reason: 'voice.invalid_action' };
        }
        const target = await currentShoppingTarget(shopping, draft, ctx);
        if (!target) return { applied: false, reason: 'voice.item_not_found' };
        const { quantity, unit } = amountOf(draft);
        // Already that amount: nothing to do, which counts as applied.
        if (target.quantity !== quantity || target.unit !== unit) {
          await shopping.setAmountInTransaction(
            ctx.tx,
            ctx.memberId,
            target.id,
            {
              quantity: quantity ?? undefined,
              unit: unit ?? undefined,
            },
          );
        }
        return { applied: true };
      }),
  };
}
