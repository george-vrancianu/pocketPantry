import { diffIngredients, type DiffLine } from './recipe-diff';

let n = 0;
const line = (key: string, extra: Partial<DiffLine> = {}): DiffLine => ({
  id: `l${++n}`,
  key,
  ingredientId: null,
  ingredientName: key,
  quantity: null,
  unit: null,
  ...extra,
});

describe('diffIngredients', () => {
  it('is empty when both Recipes have the same Ingredients', () => {
    const a = [line('flour'), line('salt')];
    const b = [line('flour'), line('salt')];
    expect(diffIngredients(a, b)).toEqual({
      added: [],
      removed: [],
      swapped: [],
    });
  });

  it('does not report a changed quantity of the same Ingredient', () => {
    const a = [line('flour', { quantity: 100, unit: 'g' })];
    const b = [line('flour', { quantity: 300, unit: 'g' })];
    expect(diffIngredients(a, b).swapped).toEqual([]);
    expect(diffIngredients(a, b).added).toEqual([]);
  });

  it('reports lines only the Variant has as added, and only the base has as removed', () => {
    const added = diffIngredients(
      [line('flour')],
      [line('flour'), line('salt'), line('pepper')],
    );
    expect(added.added.map((e) => e.ingredientName)).toEqual([
      'salt',
      'pepper',
    ]);
    expect(added.removed).toEqual([]);
    const removed = diffIngredients(
      [line('flour'), line('milk')],
      [line('flour')],
    );
    expect(removed.removed.map((e) => e.ingredientName)).toEqual(['milk']);
    expect(removed.added).toEqual([]);
  });

  it('pairs removed and added lines in a gap, in order, as swapped', () => {
    const base = [line('flour'), line('butter'), line('sugar'), line('egg')];
    const variant = [line('flour'), line('oil'), line('honey'), line('egg')];
    const result = diffIngredients(base, variant);
    expect(
      result.swapped.map((s) => [s.from.ingredientName, s.to.ingredientName]),
    ).toEqual([
      ['butter', 'oil'],
      ['sugar', 'honey'],
    ]);
    expect(result.added).toEqual([]);
    expect(result.removed).toEqual([]);
  });

  it('leaves unpaired lines of a gap as added or removed', () => {
    const base = [line('a'), line('b'), line('c'), line('z')];
    const variant = [line('a'), line('x'), line('z')];
    const result = diffIngredients(base, variant);
    expect(result.swapped.map((s) => [s.from.key, s.to.key])).toEqual([
      ['b', 'x'],
    ]);
    expect(result.removed.map((e) => e.key)).toEqual(['c']);
    expect(result.added).toEqual([]);
  });

  it('keeps line ids, quantity and unit on entries', () => {
    const base = [line('milk', { quantity: 2, unit: 'l', id: 'base-1' })];
    const variant = [line('oat', { quantity: 1, unit: 'kg', id: 'var-1' })];
    expect(diffIngredients(base, variant).swapped).toEqual([
      {
        from: {
          id: 'base-1',
          key: 'milk',
          ingredientId: null,
          ingredientName: 'milk',
          quantity: 2,
          unit: 'l',
        },
        to: {
          id: 'var-1',
          key: 'oat',
          ingredientId: null,
          ingredientName: 'oat',
          quantity: 1,
          unit: 'kg',
        },
      },
    ]);
  });
});
