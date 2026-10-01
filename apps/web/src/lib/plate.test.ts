import { describe, expect, it } from 'vitest';
import type { CatalogSearchResult } from './catalog';
import { toNewShoppingItem } from './plate';
import { toReviewLine } from './review';

const milk: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'ml',
  leafCategory: { id: 'l', name: 'Milk' },
  parentCategory: { id: 'p', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 7, location: 'fridge' },
};

const line = (
  overrides: Partial<Parameters<typeof toReviewLine>[0]> = {},
  edit: object = {},
) => ({
  ...toReviewLine(
    {
      name: 'Milk',
      match: milk,
      matchConfidence: 0.9,
      unmatched: false,
      lowConfidence: false,
      quantity: 200,
      unit: 'ml',
      expiryDate: null,
      productDescription: null,
      ...overrides,
    },
    'k',
    new Date('2026-10-01'),
  ),
  ...edit,
});

describe('toNewShoppingItem', () => {
  it('sends a matched line by Ingredient id with its quantity and unit', () => {
    expect(toNewShoppingItem(line())).toEqual({
      ingredientId: 'milk-id',
      quantity: 200,
      unit: 'ml',
    });
  });

  it('sends an Unmatched line by its trimmed name', () => {
    expect(
      toNewShoppingItem(line({ match: null, name: ' Pixie dust ' })),
    ).toEqual({ name: 'Pixie dust', quantity: 200, unit: 'ml' });
  });

  it('leaves quantity and unit out when the quantity is blank', () => {
    expect(toNewShoppingItem(line({ quantity: null }))).toEqual({
      ingredientId: 'milk-id',
    });
  });

  it('uses the edited quantity and unit, not the Batch-only fields', () => {
    expect(toNewShoppingItem(line({}, { quantity: '1.5', unit: 'l' }))).toEqual(
      { ingredientId: 'milk-id', quantity: 1.5, unit: 'l' },
    );
  });
});
