import { deriveAllergens, type AllergenLine } from './allergens';

const GLUTEN = 'allergen-gluten';
const MILK = 'allergen-milk';
const PEANUTS = 'allergen-peanuts';

let lineCount = 0;
const line = (over: Partial<AllergenLine> = {}): AllergenLine => ({
  id: `line-${++lineCount}`,
  allergenIds: [],
  checked: true,
  optional: false,
  ...over,
});

describe('deriveAllergens', () => {
  it('finds nothing in a Recipe whose lines are all checked and untagged', () => {
    expect(deriveAllergens({ lines: [line(), line()] })).toEqual({
      allergens: [],
      uncheckedCount: 0,
    });
  });

  it('gives an Allergen its source line, required', () => {
    const flour = line({ allergenIds: [GLUTEN] });
    expect(deriveAllergens({ lines: [flour, line()] })).toEqual({
      allergens: [
        { allergenId: GLUTEN, sources: [flour], optionalOnly: false },
      ],
      uncheckedCount: 0,
    });
  });

  it('marks an Allergen optional-only when every source line is optional', () => {
    const nuts = line({ allergenIds: [PEANUTS], optional: true });
    const [peanuts] = deriveAllergens({ lines: [nuts] }).allergens;
    expect(peanuts.optionalOnly).toBe(true);
  });

  it('is not optional-only when a required line also contains the Allergen', () => {
    const lines = [
      line({ allergenIds: [MILK], optional: true }),
      line({ allergenIds: [MILK] }),
    ];
    const [milk] = deriveAllergens({ lines }).allergens;
    expect(milk.optionalOnly).toBe(false);
  });

  it('lists every Allergen of a line with several', () => {
    const bread = line({ allergenIds: [GLUTEN, MILK] });
    const { allergens } = deriveAllergens({ lines: [bread] });
    expect(allergens).toEqual([
      { allergenId: GLUTEN, sources: [bread], optionalOnly: false },
      { allergenId: MILK, sources: [bread], optionalOnly: false },
    ]);
  });

  it('collects one Allergen from several lines, in line order', () => {
    const butter = line({ allergenIds: [MILK] });
    const cheese = line({ allergenIds: [MILK] });
    const { allergens } = deriveAllergens({ lines: [butter, line(), cheese] });
    expect(allergens).toEqual([
      { allergenId: MILK, sources: [butter, cheese], optionalOnly: false },
    ]);
  });

  it('counts Unchecked lines, an Unmatched line among them', () => {
    const familyIngredient = line({ checked: false });
    const unmatched = line({ checked: false, optional: true });
    expect(
      deriveAllergens({ lines: [familyIngredient, unmatched, line()] })
        .uncheckedCount,
    ).toBe(2);
  });

  it('still reports the tags of an Unchecked line', () => {
    const half = line({ checked: false, allergenIds: [MILK] });
    expect(deriveAllergens({ lines: [half] })).toMatchObject({
      allergens: [{ allergenId: MILK }],
      uncheckedCount: 1,
    });
  });

  it('keeps extra fields on the source lines it was given', () => {
    const named = {
      ...line({ allergenIds: [MILK] }),
      ingredientName: 'Butter',
    };
    const { allergens } = deriveAllergens({ lines: [named] });
    expect(allergens[0].sources[0].ingredientName).toBe('Butter');
  });
});
