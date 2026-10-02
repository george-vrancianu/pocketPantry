import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { ProductScanResult } from './product-scan.schemas';
import { productLine } from './proposed-line';

const match: CatalogSearchResult = {
  id: 'parmesan-id',
  name: 'Parmesan',
  defaultUnit: 'g',
  leafCategory: { id: 'l', name: 'Hard cheese' },
  parentCategory: { id: 'p', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 60, location: 'fridge' },
};

const result = (
  overrides: Partial<ProductScanResult> = {},
): ProductScanResult => ({
  productName: 'Grana Padano 200g',
  productType: 'Cheese',
  matchedIngredientId: 'parmesan-id',
  matchedCategory: 'Hard cheese',
  matchConfidence: 0.9,
  fallbackIngredientName: 'Grana Padano',
  expiryDate: '2026-12-24',
  expiryText: null,
  confidence: 0.9,
  matchedIngredientName: 'Parmesan',
  matchedIngredientDefaultUnit: 'g',
  ...overrides,
});

describe('productLine', () => {
  it('keeps a confident Match', () => {
    expect(productLine(result(), match, 0.6)).toMatchObject({
      match,
      lowConfidence: false,
      name: 'Grana Padano',
      productDescription: 'Grana Padano 200g',
    });
  });

  it('keeps a Match exactly at the threshold and makes one just below it Unmatched', () => {
    expect(
      productLine(result({ matchConfidence: 0.6 }), match, 0.6).match,
    ).toBe(match);
    expect(
      productLine(result({ matchConfidence: 0.59 }), match, 0.6),
    ).toMatchObject({ match: null });
  });

  it('is Unmatched without a validated Match', () => {
    expect(productLine(result(), null, 0.6).match).toBeNull();
  });
});
