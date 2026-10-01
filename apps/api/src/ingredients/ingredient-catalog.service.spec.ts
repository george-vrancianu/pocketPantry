import {
  type IngredientCatalog,
  validateCatalogMatch,
} from './ingredient-catalog';

const catalog: IngredientCatalog = {
  categories: ['Dairy', 'Produce'],
  ingredients: [
    {
      id: 'be0ef2e7-75ea-47d8-b9bf-fc890d64db8e',
      name: 'Yogurt',
      defaultUnit: 'g',
      category: 'Dairy',
    },
  ],
};

describe('IngredientCatalogService', () => {
  it('hydrates a valid model match with canonical database values', () => {
    expect(
      validateCatalogMatch(catalog, {
        matchedIngredientId: 'be0ef2e7-75ea-47d8-b9bf-fc890d64db8e',
        matchedCategory: 'Produce',
        matchConfidence: 0.93,
      }),
    ).toEqual({
      matchedIngredientId: 'be0ef2e7-75ea-47d8-b9bf-fc890d64db8e',
      matchedIngredientName: 'Yogurt',
      matchedIngredientDefaultUnit: 'g',
      matchedCategory: 'Dairy',
      matchConfidence: 0.93,
    });
  });

  it('rejects an ID that is not in the database catalog', () => {
    expect(
      validateCatalogMatch(catalog, {
        matchedIngredientId: 'f497abb1-8327-41e2-84ed-8bd78a0bd286',
        matchedCategory: 'dairy',
        matchConfidence: 0.97,
      }),
    ).toEqual({
      matchedIngredientId: null,
      matchedIngredientName: null,
      matchedIngredientDefaultUnit: null,
      matchedCategory: 'Dairy',
      matchConfidence: 0,
    });
  });

  it('rejects a category that is not in the database catalog', () => {
    expect(
      validateCatalogMatch(catalog, {
        matchedIngredientId: null,
        matchedCategory: 'Refrigerated foods',
        matchConfidence: 0.4,
      }).matchedCategory,
    ).toBeNull();
  });
});
