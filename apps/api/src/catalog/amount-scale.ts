import { seedId } from './seed/seed-ids';

/**
 * How much of an Ingredient a Member usually buys at once. Stored on the catalog
 * Ingredient (nullable); a missing value reads back as medium.
 */
export const AMOUNT_SCALES = ['low', 'medium', 'large'] as const;
export type AmountScale = (typeof AMOUNT_SCALES)[number];

export const DEFAULT_AMOUNT_SCALE: AmountScale = 'medium';

/**
 * Default Amount Scale per Parent Category, keyed by the Parent's stable id. A
 * Parent not listed here, including the top-level "other" Parent, uses medium.
 * This is the one TypeScript source for the mapping; the migration that adds the
 * column (drizzle/0019_amount_scale.sql) carries the same ids, and a test checks
 * the two agree.
 */
const PARENT_AMOUNT_SCALE: Readonly<Record<string, AmountScale>> = {
  [seedId.parent('spices')]: 'low',
  [seedId.parent('bakery')]: 'medium',
  [seedId.parent('dairy')]: 'medium',
  [seedId.parent('eggs')]: 'medium',
  [seedId.parent('grains')]: 'medium',
  [seedId.parent('meat')]: 'medium',
  [seedId.parent('pasta')]: 'medium',
  [seedId.parent('oils')]: 'large',
  [seedId.parent('produce')]: 'large',
};

/** The default scale for a Parent Category, by its id. */
export function amountScaleForParent(parentId: string): AmountScale {
  return PARENT_AMOUNT_SCALE[parentId] ?? DEFAULT_AMOUNT_SCALE;
}

/** The scale a stored value reads back as: null (never set) is medium. */
export function readAmountScale(stored: AmountScale | null): AmountScale {
  return stored ?? DEFAULT_AMOUNT_SCALE;
}
