import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import { plateLine, type PlateIngredient } from './plate-lines';

const milk: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Milk',
  defaultUnit: 'ml',
  leafCategory: { id: 'l', name: 'Milk' },
  parentCategory: { id: 'p', name: 'Dairy', aisle: 'Dairy' },
  defaults: { expiryDays: 7, location: 'fridge' },
};

const item = (overrides: Partial<PlateIngredient> = {}): PlateIngredient => ({
  fallbackIngredientName: 'Milk',
  matchedIngredientId: 'milk-id',
  matchConfidence: 0.9,
  confidence: 0.9,
  quantity: 200,
  unit: 'ml',
  ...overrides,
});

describe('plateLine', () => {
  it('proposes the quantity and unit for one serving against a confident Match', () => {
    expect(plateLine(item(), milk, 0.6)).toMatchObject({
      name: 'Milk',
      match: milk,
      unmatched: false,
      quantity: 200,
      unit: 'ml',
      expiryDate: null,
      productDescription: null,
    });
  });

  it('is Unmatched below the threshold or without a Match', () => {
    expect(plateLine(item({ matchConfidence: 0.5 }), milk, 0.6)).toMatchObject({
      match: null,
      unmatched: true,
      matchConfidence: 0,
    });
    expect(plateLine(item(), null, 0.6).unmatched).toBe(true);
  });

  it('keeps an Unmatched line a name, quantity and unit', () => {
    expect(
      plateLine(item({ quantity: 2, unit: 'pcs' }), null, 0.6),
    ).toMatchObject({ name: 'Milk', quantity: 2, unit: 'pcs' });
  });

  it('drops a unit the app does not know and falls back to the Match default', () => {
    expect(plateLine(item({ unit: 'tbsp' }), milk, 0.6)).toMatchObject({
      quantity: 200,
      unit: 'ml',
    });
    expect(plateLine(item({ unit: 'tbsp' }), null, 0.6)).toMatchObject({
      quantity: null,
      unit: null,
    });
  });

  it('has no unit when there is no quantity', () => {
    expect(plateLine(item({ quantity: null }), milk, 0.6)).toMatchObject({
      quantity: null,
      unit: null,
    });
  });

  it('flags a shaky read as low confidence', () => {
    expect(plateLine(item({ confidence: 0.3 }), milk, 0.6).lowConfidence).toBe(
      true,
    );
  });
});
