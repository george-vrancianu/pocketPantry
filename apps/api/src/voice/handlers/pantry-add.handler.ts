import { ApiException } from '../../common/api-exception';
import { PantryService } from '../../pantry/pantry.service';
import { amountOf } from '../voice-actions';
import type { VoiceActionHandler } from '../voice-handlers';

/**
 * Pantry add: a Batch like a manual add. Resolve shows the Location and
 * expiry an unspoken value would take (Catalog default, Default Expiry), so
 * Review can show and edit them; Apply sends what Review settled on, and
 * anything still blank falls back the same way.
 */
export function pantryAddHandler(pantry: PantryService): VoiceActionHandler {
  return {
    async resolve(draft, ctx) {
      if (draft.ingredientId === null && draft.name === null) {
        return { status: 'notFound', rows: {}, defaults: {} };
      }
      const defaults = await pantry.addDefaults(
        ctx.memberId,
        draft.ingredientId,
        ctx.today,
      );
      return {
        status: 'ready',
        rows: {},
        defaults: {
          ...(defaults.location ? { location: defaults.location } : {}),
          ...(defaults.expiryDate && !draft.noExpiry
            ? { expiresOn: defaults.expiryDate }
            : {}),
        },
      };
    },

    async apply(draft, ctx) {
      if (draft.ingredientId === null && draft.name === null) {
        return { applied: false, reason: 'voice.invalid_action' };
      }
      const { quantity, unit } = amountOf(draft);
      try {
        await pantry.addInTransaction(
          ctx.tx,
          ctx.memberId,
          [
            {
              ...(draft.ingredientId === null
                ? { rawName: draft.name ?? '' }
                : { ingredientId: draft.ingredientId }),
              ...(quantity === null || unit === null ? {} : { quantity, unit }),
              ...(draft.location ? { location: draft.location } : {}),
              // null is "no expiry"; leaving it out is the Default Expiry.
              ...(draft.noExpiry
                ? { expiryDate: null }
                : draft.expiresOn
                  ? { expiryDate: draft.expiresOn }
                  : {}),
              source: 'manual',
            },
          ],
          ctx.locale,
          ctx.locale,
          ctx.today,
        );
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
