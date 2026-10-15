import { toOpenFoodFactsProduct } from './open-food-facts.client';

describe('toOpenFoodFactsProduct', () => {
  it('splits the names per supported locale and keeps the default ones', () => {
    expect(
      toOpenFoodFactsProduct({
        status: 1,
        product: {
          product_name: ' Iaurt ',
          product_name_ro: 'Iaurt grecesc',
          product_name_fr: 'Yaourt',
          generic_name: 'Yogurt',
          generic_name_da: '',
          quantity: '400 g',
        },
      }),
    ).toEqual({
      productName: 'Iaurt',
      productNames: { ro: 'Iaurt grecesc' },
      genericName: 'Yogurt',
      genericNames: {},
      quantity: '400 g',
    });
  });

  it.each([
    [{ status: 0, status_verbose: 'product not found' }],
    [{ status: 1 }],
    [null],
    ['nope'],
  ])('is null for %j', (body) => {
    expect(toOpenFoodFactsProduct(body)).toBeNull();
  });
});
