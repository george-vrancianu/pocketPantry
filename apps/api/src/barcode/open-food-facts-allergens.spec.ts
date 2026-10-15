import { allergenSlugsOf } from './open-food-facts-allergens';

describe('allergenSlugsOf', () => {
  it('maps every EU 14 Open Food Facts tag onto its Allergen slug', () => {
    expect(
      allergenSlugsOf([
        'en:gluten',
        'en:crustaceans',
        'en:eggs',
        'en:fish',
        'en:peanuts',
        'en:soybeans',
        'en:milk',
        'en:nuts',
        'en:celery',
        'en:mustard',
        'en:sesame-seeds',
        'en:sulphur-dioxide-and-sulphites',
        'en:lupin',
        'en:molluscs',
      ]),
    ).toEqual([
      'gluten',
      'crustaceans',
      'eggs',
      'fish',
      'peanuts',
      'soy',
      'milk',
      'tree-nuts',
      'celery',
      'mustard',
      'sesame',
      'sulphites',
      'lupin',
      'molluscs',
    ]);
  });

  it('ignores unknown tags and repeats, and tolerates no list at all', () => {
    expect(
      allergenSlugsOf(['en:milk', 'en:kiwi', 'fr:lait', 'en:milk']),
    ).toEqual(['milk']);
    expect(allergenSlugsOf([])).toEqual([]);
    expect(allergenSlugsOf(undefined)).toEqual([]);
  });
});
