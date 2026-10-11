import type { ingredientUnit } from '../../database/schema';

export type Unit = (typeof ingredientUnit.enumValues)[number];
export type Dimension = 'mass' | 'volume' | 'count';

/** The dimension of each unit and its factor to the dimension's base unit (g, ml, pcs). */
const UNITS: Record<Unit, { dimension: Dimension; factor: number }> = {
  g: { dimension: 'mass', factor: 1 },
  kg: { dimension: 'mass', factor: 1000 },
  ml: { dimension: 'volume', factor: 1 },
  l: { dimension: 'volume', factor: 1000 },
  pcs: { dimension: 'count', factor: 1 },
};

export type Comparable = { dimension: Dimension; amount: number };

/**
 * A quantity in its dimension's base unit, so amounts of one dimension add up
 * and compare. Null when there is nothing to compare (no quantity or no unit).
 * Mass, volume and count never convert into each other.
 */
export function toComparable(
  quantity: number | null,
  unit: Unit | null,
): Comparable | null {
  if (quantity === null || unit === null) return null;
  const { dimension, factor } = UNITS[unit];
  return { dimension, amount: quantity * factor };
}

/** A base-unit amount expressed in `unit`; null when `unit` is in another dimension. */
export function fromComparable(
  amount: number,
  dimension: Dimension,
  unit: Unit,
): number | null {
  const target = UNITS[unit];
  return target.dimension === dimension ? amount / target.factor : null;
}
