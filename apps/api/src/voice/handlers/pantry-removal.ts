import type { VoiceUnit } from '../voice-actions';

/** What the removal rules need to know of a Batch. */
export type PlanBatch = {
  id: string;
  quantity: number | null;
  unit: VoiceUnit | null;
  expiryDate: string | null;
};

/**
 * One Batch of a removal. `take: null` deletes it; a number is the amount
 * subtracted, leaving `remaining` (always above zero).
 */
export type RemovalStep =
  { id: string; take: null } | { id: string; take: number; remaining: number };

type Ask = {
  quantity: number | null;
  unit: VoiceUnit | null;
  scope: 'one' | 'all' | null;
};

/** Batch quantities have three decimals; this keeps 0.1 + 0.2 from missing 0.3. */
const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * The removal rules over a Family's Batches of one Ingredient, soonest expiry
 * first (undated last): "all" takes every Batch; no amount takes the first;
 * an amount in the Batches' unit is subtracted soonest first, deleting what
 * reaches zero and carrying the remainder over. Anything else (another unit,
 * a Batch without an amount, more than there is) returns null: Review must
 * ask which Batch.
 */
export function planRemoval(
  ask: Ask,
  batches: PlanBatch[],
): RemovalStep[] | null {
  if (batches.length === 0) return null;
  if (ask.scope === 'all') {
    return batches.map((batch) => ({ id: batch.id, take: null }));
  }
  if (ask.quantity === null) return [{ id: batches[0].id, take: null }];

  const fits = batches.every(
    (batch) => batch.quantity !== null && batch.unit === ask.unit,
  );
  if (!fits) return null;
  let left = round(ask.quantity);
  const steps: RemovalStep[] = [];
  for (const batch of batches) {
    if (left <= 0) break;
    const have = round(batch.quantity as number);
    if (have <= left) {
      steps.push({ id: batch.id, take: null });
      left = round(left - have);
    } else {
      steps.push({ id: batch.id, take: left, remaining: round(have - left) });
      left = 0;
    }
  }
  return left > 0 ? null : steps;
}

/** A Batch picked in Review: the amount comes off it when it fits, otherwise the Batch goes. */
export function planPicked(ask: Ask, batch: PlanBatch): RemovalStep {
  if (
    ask.quantity !== null &&
    batch.quantity !== null &&
    batch.unit === ask.unit &&
    round(batch.quantity) > round(ask.quantity)
  ) {
    return {
      id: batch.id,
      take: round(ask.quantity),
      remaining: round(batch.quantity - ask.quantity),
    };
  }
  return { id: batch.id, take: null };
}
