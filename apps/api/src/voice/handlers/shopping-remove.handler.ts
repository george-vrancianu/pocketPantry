import { ShoppingService } from '../../shopping/shopping.service';
import { hasSubject } from '../voice-actions';
import {
  skippingKnownErrors,
  type VoiceActionHandler,
} from '../voice-handlers';
import {
  currentShoppingTarget,
  resolveShoppingTarget,
} from './shopping-target';

/**
 * "Take milk off": removes the item through the Shopping List's own remove, so
 * its Source Recipes go with it as when removed by hand. Already gone (removed
 * by someone else) counts as applied.
 */
export function shoppingRemoveHandler(
  shopping: ShoppingService,
): VoiceActionHandler {
  return {
    resolve: (draft, ctx) => resolveShoppingTarget(draft, ctx),

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        if (!hasSubject(draft)) {
          return { applied: false, reason: 'voice.invalid_action' };
        }
        const target = await currentShoppingTarget(shopping, draft, ctx);
        if (target) {
          await shopping.removeInTransaction(ctx.tx, ctx.memberId, target.id);
        }
        return { applied: true };
      }),
  };
}
