import { normalizeName } from '../../catalog/normalize';
import type { ShoppingService } from '../../shopping/shopping.service';
import {
  amountOf,
  sameSubject,
  type VoiceActionDraft,
  type VoiceUnit,
} from '../voice-actions';
import type {
  ApplyContext,
  ResolveContext,
  Resolution,
} from '../voice-handlers';

/** A Shopping Item as the Shopping handlers compare it. */
type ShoppingRow = {
  id: string;
  ingredientId: string | null;
  normalizedName: string | null;
  quantity: number | null;
  unit: VoiceUnit | null;
  checked: boolean;
};

/**
 * The Shopping Item a Voice Action acts on: the one for the matched Ingredient,
 * or the same normalised Unmatched name. When several lines share it (different
 * units) the one in the spoken unit wins, then one that still has something to
 * do (`prefer` checked state), then the oldest. `items` are oldest first.
 */
function findShoppingTarget<T extends ShoppingRow>(
  items: readonly T[],
  draft: Pick<VoiceActionDraft, 'ingredientId' | 'name' | 'quantity' | 'unit'>,
  prefer?: { checked: boolean },
): T | null {
  const same = sameSubject(draft);
  const candidates = items.filter((item) =>
    same({ ingredientId: item.ingredientId, name: item.normalizedName ?? '' }),
  );
  const unit = draft.quantity === null ? null : amountOf(draft).unit;
  const rank = (item: T) =>
    (unit !== null && item.unit === unit ? 0 : 2) +
    (prefer && item.checked === prefer.checked ? 0 : 1);
  return (
    candidates
      .map((item, index) => ({ item, index }))
      .sort((a, b) => rank(a.item) - rank(b.item) || a.index - b.index)[0]
      ?.item ?? null
  );
}

const toRow = (item: {
  id: string;
  ingredientId: string | null;
  normalizedName: string | null;
  quantity: string | number | null;
  unit: VoiceUnit | null;
  checked: boolean;
}): ShoppingRow => ({
  ...item,
  quantity: item.quantity === null ? null : Number(item.quantity),
});

/**
 * Resolve for the ops that act on an existing Shopping Item. `addIfMissing`
 * (check) stays ready without a row, since it becomes an add; the others have
 * nothing to act on and read as Not found.
 */
export async function resolveShoppingTarget(
  draft: VoiceActionDraft,
  ctx: ResolveContext,
  options: { prefer?: { checked: boolean }; addIfMissing?: boolean } = {},
): Promise<Resolution> {
  const items = (await ctx.lists.shoppingItems()).map((item) => ({
    ...item,
    normalizedName:
      item.ingredientId === null ? normalizeName(item.name) : null,
  }));
  const target = findShoppingTarget(items, draft, options.prefer);
  return {
    status: target === null && !options.addIfMissing ? 'notFound' : 'ready',
    rows: { shoppingItem: target },
    defaults: {},
  };
}

/** The same Shopping Item, found again against the current list inside Apply. */
export async function currentShoppingTarget(
  shopping: ShoppingService,
  draft: VoiceActionDraft,
  ctx: ApplyContext,
  prefer?: { checked: boolean },
): Promise<ShoppingRow | null> {
  const items = (await shopping.itemsInTransaction(ctx.tx, ctx.memberId)).map(
    toRow,
  );
  return findShoppingTarget(items, draft, prefer);
}
