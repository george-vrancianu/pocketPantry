import { isAllergenFreeName } from './allergen-free-names';

describe('isAllergenFreeName', () => {
  it.each([
    'gluten-free',
    'Gluten Free',
    '  GLUTEN-FREE ',
    'glutenfree',
    'Dairy free',
    'dairy-free',
    'Nut-free',
    'Peanut free',
    'Egg free',
    'No nuts',
    'Without shellfish',
    'Free from milk',
    'Lactose-free',
    'Sulphite free',
    'Sesame-free',
    'Lupin free',
    'Fără lactoză',
    'fara gluten',
    'Glutenfri',
    'Uden nødder',
    'Mælkefri',
  ])('flags %s', (name) => {
    expect(isAllergenFreeName(name)).toBe(true);
  });

  it.each([
    'Vegan',
    'Free range',
    'Gluten',
    'Weeknight',
    'Sugar free',
    'Nutty',
    'Eggplant',
    'Dairy',
    '',
  ])('leaves %s alone', (name) => {
    expect(isAllergenFreeName(name)).toBe(false);
  });
});
