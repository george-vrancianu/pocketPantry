import { normalizeName } from '../../catalog/normalize';
import { ApiException } from '../../common/api-exception';
import { ShoppingService } from '../../shopping/shopping.service';
import { amountOf } from '../voice-actions';
import type { VoiceActionHandler } from '../voice-handlers';

/**
 * Shopping add: merges by the Shopping List's usual add rules (same Ingredient
 * or Unmatched name, same unit, quantities summed). An Unmatched name is added
 * and queued for curation by the Shopping List service.
 */
export function shoppingAddHandler(
  shopping: ShoppingService,
): VoiceActionHandler {
  return {
    async resolve(draft, ctx) {
      const items = await ctx.lists.shoppingItems();
      const wanted = draft.name === null ? null : normalizeName(draft.name);
      const target = items
        .filter((item) =>
          draft.ingredientId !== null
            ? item.ingredientId === draft.ingredientId
            : item.ingredientId === null &&
              wanted !== null &&
              normalizeName(item.name) === wanted,
        )
        .find((item) => item.unit === amountOf(draft).unit);
      return {
        status: 'ready',
        rows: { shoppingItem: target ?? null },
        defaults: {},
      };
    },

    async apply(draft, ctx) {
      if (draft.ingredientId === null && draft.name === null) {
        return { applied: false, reason: 'voice.invalid_action' };
      }
      const { quantity, unit } = amountOf(draft);
      try {
        await shopping.addInTransaction(
          ctx.tx,
          ctx.memberId,
          {
            ...(draft.ingredientId === null
              ? { name: draft.name ?? '' }
              : { ingredientId: draft.ingredientId }),
            ...(quantity === null || unit === null ? {} : { quantity, unit }),
            // Queued for curation like any typed name.
            source: 'manual',
          },
          ctx.locale,
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
