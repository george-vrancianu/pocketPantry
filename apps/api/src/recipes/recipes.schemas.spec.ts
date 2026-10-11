import {
  hiddenTipsBody,
  recipeDocument,
  translationsBody,
} from './recipes.schemas';

const id = '6f1d3c0e-5b1c-4f43-9a52-0d1c1d0a1b11';
const base = { title: 'Soup', servings: 4 };

describe('recipeDocument', () => {
  it('defaults the optional parts', () => {
    expect(recipeDocument.parse(base)).toEqual({
      ...base,
      prepMinutes: null,
      cookMinutes: null,
      difficulty: null,
      cuisineId: null,
      methodId: null,
      lines: [],
      steps: [],
    });
  });

  it.each([
    ['zero servings', { servings: 0 }],
    ['fractional servings', { servings: 2.5 }],
    ['negative minutes', { prepMinutes: -1 }],
    ['unknown difficulty', { difficulty: 'impossible' }],
    ['a parentId (immutable)', { parentId: id }],
    ['negative timer', { steps: [{ text: 'x', timerSeconds: -1 }] }],
    [
      'a zero quantity',
      { lines: [{ ingredientId: id, quantity: 0, unit: 'g' }] },
    ],
    [
      'four decimals',
      { lines: [{ ingredientId: id, quantity: 1.2345, unit: 'g' }] },
    ],
  ])('rejects %s', (_label, extra) => {
    expect(recipeDocument.safeParse({ ...base, ...extra }).success).toBe(false);
  });

  it('leaves quantity/unit pairing and a missing Ingredient to the service, for coded errors', () => {
    const parsed = recipeDocument.safeParse({
      ...base,
      lines: [{ ingredientId: null, quantity: 1 }],
    });
    expect(parsed.success).toBe(true);
  });
});

describe('translationsBody and hiddenTipsBody', () => {
  it('accepts null to delete and rejects blank text', () => {
    expect(translationsBody.safeParse({ steps: { [id]: null } }).success).toBe(
      true,
    );
    expect(translationsBody.safeParse({ steps: { [id]: '  ' } }).success).toBe(
      false,
    );
  });

  it('rejects duplicate hidden Tips', () => {
    expect(hiddenTipsBody.safeParse({ tipIds: [id, id] }).success).toBe(false);
  });
});
