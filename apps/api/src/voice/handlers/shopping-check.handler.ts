import { ShoppingService } from '../../shopping/shopping.service';
import { amountOf, hasSubject, subjectOf } from '../voice-actions';
import {
  skippingKnownErrors,
  type VoiceActionHandler,
} from '../voice-handlers';
import {
  currentShoppingTarget,
  resolveShoppingTarget,
} from './shopping-target';

/**
 * "Got bread": checks the item; "got two milks" also sets its quantity. With
 * nothing on the list it adds the item already checked (Review: "Add & check").
 * Already checked counts as applied.
 */
export function shoppingCheckHandler(
  shopping: ShoppingService,
): VoiceActionHandler {
  return {
    resolve: (draft, ctx) =>
      resolveShoppingTarget(draft, ctx, {
        prefer: { checked: false },
        addIfMissing: true,
      }),

    apply: (draft, ctx) =>
      skippingKnownErrors(async () => {
        if (!hasSubject(draft)) {
          return { applied: false, reason: 'voice.invalid_action' };
        }
        const { quantity, unit } = amountOf(draft);
        const target = await currentShoppingTarget(shopping, draft, ctx, {
          checked: false,
        });
        if (!target) {
          const { id } = await shopping.addInTransaction(
            ctx.tx,
            ctx.memberId,
            {
              ...subjectOf(draft, 'name'),
              ...(quantity === null || unit === null ? {} : { quantity, unit }),
              source: 'manual',
            },
            ctx.locale,
          );
          await shopping.setCheckedInTransaction(
            ctx.tx,
            ctx.memberId,
            id,
            true,
          );
          return { applied: true };
        }
        if (!target.checked) {
          await shopping.setCheckedInTransaction(
            ctx.tx,
            ctx.memberId,
            target.id,
            true,
          );
        }
        const keptUnit = draft.unit ?? target.unit ?? 'pcs';
        if (
          quantity !== null &&
          (target.quantity !== quantity || target.unit !== keptUnit)
        ) {
          await shopping.setAmountInTransaction(
            ctx.tx,
            ctx.memberId,
            target.id,
            {
              quantity,
              unit: keptUnit,
            },
          );
        }
        return { applied: true };
      }),
  };
}
