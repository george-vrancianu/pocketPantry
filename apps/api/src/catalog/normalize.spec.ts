import { normalizeName } from './normalize';

describe('normalizeName', () => {
  it.each([
    ['Parmesan', 'parmesan'],
    ['  Brânză   de  vaci ', 'branza de vaci'],
    ['ȘTIRBEI ţară', 'stirbei tara'],
    ['Extra-virgin olive oil!', 'extra virgin olive oil'],
    ["Baker's  yeast", 'baker s yeast'],
    ['', ''],
    ['Mælk', 'maelk'],
    ['Gulerødder', 'guleroedder'],
    ['Flåede tomater', 'flaaede tomater'],
    ['ÆBLE RØDBEDE ÅL', 'aeble roedbede aal'],
  ])('normalises %j to %j', (input, expected) => {
    expect(normalizeName(input)).toBe(expected);
  });

  it('treats diacritic and plain spellings as the same key', () => {
    expect(normalizeName('brânză')).toBe(normalizeName('BRANZA'));
  });

  it('folds a decomposed å the same as a composed one', () => {
    expect(normalizeName('fla\u030Aede')).toBe('flaaede');
  });

  it('matches the ASCII spellings Danish receipts print', () => {
    expect(normalizeName('MAELK')).toBe(normalizeName('Mælk'));
    expect(normalizeName('GULEROEDDER')).toBe(normalizeName('Gulerødder'));
  });
});
