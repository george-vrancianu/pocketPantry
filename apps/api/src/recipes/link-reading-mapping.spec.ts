import { draftOfReading, type ReadingContext } from './link-reading-mapping';
import type { LinkReading } from './link-reading.schemas';

const FLOUR = '11111111-1111-4111-8111-111111111111';
const CUISINE = '22222222-2222-4222-8222-222222222222';
const context: ReadingContext = {
  ingredientNames: new Map([[FLOUR, 'Flour']]),
  cuisineIds: new Set([CUISINE]),
  methodIds: new Set(),
  matchThreshold: 0.6,
};
const line = (
  overrides: Partial<LinkReading['ingredients'][number]> = {},
): LinkReading['ingredients'][number] => ({
  nameAsWritten: 'plain flour',
  ingredientId: FLOUR,
  matchConfidence: 0.9,
  quantity: 250,
  unit: 'g',
  originalAmount: '2 cups',
  preparation: 'sifted',
  optional: false,
  ...overrides,
});
const reading = (overrides: Partial<LinkReading> = {}): LinkReading => ({
  recipeFound: true,
  title: ' Pancakes ',
  servings: 4,
  prepMinutes: 10,
  cookMinutes: null,
  cuisineId: CUISINE,
  methodId: null,
  steps: [{ text: ' Mix. ', timerMinutes: 1.5 }],
  ingredients: [line()],
  ...overrides,
});
const first = (r: LinkReading) => draftOfReading(r, context).lines[0];

describe('draftOfReading', () => {
  it('maps a matched line, folding the original amount into the note', () => {
    expect(first(reading())).toEqual({
      ingredientId: FLOUR,
      rawName: null,
      ingredientName: 'Flour',
      quantity: 250,
      unit: 'g',
      optional: false,
      note: '2 cups, sifted',
    });
  });

  it('leaves ids outside the scope, and low-confidence matches, Unmatched', () => {
    const outside = first(
      reading({ ingredients: [line({ ingredientId: CUISINE })] }),
    );
    expect(outside).toMatchObject({
      ingredientId: null,
      rawName: 'plain flour',
    });
    const unsure = first(
      reading({ ingredients: [line({ matchConfidence: 0.3 })] }),
    );
    expect(unsure).toMatchObject({
      ingredientId: null,
      rawName: 'plain flour',
    });
  });

  it('keeps quantity and unit together and drops non-positive quantities', () => {
    expect(
      first(reading({ ingredients: [line({ quantity: 0 })] })),
    ).toMatchObject({ quantity: null, unit: null });
    expect(
      first(reading({ ingredients: [line({ quantity: -2 })] })),
    ).toMatchObject({ quantity: null, unit: null });
    expect(
      first(reading({ ingredients: [line({ unit: null })] })),
    ).toMatchObject({ quantity: null, unit: null });
    expect(
      first(reading({ ingredients: [line({ quantity: null })] })),
    ).toMatchObject({ quantity: null, unit: null });
  });

  it('keeps a pinch without quantity, with its wording in the note', () => {
    expect(
      first(
        reading({
          ingredients: [
            line({
              quantity: null,
              unit: null,
              originalAmount: 'a pinch',
              preparation: null,
            }),
          ],
        }),
      ),
    ).toMatchObject({ quantity: null, note: 'a pinch' });
  });

  it('drops unknown Cuisine and Method ids, empty guidance, null Servings stay null', () => {
    const draft = draftOfReading(
      reading({ servings: null, methodId: CUISINE, cuisineId: FLOUR }),
      context,
    );
    expect(draft).toMatchObject({
      servings: null,
      cuisineId: null,
      methodId: null,
      title: 'Pancakes',
      tips: [],
      guidance: { nutritionNote: null, pairings: [], eatingMoments: [] },
    });
  });

  it('turns timer minutes into seconds and drops empty Steps', () => {
    const draft = draftOfReading(
      reading({
        steps: [
          { text: 'Mix', timerMinutes: 1.5 },
          { text: '  ', timerMinutes: 3 },
          { text: 'Cook', timerMinutes: 0 },
        ],
      }),
      context,
    );
    expect(draft.steps).toEqual([
      { text: 'Mix', timerSeconds: 90 },
      { text: 'Cook', timerSeconds: null },
    ]);
  });
});
