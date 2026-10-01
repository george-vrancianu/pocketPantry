import { normalizeName } from './normalize';

describe('normalizeName', () => {
  it.each([
    ['Parmesan', 'parmesan'],
    ['  Brânză   de  vaci ', 'branza de vaci'],
    ['ȘTIRBEI ţară', 'stirbei tara'],
    ['Extra-virgin olive oil!', 'extra virgin olive oil'],
    ["Baker's  yeast", 'baker s yeast'],
    ['', ''],
  ])('normalises %j to %j', (input, expected) => {
    expect(normalizeName(input)).toBe(expected);
  });

  it('treats diacritic and plain spellings as the same key', () => {
    expect(normalizeName('brânză')).toBe(normalizeName('BRANZA'));
  });
});
