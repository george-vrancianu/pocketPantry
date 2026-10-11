import { guidanceBody } from './recipe-guidance.schemas';

const pairing = { kind: 'food', label: 'bread', reason: 'soaks up the sauce' };

describe('guidanceBody', () => {
  it('defaults the optional Pairing and Eating Moment fields', () => {
    expect(
      guidanceBody.parse({
        nutritionNote: null,
        pairings: [pairing],
        eatingMoments: [
          {
            eatingMomentId: '6f1d3c0e-5b1c-4f43-9a52-0d1c1d0a1b11',
            polarity: 'avoid',
          },
        ],
      }),
    ).toEqual({
      nutritionNote: null,
      pairings: [
        {
          ...pairing,
          principle: null,
          linkedIngredientId: null,
          linkedRecipeId: null,
        },
      ],
      eatingMoments: [
        {
          eatingMomentId: '6f1d3c0e-5b1c-4f43-9a52-0d1c1d0a1b11',
          polarity: 'avoid',
          reason: null,
        },
      ],
    });
  });

  it('leaves the 10-item and 500-character limits to the service, for coded errors', () => {
    const many = Array.from({ length: 11 }, () => pairing);
    expect(
      guidanceBody.safeParse({
        nutritionNote: 'x'.repeat(501),
        pairings: many,
        eatingMoments: [],
      }).success,
    ).toBe(true);
  });

  it.each([
    ['a blank label', { ...pairing, label: ' ' }],
    ['an unknown kind', { ...pairing, kind: 'dessert' }],
    ['an unknown principle', { ...pairing, principle: 'because' }],
  ])('rejects %s', (_name, bad) => {
    expect(
      guidanceBody.safeParse({
        nutritionNote: null,
        pairings: [bad],
        eatingMoments: [],
      }).success,
    ).toBe(false);
  });
});
