/**
 * How much of an Ingredient a Member usually buys at once. Stored on the catalog
 * Ingredient (nullable); a missing value reads back as medium.
 */
export const AMOUNT_SCALES = ['low', 'medium', 'large'] as const;
export type AmountScale = (typeof AMOUNT_SCALES)[number];

export const DEFAULT_AMOUNT_SCALE: AmountScale = 'medium';

/**
 * Default Amount Scale per Parent Category slug (the stable identity). A Parent
 * not listed here, including the top-level "other" Parent, uses medium. The
 * migration that adds the column writes the same mapping, keyed by Parent id.
 */
const PARENT_AMOUNT_SCALE: Readonly<Record<string, AmountScale>> = {
  spices: 'low',
  bakery: 'medium',
  dairy: 'medium',
  eggs: 'medium',
  grains: 'medium',
  meat: 'medium',
  pasta: 'medium',
  oils: 'large',
  produce: 'large',
};

export function amountScaleForParent(parentSlug: string): AmountScale {
  return PARENT_AMOUNT_SCALE[parentSlug] ?? DEFAULT_AMOUNT_SCALE;
}

/** The scale a stored value reads back as: null (never set) is medium. */
export function readAmountScale(stored: AmountScale | null): AmountScale {
  return stored ?? DEFAULT_AMOUNT_SCALE;
}
