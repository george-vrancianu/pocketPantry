import { rankPlateMatches, type PlateCandidate } from './plate-matches';

const candidate = (
  id: string,
  titles: string[],
  ingredientIds: string[],
): PlateCandidate => ({ id, titles, ingredientIds });

describe('rankPlateMatches', () => {
  it('puts a Recipe sharing Ingredients above one sharing none', () => {
    const ranked = rankPlateMatches(
      { dishTitle: 'zzz', ingredientIds: ['a', 'b'] },
      [candidate('none', ['Soup'], ['x']), candidate('some', ['Stew'], ['a'])],
    );
    expect(ranked.map((r) => r.id)).toEqual(['some']);
  });

  it('scores Ingredient overlap as Jaccard plus half the title Jaccard', () => {
    const [only] = rankPlateMatches(
      { dishTitle: 'Pasta carbonara', ingredientIds: ['a', 'b', 'b'] },
      [candidate('r', ['Carbonara'], ['a', 'c'])],
    );
    // ingredients 1/3, title 1/2
    expect(only.score).toBeCloseTo(1 / 3 + 0.25, 10);
  });

  it('matches titles ignoring case, diacritics and punctuation, on the best title', () => {
    const [only] = rankPlateMatches(
      { dishTitle: 'Tocană, de LEGUME!', ingredientIds: [] },
      [candidate('r', ['Something else', 'Tocana de legume'], [])],
    );
    expect(only.score).toBeCloseTo(0.5, 10);
  });

  it('drops zero scores and keeps at most five, best first, ties by title', () => {
    const many = ['f', 'e', 'd', 'c', 'b', 'a'].map((t) =>
      candidate(`id-${t}`, [`Dish ${t}`], ['a']),
    );
    const ranked = rankPlateMatches({ dishTitle: '', ingredientIds: ['a'] }, [
      ...many,
      candidate('zero', ['Nope'], ['q']),
    ]);
    expect(ranked.map((r) => r.id)).toEqual([
      'id-a',
      'id-b',
      'id-c',
      'id-d',
      'id-e',
    ]);
  });

  it('is empty when nothing matches', () => {
    expect(
      rankPlateMatches({ dishTitle: 'x', ingredientIds: [] }, [
        candidate('r', ['Y'], ['a']),
      ]),
    ).toEqual([]);
  });
});
