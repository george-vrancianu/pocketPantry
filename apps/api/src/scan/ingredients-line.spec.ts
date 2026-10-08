import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import { ingredientsLine } from './ingredients-line';
import type { IngredientsScanResult } from './ingredients-scan.schemas';

const match: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'ml',
  leafCategory: { id: 'l', name: 'Milk' },
  parentCategory: { id: 'p', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 7, location: 'fridge' },
};

const item = (
  overrides: Partial<IngredientsScanResult['items'][number]> = {},
): IngredientsScanResult['items'][number] => ({
  productName: 'Whole milk',
  productType: 'Dairy',
  matchedIngredientId: 'milk-id',
  matchedCategory: 'Dairy',
  matchConfidence: 0.9,
  fallbackIngredientName: 'Milk',
  confidence: 0.9,
  matchedIngredientName: 'Milk',
  matchedIngredientDefaultUnit: 'ml',
  ...overrides,
});

describe('ingredientsLine', () => {
  it('proposes a matched line with no quantity, unit or expiry', () => {
    expect(ingredientsLine(item(), match, 0.6)).toEqual({
      name: 'Milk',
      sourceText: 'Whole milk',
      match,
      lowConfidence: false,
      quantity: null,
      unit: null,
      expiryDate: null,
      productDescription: 'Whole milk',
    });
  });

  it('makes the line Unmatched below the threshold or without a Catalog Match', () => {
    expect(
      ingredientsLine(item({ matchConfidence: 0.3 }), match, 0.6),
    ).toMatchObject({ match: null });
    expect(ingredientsLine(item(), null, 0.6)).toMatchObject({
      match: null,
    });
  });

  it('caps the source text at 100 characters', () => {
    expect(
      ingredientsLine(item({ productName: 'x'.repeat(120) }), match, 0.6)
        .sourceText,
    ).toHaveLength(100);
  });

  it('flags a shaky image read', () => {
    expect(
      ingredientsLine(item({ confidence: 0.2 }), match, 0.6),
    ).toMatchObject({ match, lowConfidence: true });
  });
});
