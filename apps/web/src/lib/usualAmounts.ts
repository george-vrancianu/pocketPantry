import { UNITS, type Unit } from './catalog';

/** How a catalog Ingredient is bought: decides which Usual Amounts it offers. */
export const AMOUNT_SCALES = ['low', 'medium', 'large'] as const;
export type AmountScale = (typeof AMOUNT_SCALES)[number];

type UnitFamily = 'mass' | 'volume' | 'count';

const FAMILY: Record<Unit, UnitFamily> = {
  g: 'mass',
  kg: 'mass',
  ml: 'volume',
  l: 'volume',
  pcs: 'count',
};

/** How many base units one of each unit is: grams, millilitres, pieces. */
const PER_BASE: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  pcs: 1,
};

/** Usual amounts in base units (g, ml, pcs), in priority order: the first survive longest in a narrow row. */
const PRIORITY: Record<UnitFamily, Record<AmountScale, readonly number[]>> = {
  mass: {
    low: [10, 50, 20, 100, 5, 30, 25, 75, 15],
    medium: [250, 500, 100, 1000, 200, 300, 750, 400, 150],
    large: [1000, 2000, 500, 5000, 1500, 3000, 2500, 4000],
  },
  volume: {
    low: [10, 50, 20, 100, 5, 30, 15, 25, 75],
    medium: [250, 500, 100, 1000, 200, 330, 750, 150, 400],
    large: [1000, 2000, 500, 5000, 1500, 3000, 2500, 4000],
  },
  count: {
    low: [1, 2, 3, 4, 6, 5],
    medium: [6, 12, 1, 2, 10, 4, 3, 8],
    large: [12, 24, 6, 30, 18, 10, 20, 15],
  },
};

/** The units a unit may be changed to: its own family, or every unit when there is none yet. */
export function unitsInFamily(unit: Unit | ''): readonly Unit[] {
  if (unit === '') return UNITS;
  return UNITS.filter((other) => FAMILY[other] === FAMILY[unit]);
}

/** Rounds away binary noise from division and repeated steps. */
function clean(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Usual Amounts from the unit alone, for anything without an Amount Scale (Unmatched names, the
 * amount sheet), in the unit shown and in priority order.
 */
const UNIT_ONLY: Record<Unit, readonly number[]> = {
  g: [250, 500, 100, 1000, 50, 750, 200, 150, 300],
  ml: [250, 500, 100, 1000, 50, 750, 200, 150, 300],
  kg: [1, 2, 3, 4, 5],
  l: [1, 2, 3, 4, 5],
  pcs: [1, 2, 3, 4, 6, 12],
};

/** The Usual Amounts displayed in `unit`, in priority order: the scale's, or the unit's alone without one. */
export function usualAmountsInPriority(
  unit: Unit,
  scale: AmountScale | null | undefined,
): number[] {
  if (!scale) return [...UNIT_ONLY[unit]];
  return PRIORITY[FAMILY[unit]][scale].map((base) =>
    clean(base / PER_BASE[unit]),
  );
}

/** The Usual Amounts displayed in `unit`, sorted ascending. */
export function usualAmountsAscending(
  unit: Unit,
  scale: AmountScale | null | undefined,
): number[] {
  return [...usualAmountsInPriority(unit, scale)].sort((a, b) => a - b);
}

/**
 * Rescales a number between two units of the same family; the amount stays the same. Rounded to three
 * decimals, the most the server stores, so 2.5 g is 0.003 kg. A non-zero amount that would round to zero
 * keeps its unrounded value, so the validator flags it instead of storing 0.
 */
export function convertQuantity(value: number, from: Unit, to: Unit): number {
  const exact = (value * PER_BASE[from]) / PER_BASE[to];
  const rounded = Math.round(exact * 1000) / 1000;
  return rounded === 0 && value !== 0 ? exact : rounded;
}

/** A number typed with a comma or a dot as the decimal mark; null when there is no number. */
export function parseTypedNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  return Number(trimmed);
}

/** The step for typing and arrow keys: pieces by 1, and a field with no unit by 1 too. */
const STEP: Record<Unit, number> = { g: 10, kg: 0.1, ml: 10, l: 0.1, pcs: 1 };

/** Up or down by one step in `unit`, or five with Shift; never below zero. */
export function stepAmount(
  value: number,
  direction: 1 | -1,
  unit: Unit | '',
  shift: boolean,
): number {
  const step = unit ? STEP[unit] : 1;
  return Math.max(0, clean(value + direction * step * (shift ? 5 : 1)));
}
