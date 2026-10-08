import { describe, expect, it } from 'vitest';
import type { CatalogSearchResult } from './catalog';
import { defaultExpiryDate } from './pantry';
import { isLineValid, toNewBatch, toReviewLine, withMatch } from './review';
import type { ProposedLine } from './scan';

const today = new Date(2026, 9, 1);

const parmesan: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'hard', name: 'Hard cheese' },
  parentCategory: { id: 'dairy', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 60, location: 'fridge' },
};
const milk: CatalogSearchResult = {
  ...parmesan,
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'ml',
  defaults: { expiryDays: 7, location: 'fridge' },
};

const line = (overrides: Partial<ProposedLine> = {}): ProposedLine => ({
  name: 'Grana Padano',
  sourceText: 'GRANA PAD 200G',
  match: parmesan,
  lowConfidence: false,
  quantity: null,
  unit: null,
  expiryDate: null,
  productDescription: 'Grana Padano 200g',
  ...overrides,
});

describe('toReviewLine', () => {
  it('carries the source text the Scan read', () => {
    expect(toReviewLine(line(), 'a', today).sourceText).toBe('GRANA PAD 200G');
    expect(
      toReviewLine(line({ sourceText: null }), 'a', today).sourceText,
    ).toBeNull();
  });

  it('pre-fills unit, Location and expiry from the Match defaults', () => {
    expect(toReviewLine(line(), 'a', today)).toMatchObject({
      unit: 'g',
      location: 'fridge',
      expiryDate: defaultExpiryDate(60, today),
      expiryExplicit: false,
      description: 'Grana Padano 200g',
    });
  });

  it('prefers the best-before date read off the packaging', () => {
    expect(
      toReviewLine(line({ expiryDate: '2026-12-24' }), 'a', today),
    ).toMatchObject({ expiryDate: '2026-12-24', expiryExplicit: true });
  });

  it('leaves an Unmatched line in the cupboard with no expiry unless one was read', () => {
    expect(toReviewLine(line({ match: null }), 'a', today)).toMatchObject({
      location: 'cupboard',
      expiryDate: '',
    });
  });
});

describe('withMatch', () => {
  it('takes the new Ingredient defaults and clears the flag', () => {
    const changed = withMatch(
      toReviewLine(line({ lowConfidence: true }), 'a', today),
      milk,
      today,
    );
    expect(changed).toMatchObject({
      match: milk,
      unit: 'ml',
      expiryDate: defaultExpiryDate(7, today),
      lowConfidence: false,
    });
  });

  it('keeps an expiry read off the packaging', () => {
    const changed = withMatch(
      toReviewLine(line({ expiryDate: '2026-12-24' }), 'a', today),
      milk,
      today,
    );
    expect(changed.expiryDate).toBe('2026-12-24');
  });
});

describe('validity', () => {
  it('rejects a quantity the server would reject, and a nameless Unmatched line', () => {
    const base = toReviewLine(line(), 'a', today);
    expect(isLineValid({ ...base, quantity: '0' })).toBe(false);
    expect(isLineValid({ ...base, quantity: '1.2345' })).toBe(false);
    expect(isLineValid({ ...base, quantity: '2.5' })).toBe(true);
    expect(isLineValid({ ...base, quantity: '' })).toBe(true);
    expect(isLineValid({ ...base, match: null, name: '  ' })).toBe(false);
  });
});

describe('toNewBatch', () => {
  it('sends a matched line by Ingredient id', () => {
    expect(
      toNewBatch({
        ...toReviewLine(line(), 'a', today),
        quantity: '200',
        expiryDate: '2026-12-24',
      }),
    ).toEqual({
      ingredientId: 'parmesan-id',
      quantity: 200,
      unit: 'g',
      location: 'fridge',
      expiryDate: '2026-12-24',
      productDescription: 'Grana Padano 200g',
    });
  });

  it('sends the chosen Parent Category with an Unmatched line only', () => {
    const unmatched = toReviewLine(line({ match: null }), 'a', today);
    expect(
      toNewBatch({ ...unmatched, parentCategoryId: 'dairy-id' }),
    ).toMatchObject({ rawName: 'Grana Padano', parentCategoryId: 'dairy-id' });
    expect(toNewBatch(unmatched)).not.toHaveProperty('parentCategoryId');
    // A Match picked afterwards wins: the Parent choice is not sent with an Ingredient.
    const rematched = withMatch(
      { ...unmatched, parentCategoryId: 'dairy-id' },
      milk,
      today,
    );
    expect(toNewBatch(rematched)).not.toHaveProperty('parentCategoryId');
  });

  it('sends an Unmatched line by the name the scan read, with no unit when there is no quantity', () => {
    expect(toNewBatch(toReviewLine(line({ match: null }), 'a', today))).toEqual(
      {
        rawName: 'Grana Padano',
        quantity: null,
        unit: null,
        location: 'cupboard',
        expiryDate: null,
        productDescription: 'Grana Padano 200g',
      },
    );
  });
});
