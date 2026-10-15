import { deriveAllergens, type AllergenLine } from './allergens';

const GLUTEN = 'allergen-gluten';
const MILK = 'allergen-milk';
const PEANUTS = 'allergen-peanuts';

const SHARED = { ownerFamilyId: null, allergensChecked: false };
const checkedFamily = { ownerFamilyId: 'fam-1', allergensChecked: true };
const uncheckedFamily = { ownerFamilyId: 'fam-1', allergensChecked: false };

let lineCount = 0;
const line = (over: Partial<AllergenLine> = {}): AllergenLine => ({
  id: `line-${++lineCount}`,
  allergenIds: [],
  ingredient: SHARED,
  optional: false,
  ...over,
});
const ORDER = [GLUTEN, MILK, PEANUTS];
const derive = <L extends AllergenLine>(lines: L[]) =>
  deriveAllergens({ lines, allergenOrder: ORDER });

describe('deriveAllergens', () => {
  it('finds nothing in a Recipe whose lines are all checked and untagged', () => {
    expect(derive([line(), line()])).toEqual({
      allergens: [],
      uncheckedCount: 0,
      allergyWarning: null,
    });
  });

  it('gives an Allergen its source line, required', () => {
    const flour = line({ allergenIds: [GLUTEN] });
    expect(derive([flour, line()])).toEqual({
      allergens: [
        { allergenId: GLUTEN, sources: [flour], optionalOnly: false },
      ],
      uncheckedCount: 0,
      allergyWarning: null,
    });
  });

  it('marks an Allergen optional-only when every source line is optional', () => {
    const nuts = line({ allergenIds: [PEANUTS], optional: true });
    const [peanuts] = derive([nuts]).allergens;
    expect(peanuts.optionalOnly).toBe(true);
  });

  it('is not optional-only when a required line also contains the Allergen', () => {
    const lines = [
      line({ allergenIds: [MILK], optional: true }),
      line({ allergenIds: [MILK] }),
    ];
    const [milk] = derive(lines).allergens;
    expect(milk.optionalOnly).toBe(false);
  });

  it('lists every Allergen of a line with several', () => {
    const bread = line({ allergenIds: [GLUTEN, MILK] });
    const { allergens } = derive([bread]);
    expect(allergens).toEqual([
      { allergenId: GLUTEN, sources: [bread], optionalOnly: false },
      { allergenId: MILK, sources: [bread], optionalOnly: false },
    ]);
  });

  it('collects one Allergen from several lines, in line order', () => {
    const butter = line({ allergenIds: [MILK] });
    const cheese = line({ allergenIds: [MILK] });
    const { allergens } = derive([butter, line(), cheese]);
    expect(allergens).toEqual([
      { allergenId: MILK, sources: [butter, cheese], optionalOnly: false },
    ]);
  });

  it('counts a shared Ingredient as checked, tagged or not', () => {
    expect(derive([line(), line({ allergenIds: [MILK] })]).uncheckedCount).toBe(
      0,
    );
  });

  it('counts a Family Ingredient as checked once its Allergens were checked', () => {
    expect(derive([line({ ingredient: checkedFamily })]).uncheckedCount).toBe(
      0,
    );
  });

  it('counts a Family Ingredient not yet checked as Unchecked', () => {
    expect(derive([line({ ingredient: uncheckedFamily })]).uncheckedCount).toBe(
      1,
    );
  });

  it('counts an Unmatched line as Unchecked, optional or not', () => {
    const unmatched = line({ ingredient: null });
    const optional = line({ ingredient: null, optional: true });
    expect(derive([unmatched, optional, line()]).uncheckedCount).toBe(2);
  });

  it('still reports the tags of an Unchecked line', () => {
    const half = line({ ingredient: uncheckedFamily, allergenIds: [MILK] });
    expect(derive([half])).toMatchObject({
      allergens: [{ allergenId: MILK }],
      uncheckedCount: 1,
    });
  });

  it('orders Allergens by the given Allergen order, not by first appearance', () => {
    const lines = [
      line({ allergenIds: [PEANUTS] }),
      line({ allergenIds: [MILK] }),
      line({ allergenIds: [GLUTEN] }),
    ];
    expect(derive(lines).allergens.map((a) => a.allergenId)).toEqual([
      GLUTEN,
      MILK,
      PEANUTS,
    ]);
  });

  it('puts Allergens missing from the order last, in order of appearance', () => {
    const lines = [
      line({ allergenIds: ['allergen-x'] }),
      line({ allergenIds: [MILK] }),
      line({ allergenIds: ['allergen-y'] }),
    ];
    expect(derive(lines).allergens.map((a) => a.allergenId)).toEqual([
      MILK,
      'allergen-x',
      'allergen-y',
    ]);
  });

  it('keeps extra fields on the source lines it was given', () => {
    const named = {
      ...line({ allergenIds: [MILK] }),
      ingredientName: 'Butter',
    };
    const { allergens } = derive([named]);
    expect(allergens[0].sources[0].ingredientName).toBe('Butter');
  });

  describe('Allergy Warning', () => {
    const warn = (lines: AllergenLine[], allergies: string[]) =>
      deriveAllergens({
        lines,
        allergenOrder: ORDER,
        allergies: allergies.map((allergenId) => ({ allergenId })),
      }).allergyWarning;

    it('has none when the viewer has no Allergies, even with Unchecked lines', () => {
      const lines = [
        line({ allergenIds: [MILK] }),
        line({ ingredient: uncheckedFamily }),
      ];
      expect(warn(lines, [])).toBeNull();
      expect(derive(lines).allergyWarning).toBeNull();
    });

    it('has none when no checked line contains an Allergy and every line is checked', () => {
      expect(
        warn([line({ allergenIds: [MILK] }), line()], [PEANUTS]),
      ).toBeNull();
    });

    it('is strong when a required, checked line contains an Allergy', () => {
      const butter = line({ allergenIds: [MILK] });
      expect(warn([butter, line()], [MILK])).toEqual({
        severity: 'strong',
        entries: [
          { allergenId: MILK, severity: 'strong', lineIds: [butter.id] },
        ],
        uncheckedCount: 0,
      });
    });

    it('is soft when only optional lines contain the Allergy', () => {
      const nuts = line({ allergenIds: [PEANUTS], optional: true });
      expect(warn([nuts], [PEANUTS])).toEqual({
        severity: 'soft',
        entries: [
          { allergenId: PEANUTS, severity: 'soft', lineIds: [nuts.id] },
        ],
        uncheckedCount: 0,
      });
    });

    it('marks an Allergen strong overall but lists optional source lines too', () => {
      const optional = line({ allergenIds: [MILK], optional: true });
      const required = line({ allergenIds: [MILK] });
      expect(warn([optional, required], [MILK])?.entries).toEqual([
        {
          allergenId: MILK,
          severity: 'strong',
          lineIds: [optional.id, required.id],
        },
      ]);
    });

    it('is soft with no entries when only Unchecked lines exist and the viewer has an Allergy', () => {
      const family = line({ ingredient: uncheckedFamily });
      const unmatched = line({ ingredient: null });
      expect(warn([family, unmatched], [GLUTEN])).toEqual({
        severity: 'soft',
        entries: [],
        uncheckedCount: 2,
      });
    });

    it('stays strong when Unchecked lines come with a strong entry, and keeps the count', () => {
      const flour = line({ allergenIds: [GLUTEN] });
      const warning = warn([flour, line({ ingredient: null })], [GLUTEN]);
      expect(warning?.severity).toBe('strong');
      expect(warning?.uncheckedCount).toBe(1);
    });

    it('ignores Allergens the viewer does not have and orders entries by the Allergen list', () => {
      const lines = [
        line({ allergenIds: [PEANUTS] }),
        line({ allergenIds: [GLUTEN, MILK] }),
      ];
      expect(
        warn(lines, [PEANUTS, GLUTEN])?.entries.map((e) => e.allergenId),
      ).toEqual([GLUTEN, PEANUTS]);
    });

    it('counts a tagged Unchecked Family line as a source for the Allergy', () => {
      // Tags on a not-yet-checked Family Ingredient cannot exist: tagging checks it.
      const tagged = line({ allergenIds: [MILK], ingredient: checkedFamily });
      expect(warn([tagged], [MILK])?.severity).toBe('strong');
    });

    it('judges a Variant on its own lines: no Allergen in the Variant, no warning', () => {
      const base = [line({ allergenIds: [PEANUTS] })];
      const variant = [line()];
      expect(warn(base, [PEANUTS])?.severity).toBe('strong');
      expect(warn(variant, [PEANUTS])).toBeNull();
    });
  });
});
