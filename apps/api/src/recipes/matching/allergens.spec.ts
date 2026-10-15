import {
  countsAsViewersOwn,
  deriveAllergens,
  type AllergenLine,
  type AllergyInput,
} from './allergens';

const GLUTEN = 'allergen-gluten';
const MILK = 'allergen-milk';
const PEANUTS = 'allergen-peanuts';

const SHARED = {
  ownerFamilyId: null,
  allergensChecked: false,
  allergensReviewPending: false,
};
const checkedFamily = {
  ownerFamilyId: 'fam-1',
  allergensChecked: true,
  allergensReviewPending: false,
};
const uncheckedFamily = {
  ownerFamilyId: 'fam-1',
  allergensChecked: false,
  allergensReviewPending: false,
};

let lineCount = 0;
const line = (over: Partial<AllergenLine> = {}): AllergenLine => ({
  id: `line-${++lineCount}`,
  allergenIds: [],
  ingredient: SHARED,
  optional: false,
  ...over,
});
const ORDER = [GLUTEN, MILK, PEANUTS];
const OWN = { kind: 'own' } as const;
const derive = <L extends AllergenLine>(lines: L[]) =>
  deriveAllergens({ lines, allergenOrder: ORDER });

describe('deriveAllergens', () => {
  it('finds nothing in a Recipe whose lines are all checked and untagged', () => {
    expect(derive([line(), line()])).toEqual({
      allergens: [],
      uncheckedCount: 0,
      allergyWarning: null,
      hidden: false,
      blocksFill: false,
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
      hidden: false,
      blocksFill: false,
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

  it('counts a shared Ingredient awaiting its first tags after a promote as Unchecked', () => {
    const awaiting = {
      ownerFamilyId: null,
      allergensChecked: false,
      allergensReviewPending: true,
    };
    const reviewed = { ...awaiting, allergensChecked: true };
    expect(
      derive([line({ ingredient: awaiting }), line({ ingredient: reviewed })])
        .uncheckedCount,
    ).toBe(1);
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
        allergies: allergies.map((allergenId) => ({
          allergenId,
          owner: OWN,
        })),
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
          {
            allergenId: MILK,
            owner: OWN,
            tier: 'yours',
            severity: 'strong',
            lines: [{ lineId: butter.id, severity: 'strong' }],
          },
        ],
        allergens: [
          {
            allergenId: MILK,
            tier: 'yours',
            severity: 'strong',
            owners: [OWN],
          },
        ],
        uncheckedCount: 0,
      });
    });

    it('is soft when only optional lines contain the Allergy', () => {
      const nuts = line({ allergenIds: [PEANUTS], optional: true });
      expect(warn([nuts], [PEANUTS])).toEqual({
        severity: 'soft',
        entries: [
          {
            allergenId: PEANUTS,
            owner: OWN,
            tier: 'yours',
            severity: 'soft',
            lines: [{ lineId: nuts.id, severity: 'soft' }],
          },
        ],
        allergens: [
          {
            allergenId: PEANUTS,
            tier: 'yours',
            severity: 'soft',
            owners: [OWN],
          },
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
          owner: OWN,
          tier: 'yours',
          severity: 'strong',
          lines: [
            { lineId: optional.id, severity: 'soft' },
            { lineId: required.id, severity: 'strong' },
          ],
        },
      ]);
    });

    it('is soft with no entries when only Unchecked lines exist and the viewer has an Allergy', () => {
      const family = line({ ingredient: uncheckedFamily });
      const unmatched = line({ ingredient: null });
      expect(warn([family, unmatched], [GLUTEN])).toEqual({
        severity: 'soft',
        entries: [],
        allergens: [],
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

  describe('whose Allergy it is', () => {
    const own = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: OWN,
    });
    const family = (
      allergenId: string,
      label: string | null,
    ): AllergyInput => ({
      allergenId,
      owner: { kind: 'family', label },
    });
    const member = (
      allergenId: string,
      name: string,
      memberId = `id-${name}`,
    ): AllergyInput => ({
      allergenId,
      owner: { kind: 'member', memberId, name },
    });
    const warn = (lines: AllergenLine[], allergies: AllergyInput[]) =>
      deriveAllergens({ lines, allergenOrder: ORDER, allergies })
        .allergyWarning;
    const who = (lines: AllergenLine[], allergies: AllergyInput[]) =>
      warn(lines, allergies)?.entries.map((e) => [e.allergenId, e.owner]);
    const everything = () => [
      line({ allergenIds: [GLUTEN] }),
      line({ allergenIds: [MILK] }),
      line({ allergenIds: [PEANUTS] }),
    ];

    it('names the viewer as the owner of their own Allergy', () => {
      expect(who(everything(), [own(MILK)])).toEqual([[MILK, OWN]]);
    });

    it('names a Family Allergy with its label, or none', () => {
      expect(
        who(everything(), [family(MILK, 'Mia'), family(GLUTEN, null)]),
      ).toEqual([
        [GLUTEN, { kind: 'family', label: null }],
        [MILK, { kind: 'family', label: 'Mia' }],
      ]);
    });

    it('names another Member by name', () => {
      expect(who(everything(), [member(PEANUTS, 'Ana')])).toEqual([
        [PEANUTS, { kind: 'member', memberId: 'id-Ana', name: 'Ana' }],
      ]);
    });

    it('lists the viewer own and Family Allergies before other Members, whatever the Allergen order', () => {
      const allergies = [
        member(GLUTEN, 'Ana'),
        family(PEANUTS, 'Mia'),
        own(MILK),
        member(MILK, 'Ana'),
      ];
      expect(who(everything(), allergies)).toEqual([
        [MILK, OWN],
        [PEANUTS, { kind: 'family', label: 'Mia' }],
        [GLUTEN, { kind: 'member', memberId: 'id-Ana', name: 'Ana' }],
        [MILK, { kind: 'member', memberId: 'id-Ana', name: 'Ana' }],
      ]);
    });

    it('groups other Members by name, then by Allergen order', () => {
      const allergies = [
        member(PEANUTS, 'Zoe'),
        member(MILK, 'Ana'),
        member(GLUTEN, 'Zoe'),
      ];
      expect(who(everything(), allergies)?.map(([id]) => id)).toEqual([
        MILK,
        GLUTEN,
        PEANUTS,
      ]);
    });

    it('keeps one entry per person for the same Allergen, with the same lines', () => {
      const butter = line({ allergenIds: [MILK] });
      const entries = warn(
        [butter],
        [own(MILK), family(MILK, 'Mia'), family(MILK, 'Leo')],
      )?.entries;
      expect(entries?.map((e) => e.owner)).toEqual([
        OWN,
        { kind: 'family', label: 'Leo' },
        { kind: 'family', label: 'Mia' },
      ]);
      expect(entries?.every((e) => e.lines[0].lineId === butter.id)).toBe(true);
    });

    it('groups Family Allergies by label (unlabeled first, then alphabetical), then by Allergen order', () => {
      const entries = warn(everything(), [
        family(MILK, 'Mia'),
        family(PEANUTS, 'Leo'),
        family(PEANUTS, 'Mia'),
        family(GLUTEN, null),
      ])?.entries;
      expect(entries?.map((e) => [e.owner, e.allergenId])).toEqual([
        [{ kind: 'family', label: null }, GLUTEN],
        [{ kind: 'family', label: 'Leo' }, PEANUTS],
        [{ kind: 'family', label: 'Mia' }, MILK],
        [{ kind: 'family', label: 'Mia' }, PEANUTS],
      ]);
    });

    it('keeps two Members with the same name apart', () => {
      const entries = warn(everything(), [
        member(MILK, 'Ana', 'm-1'),
        member(MILK, 'Ana', 'm-2'),
      ])?.entries;
      expect(entries?.map((e) => e.owner)).toEqual([
        { kind: 'member', memberId: 'm-1', name: 'Ana' },
        { kind: 'member', memberId: 'm-2', name: 'Ana' },
      ]);
    });

    it('tiers the viewer own and Family Allergies as yours and other Members as members', () => {
      const entries = warn(everything(), [
        member(GLUTEN, 'Ana'),
        family(PEANUTS, 'Mia'),
        own(MILK),
      ])?.entries;
      expect(entries?.map((e) => e.tier)).toEqual([
        'yours',
        'yours',
        'members',
      ]);
    });

    it('counts own and Family Allergies as the viewer own, never a Member', () => {
      expect(countsAsViewersOwn(OWN)).toBe(true);
      expect(countsAsViewersOwn({ kind: 'family', label: null })).toBe(true);
      expect(
        countsAsViewersOwn({ kind: 'member', memberId: 'm', name: 'Ana' }),
      ).toBe(false);
    });

    it('collapses an exact repeat of the same Allergy', () => {
      expect(
        who(everything(), [family(MILK, 'Mia'), family(MILK, 'Mia')]),
      ).toHaveLength(1);
    });

    it('is strong when only another Member has the Allergy in a required line', () => {
      const w = warn(everything(), [member(MILK, 'Ana')]);
      expect(w?.severity).toBe('strong');
    });

    it('is soft when the Allergy is another Member only in an optional line', () => {
      const nuts = line({ allergenIds: [PEANUTS], optional: true });
      expect(warn([nuts], [member(PEANUTS, 'Ana')])?.severity).toBe('soft');
    });

    it('warns about Unchecked lines when only Family or other Members have Allergies', () => {
      const lines = [line({ ingredient: null })];
      expect(warn(lines, [member(MILK, 'Ana')])?.uncheckedCount).toBe(1);
      expect(warn(lines, [family(MILK, null)])?.uncheckedCount).toBe(1);
    });
  });

  describe('hidden', () => {
    const own = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: OWN,
    });
    const family = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: { kind: 'family', label: 'Mia' },
    });
    const member = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: { kind: 'member', memberId: 'm-1', name: 'Ana' },
    });
    const hidden = (lines: AllergenLine[], allergies: AllergyInput[]) =>
      deriveAllergens({ lines, allergenOrder: ORDER, allergies }).hidden;

    it('is true when the viewer own Allergy is in a required, checked line', () => {
      expect(hidden([line({ allergenIds: [MILK] })], [own(MILK)])).toBe(true);
    });

    it('is true for a Family Allergy in a required, checked line', () => {
      expect(hidden([line({ allergenIds: [MILK] })], [family(MILK)])).toBe(
        true,
      );
    });

    it('is true for a tagged, checked Family Ingredient line', () => {
      const lines = [line({ allergenIds: [MILK], ingredient: checkedFamily })];
      expect(hidden(lines, [own(MILK)])).toBe(true);
    });

    it('is false when only another Member has the Allergy', () => {
      expect(hidden([line({ allergenIds: [MILK] })], [member(MILK)])).toBe(
        false,
      );
    });

    it('is false when the Allergy is only in optional lines', () => {
      const lines = [line({ allergenIds: [MILK], optional: true })];
      expect(hidden(lines, [own(MILK)])).toBe(false);
    });

    it('is false when the only matching line is Unchecked', () => {
      const lines = [
        line({ allergenIds: [MILK], ingredient: uncheckedFamily }),
        line({ ingredient: null }),
      ];
      expect(hidden(lines, [own(MILK)])).toBe(false);
    });

    it('is true when a required checked line has it even if an optional one also does', () => {
      const lines = [
        line({ allergenIds: [MILK], optional: true }),
        line({ allergenIds: [MILK] }),
      ];
      expect(hidden(lines, [own(MILK)])).toBe(true);
    });

    it('is true when another Member shares the Allergy with the viewer', () => {
      const lines = [line({ allergenIds: [MILK] })];
      expect(hidden(lines, [member(MILK), own(MILK)])).toBe(true);
    });

    it('is false when the Recipe has no Allergen the viewer has, or the viewer has no Allergies', () => {
      expect(hidden([line({ allergenIds: [GLUTEN] })], [own(MILK)])).toBe(
        false,
      );
      expect(hidden([line({ allergenIds: [MILK] })], [])).toBe(false);
    });

    it('judges a Variant on its own lines', () => {
      const peanutFree = [line({ allergenIds: [GLUTEN] })];
      expect(hidden(peanutFree, [own(PEANUTS)])).toBe(false);
    });
  });

  describe('blocksFill', () => {
    const own = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: OWN,
    });
    const family = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: { kind: 'family', label: 'Mia' },
    });
    const member = (allergenId: string): AllergyInput => ({
      allergenId,
      owner: { kind: 'member', memberId: 'm-1', name: 'Ana' },
    });
    const blocks = (lines: AllergenLine[], allergies: AllergyInput[]) =>
      deriveAllergens({ lines, allergenOrder: ORDER, allergies }).blocksFill;

    it('is true for the viewer own, a Family or another Member Allergy in a required, checked line', () => {
      const lines = [line({ allergenIds: [MILK] })];
      expect(blocks(lines, [own(MILK)])).toBe(true);
      expect(blocks(lines, [family(MILK)])).toBe(true);
      expect(blocks(lines, [member(MILK)])).toBe(true);
    });

    it('stays false where hidden is false for the viewer, unless it is another Member', () => {
      const lines = [line({ allergenIds: [MILK] })];
      const derived = deriveAllergens({
        lines,
        allergenOrder: ORDER,
        allergies: [member(MILK)],
      });
      expect(derived.hidden).toBe(false);
      expect(derived.blocksFill).toBe(true);
    });

    it('is false for optional-only and Unchecked matches', () => {
      expect(
        blocks([line({ allergenIds: [MILK], optional: true })], [member(MILK)]),
      ).toBe(false);
      expect(
        blocks(
          [line({ allergenIds: [MILK], ingredient: uncheckedFamily })],
          [family(MILK)],
        ),
      ).toBe(false);
      expect(blocks([line({ ingredient: null })], [own(MILK)])).toBe(false);
    });

    it('neither hides nor blocks when the only match is a required line on a shared Ingredient awaiting review', () => {
      const awaiting = {
        ownerFamilyId: null,
        allergensChecked: false,
        allergensReviewPending: true,
      };
      const allergies = [own(MILK), member(MILK)];
      // Untagged (the usual state while awaiting): a soft, Unchecked-only warning.
      const untagged = deriveAllergens({
        lines: [line({ ingredient: awaiting })],
        allergenOrder: ORDER,
        allergies,
      });
      expect(untagged.allergyWarning).toMatchObject({
        severity: 'soft',
        entries: [],
        uncheckedCount: 1,
      });
      expect(untagged.hidden).toBe(false);
      expect(untagged.blocksFill).toBe(false);
      // Even if it carries a tag, the line is Unchecked: counted, never hiding or blocking Fill.
      const tagged = deriveAllergens({
        lines: [line({ allergenIds: [MILK], ingredient: awaiting })],
        allergenOrder: ORDER,
        allergies,
      });
      expect(tagged.allergyWarning?.uncheckedCount).toBe(1);
      expect(tagged.hidden).toBe(false);
      expect(tagged.blocksFill).toBe(false);
    });

    it('is false without a matching Allergy', () => {
      expect(blocks([line({ allergenIds: [GLUTEN] })], [member(MILK)])).toBe(
        false,
      );
      expect(blocks([line({ allergenIds: [MILK] })], [])).toBe(false);
    });
  });

  describe('allergens (compact view)', () => {
    it('names whose Allergy each Allergen is, once per Allergen, in warning order', () => {
      const lines = [line({ allergenIds: [MILK, PEANUTS] })];
      const { allergyWarning } = deriveAllergens({
        lines,
        allergenOrder: ORDER,
        allergies: [
          {
            allergenId: MILK,
            owner: { kind: 'member', memberId: 'm', name: 'Ana' },
          },
          { allergenId: MILK, owner: { kind: 'family', label: 'Mia' } },
          { allergenId: MILK, owner: OWN },
          {
            allergenId: PEANUTS,
            owner: { kind: 'member', memberId: 'm', name: 'Ana' },
          },
        ],
      });
      expect(allergyWarning?.allergens).toEqual([
        {
          allergenId: MILK,
          tier: 'yours',
          severity: 'strong',
          owners: [
            { kind: 'own' },
            { kind: 'family', label: 'Mia' },
            { kind: 'member', name: 'Ana' },
          ],
        },
        {
          allergenId: PEANUTS,
          tier: 'members',
          severity: 'strong',
          owners: [{ kind: 'member', name: 'Ana' }],
        },
      ]);
    });

    it('is empty when only Unchecked lines raise the warning', () => {
      const { allergyWarning } = deriveAllergens({
        lines: [line({ ingredient: null })],
        allergenOrder: ORDER,
        allergies: [{ allergenId: MILK, owner: OWN }],
      });
      expect(allergyWarning?.allergens).toEqual([]);
    });
  });
});
