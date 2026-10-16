import {
  fromComparable,
  toComparable,
  type Dimension,
} from '../../recipes/matching/units';
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
 * an amount in the Batches' dimension (g and kg, ml and l convert) is subtracted soonest first, deleting what
 * reaches zero and carrying the remainder over. Anything else (another kind of unit,
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

  const asked = toComparable(ask.quantity, ask.unit);
  if (asked === null) return null;
  const have = batches.map((batch) => measure(batch, asked.dimension));
  if (have.some((amount) => amount === null)) return null;
  let left = round(asked.amount);
  const steps: RemovalStep[] = [];
  for (const [index, batch] of batches.entries()) {
    if (left <= 0) break;
    const size = round(have[index] as number);
    if (size <= left) {
      steps.push({ id: batch.id, take: null });
      left = round(left - size);
    } else {
      steps.push(partOf(batch, left, size - left));
      left = 0;
    }
  }
  return left > 0 ? null : steps;
}

/** A Batch picked in Review: the amount comes off it when it fits, otherwise the Batch goes. */
export function planPicked(ask: Ask, batch: PlanBatch): RemovalStep {
  const asked = toComparable(ask.quantity, ask.unit);
  const size = asked && measure(batch, asked.dimension);
  if (asked && size !== null && round(size) > round(asked.amount)) {
    return partOf(
      batch,
      round(asked.amount),
      round(size) - round(asked.amount),
    );
  }
  return { id: batch.id, take: null };
}

/** The Batch's amount in its dimension's base unit; null when it has none or is another dimension. */
function measure(batch: PlanBatch, dimension: Dimension): number | null {
  const own = toComparable(batch.quantity, batch.unit);
  return own !== null && own.dimension === dimension ? own.amount : null;
}

/** A base-unit amount in the Batch's own unit (g and kg, ml and l are one dimension). */
function inUnitOf(batch: PlanBatch, amount: number): number {
  const unit = batch.unit as VoiceUnit;
  return round(
    fromComparable(amount, toComparable(1, unit)!.dimension, unit) as number,
  );
}

/** Part of a Batch comes off; a remainder that rounds to zero deletes it (quantity must stay above zero). */
function partOf(
  batch: PlanBatch,
  take: number,
  remaining: number,
): RemovalStep {
  const left = inUnitOf(batch, remaining);
  return left > 0
    ? { id: batch.id, take: inUnitOf(batch, take), remaining: left }
    : { id: batch.id, take: null };
}
