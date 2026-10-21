import type { ingredientUnit } from '../../database/schema';

export type Unit = (typeof ingredientUnit.enumValues)[number];
export type Dimension = 'mass' | 'volume' | 'count';

/** The dimension of each unit and its factor to the dimension's base unit (g, ml, pcs). */
export const UNITS: Record<Unit, { dimension: Dimension; factor: number }> = {
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

/** Whether two units can be added together: the same unit, or two of one dimension (g/kg, ml/l). A missing unit only matches a missing unit. */
export function unitsMerge(a: Unit | null, b: Unit | null): boolean {
  if (a === null || b === null) return a === b;
  return UNITS[a].dimension === UNITS[b].dimension;
}

/** `quantity` of unit `from` expressed in unit `to`; null when the units are in different dimensions. */
export function convertQuantity(
  quantity: number,
  from: Unit,
  to: Unit,
): number | null {
  const base = toComparable(quantity, from);
  return base && fromComparable(base.amount, base.dimension, to);
}

/** A quantity rounded to 3 decimals, so float noise never reaches the DB or a comparison. */
export const roundQuantity = (value: number): number =>
  Math.round(value * 1000) / 1000;

/**
 * The quantity expressed in the target unit (500 g + 1 kg = 1500 g), rounded
 * to 3 decimals. Callers pass units that unitsMerge accepted, so a conversion
 * exists; a missing quantity or unit, or the same unit, passes through.
 */
export function quantityInUnit(
  quantity: number | null,
  from: Unit | null,
  to: Unit | null,
): number | null {
  if (quantity === null || from === null || to === null || from === to) {
    return quantity;
  }
  const converted = convertQuantity(quantity, from, to);
  if (converted === null) throw new Error('units do not convert');
  return roundQuantity(converted);
}
