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

/** "Didn't get the eggs": unchecks the item. Already unchecked counts as applied. */
export function shoppingUncheckHandler(
  shopping: ShoppingService,
): VoiceActionHandler {
  return {
    resolve: (draft, ctx) =>
      resolveShoppingTarget(draft, ctx, { prefer: { checked: true } }),

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        if (!hasSubject(draft)) {
          return { applied: false, reason: 'voice.invalid_action' };
        }
        const target = await currentShoppingTarget(shopping, draft, ctx, {
          checked: true,
        });
        if (!target) return { applied: false, reason: 'voice.item_not_found' };
        if (target.checked) {
          await shopping.setCheckedInTransaction(
            ctx.tx,
            ctx.memberId,
            target.id,
            false,
          );
        }
        return { applied: true };
      }),
  };
}
