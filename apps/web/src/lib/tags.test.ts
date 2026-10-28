import { describe, expect, it } from 'vitest';
import { orderRowTags, splitRowTags, type RecipeTag } from './tags';

const catalog = (
  id: string,
  groupOrder: number,
  groupName: string,
): RecipeTag => ({
  id,
  name: id,
  kind: 'catalog',
  groupId: `g-${groupOrder}`,
  groupName,
  groupOrder,
});
const family = (id: string): RecipeTag => ({
  id,
  name: id,
  kind: 'family',
  groupId: null,
  groupName: null,
  groupOrder: null,
});

const method = catalog('rolled', 4, 'Method');
const cuisine = catalog('italian', 3, 'Cuisine');
const diet = catalog('vegan', 2, 'Diet');
const meal = catalog('dinner', 1, 'Meal');
const mine = family('meal-prep');

const ids = (tags: RecipeTag[]) => tags.map((t) => t.id);

describe('orderRowTags', () => {
  it('puts Family Tags first, then Catalog Tags by Tag Group order', () => {
    expect(ids(orderRowTags([method, cuisine, mine, meal, diet]))).toEqual([
      'meal-prep',
      'dinner',
      'vegan',
      'italian',
      'rolled',
    ]);
  });

  it('puts matched Tags before everything else, in the order given', () => {
    expect(
      ids(
        orderRowTags([mine, meal, diet, cuisine, method], ['rolled', 'vegan']),
      ),
    ).toEqual(['rolled', 'vegan', 'meal-prep', 'dinner', 'italian']);
  });

  it('ignores matched ids the Recipe does not have and keeps arrival order for ties', () => {
    const second = family('batch');
    expect(ids(orderRowTags([second, mine], ['nope']))).toEqual([
      'batch',
      'meal-prep',
    ]);
  });

  it('does not change its input', () => {
    const input = [method, meal];
    orderRowTags(input, ['rolled']);
    expect(ids(input)).toEqual(['rolled', 'dinner']);
  });
});

describe('splitRowTags', () => {
  it('shows two Tags and counts the rest', () => {
    const { shown, more } = splitRowTags([method, cuisine, mine, meal]);
    expect(ids(shown)).toEqual(['meal-prep', 'dinner']);
    expect(more).toBe(2);
  });

  it('has no overflow for one or two Tags', () => {
    expect(splitRowTags([meal, diet]).more).toBe(0);
    expect(splitRowTags([]).shown).toEqual([]);
  });
});
