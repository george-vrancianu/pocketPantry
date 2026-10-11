import { SEED_INGREDIENTS } from '../catalog-seed-data';
import {
  assertAcceptance,
  findAcceptanceGaps,
  findRecipeSeedProblems,
  type RecipeSeedInput,
} from './validate-recipe-seed';
import { SEED_BASE_RECIPES } from './recipe-seed-data';
import { SEED_CUISINES, SEED_EATING_MOMENTS, SEED_METHODS } from './registries';
import type {
  BaseRecipeSeed,
  RecipeSeed,
  VariantSeed,
} from './recipe-seed-types';

const t = (en: string, ro = `${en} (ro)`) => ({ en, ro });

const recipe = (slug: string): RecipeSeed => ({
  slug,
  title: t(slug),
  servings: 2,
  lines: [{ ingredient: 'eggs', quantity: 3, unit: 'pcs' }],
  steps: [{ key: 'cook', text: t('Cook.') }],
  nutritionNote: t('Filling; rich in fat.'),
  pairings: [{ kind: 'food', label: t('Salad'), reason: t('Fresh.') }],
  eatingMoments: [
    { moment: 'morning', polarity: 'good_for', reason: t('Light.') },
  ],
});

const variant = (slug: string): VariantSeed => ({
  ...recipe(slug),
  cuisine: 'asian',
});

const base = (slug = 'base', variants: VariantSeed[] = []): BaseRecipeSeed => ({
  ...recipe(slug),
  tips: [t('Tip.')],
  stepTips: [{ step: 'cook', text: t('Step tip.') }],
  variants,
});

const inputOf = (bases: BaseRecipeSeed[]): RecipeSeedInput => ({
  bases,
  cuisines: SEED_CUISINES,
  methods: SEED_METHODS,
  eatingMoments: SEED_EATING_MOMENTS,
  ingredientSlugs: new Set(SEED_INGREDIENTS.map((i) => i.slug)),
});

const problems = (bases: BaseRecipeSeed[]) =>
  findRecipeSeedProblems(inputOf(bases)).join('\n');

describe('findRecipeSeedProblems', () => {
  it('accepts a well-formed base with a Variant', () => {
    expect(
      findRecipeSeedProblems(inputOf([base('base', [variant('v1')])])),
    ).toEqual([]);
  });

  it('accepts the real seed', () => {
    expect(findRecipeSeedProblems(inputOf(SEED_BASE_RECIPES))).toEqual([]);
  });

  it('rejects duplicate slugs across bases and Variants', () => {
    expect(problems([base('a', [variant('a')])])).toContain(
      'duplicate slug "a"',
    );
  });

  it('rejects an unknown Ingredient on a line', () => {
    const b = base();
    b.lines = [{ ingredient: 'nope', quantity: 1, unit: 'g' }];
    expect(problems([b])).toContain('unknown Ingredient "nope"');
  });

  it('rejects a repeated line key, which defaults to the Ingredient slug', () => {
    const b = base();
    b.lines = [
      { ingredient: 'eggs', quantity: 1, unit: 'pcs' },
      { ingredient: 'eggs', quantity: 2, unit: 'pcs' },
    ];
    expect(problems([b])).toContain('duplicate line key "eggs"');
  });

  it('lets one Ingredient appear twice under different keys', () => {
    const b = base();
    b.lines = [
      { ingredient: 'salt', key: 'salt-eggs', quantity: 1, unit: 'g' },
      { ingredient: 'salt', key: 'salt-pan', quantity: 1, unit: 'g' },
    ];
    expect(problems([b])).toBe('');
  });

  it('rejects a quantity without a unit and the reverse', () => {
    const b = base();
    b.lines = [
      { ingredient: 'eggs', quantity: 1 },
      { ingredient: 'salt', unit: 'g' },
    ];
    const text = problems([b]);
    expect(text).toContain('"eggs": quantity and unit');
    expect(text).toContain('"salt": quantity and unit');
  });

  it('rejects empty or missing en and ro text', () => {
    const b = base();
    b.title = { en: 'Title', ro: ' ' };
    b.steps = [{ key: 'cook', text: { en: '', ro: 'Gătește.' } }];
    const text = problems([b]);
    expect(text).toContain('title: missing ro');
    expect(text).toContain('step "cook": missing en');
  });

  it('rejects a Nutrition Note over 500 characters', () => {
    const b = base();
    b.nutritionNote = t('x'.repeat(501), 'y');
    expect(problems([b])).toContain('Nutrition Note is 501 characters');
  });

  it('requires 1 to 10 Pairings', () => {
    const none = base();
    none.pairings = [];
    const many = base('many');
    many.pairings = Array.from({ length: 11 }, () => recipe('x').pairings[0]);
    const text = problems([none, many]);
    expect(text).toContain('"base": needs 1 to 10 Pairings, found 0');
    expect(text).toContain('"many": needs 1 to 10 Pairings, found 11');
  });

  it('requires 1 to 10 Eating Moment uses and no repeated moment', () => {
    const none = base();
    none.eatingMoments = [];
    const twice = base('twice');
    twice.eatingMoments = [
      ...twice.eatingMoments,
      { moment: 'morning', polarity: 'avoid', reason: t('Heavy.') },
    ];
    const text = problems([none, twice]);
    expect(text).toContain('"base": needs 1 to 10 Eating Moment uses');
    expect(text).toContain('"twice": Eating Moment "morning" used twice');
  });

  it('rejects an unknown Eating Moment, Cuisine or Method', () => {
    const b = base('b', [
      { ...variant('v1'), cuisine: 'atlantis' } as VariantSeed,
      { ...recipe('v2'), method: 'sous-vide-in-space' },
    ]);
    b.eatingMoments[0].moment = 'teatime';
    const text = problems([b]);
    expect(text).toContain('unknown Eating Moment "teatime"');
    expect(text).toContain('unknown Cuisine "atlantis"');
    expect(text).toContain('unknown Method "sous-vide-in-space"');
  });

  it('requires every Variant to be a Cuisine or a Method Variant, not both', () => {
    const neither: VariantSeed = { ...recipe('v1') } as VariantSeed;
    const both = { ...variant('v2'), method: 'rolled' } as VariantSeed;
    const text = problems([base('b', [neither, both])]);
    expect(text).toContain(
      '"v1": a Variant needs exactly one of cuisine and method',
    );
    expect(text).toContain(
      '"v2": a Variant needs exactly one of cuisine and method',
    );
  });

  it('rejects step Tips on unknown steps and duplicate step keys', () => {
    const b = base();
    b.steps = [...b.steps, { key: 'cook', text: t('Again.') }];
    b.stepTips = [{ step: 'ghost', text: t('Careful.') }];
    const text = problems([b]);
    expect(text).toContain('duplicate step key "cook"');
    expect(text).toContain('Tip on unknown step "ghost"');
  });

  it('rejects Pairing links to unknown Ingredients or Recipes, or both at once', () => {
    const b = base('b', [variant('v1')]);
    b.pairings = [
      { ...b.pairings[0], ingredient: 'nope' },
      { ...b.pairings[0], recipe: 'nope-recipe' },
      { ...b.pairings[0], ingredient: 'eggs', recipe: 'v1' },
      { ...b.pairings[0], recipe: 'b' },
      { ...b.pairings[0], recipe: 'v1' },
      { ...b.pairings[0], ingredient: 'eggs' },
    ];
    const text = problems([b]);
    expect(text).toContain('unknown Ingredient "nope"');
    expect(text).toContain('unknown Recipe "nope-recipe"');
    expect(text).toContain('links both an Ingredient and a Recipe');
    expect(text).toContain('links its own Recipe');
    expect(text.split('\n')).toHaveLength(4);
  });

  it('applies the Admin API limits to each locale', () => {
    const b = base();
    b.title = t('x'.repeat(201), 'ok');
    b.steps = [{ key: 'cook', text: t('ok', 'y'.repeat(2001)) }];
    b.lines = [
      {
        ingredient: 'eggs',
        quantity: 1,
        unit: 'pcs',
        note: t('n'.repeat(201), 'ok'),
      },
    ];
    b.tips = [t('ok', 'z'.repeat(2001))];
    b.pairings = [{ ...b.pairings[0], reason: t('r'.repeat(1001), 'ok') }];
    b.prepMinutes = -1;
    const text = problems([b]);
    expect(text).toContain('recipe "base": [en] document title:');
    expect(text).toContain('[ro] document steps.0.text');
    expect(text).toContain('[en] document lines.0.note');
    expect(text).toContain('[ro] tip 1 text');
    expect(text).toContain('[en] guidance pairings.0.reason');
    expect(text).toContain('prepMinutes');
  });

  it("checks the Variants' hidden base Tips are in range and unique", () => {
    const b = base('b', [
      { ...variant('v1'), hideBaseTips: [0, 0] },
      { ...variant('v2'), hideBaseTips: [3] },
      { ...variant('v3'), hideBaseTips: [0] },
    ]);
    b.tips = [t('Tip.')];
    const text = problems([b]);
    expect(text).toContain('"v1": hideBaseTips lists 0 twice');
    expect(text).toContain('"v2": hideBaseTips index 3 is not a base Tip');
    expect(text).not.toContain('"v3"');
  });

  it('requires a positive serving count', () => {
    const b = base();
    b.servings = 0;
    expect(problems([b])).toContain('servings must be a positive integer');
  });
});

describe('registries', () => {
  it("seed exactly the ticket's Eating Moments", () => {
    expect(SEED_EATING_MOMENTS.map((m) => m.en)).toEqual([
      'Morning',
      'Brunch',
      'Light lunch',
      'Before a workout',
      'After a workout',
      'Late evening / before bed',
      'Hot day',
      'Cold day',
    ]);
  });

  it('have unique slugs and en/ro/da names', () => {
    const input = inputOf([]);
    const text = findRecipeSeedProblems({
      ...input,
      cuisines: [...SEED_CUISINES, SEED_CUISINES[0]],
    }).join('\n');
    expect(text).toContain('duplicate Cuisine slug');
    expect(findRecipeSeedProblems(input)).toEqual([]);
  });
});

describe('findAcceptanceGaps', () => {
  const withVariants = (slug: string, cuisines: number, methods: number) =>
    base(slug, [
      ...Array.from({ length: cuisines }, (_, i) => variant(`${slug}-c${i}`)),
      ...Array.from({ length: methods }, (_, i) => ({
        ...recipe(`${slug}-m${i}`),
        method: 'rolled',
      })),
    ]);

  it('lists a base whose Variants fall short of the minimum counts', () => {
    const gaps = findAcceptanceGaps([withVariants('omelette', 2, 1)]).join(
      '\n',
    );
    expect(gaps).toContain(
      'omelette: needs at least 3 Cuisine Variants, has 2',
    );
    expect(gaps).toContain('omelette: needs at least 2 Method Variants, has 1');
  });

  it('is satisfied by a base that meets its minimums', () => {
    expect(findAcceptanceGaps([withVariants('omelette', 3, 2)])).toEqual([]);
  });

  it('wants Recipe-level Tips and a step Tip on every base', () => {
    const noTips = withVariants('omelette', 3, 2);
    noTips.tips = [];
    expect(findAcceptanceGaps([noTips]).join('\n')).toContain(
      'omelette: needs at least one Recipe-level Tip',
    );
    const noStepTips = withVariants('omelette', 3, 2);
    delete noStepTips.stepTips;
    expect(findAcceptanceGaps([noStepTips]).join('\n')).toContain(
      'omelette: needs at least one step Tip',
    );
  });

  it('counts only the bases that exist in the seed (the others arrive later)', () => {
    expect(findAcceptanceGaps([withVariants('other', 0, 0)])).toEqual([]);
  });

  it('wants at least five Cuisine Variants on the Appetizer platter', () => {
    expect(
      findAcceptanceGaps([withVariants('appetizer-platter', 4, 0)]).join('\n'),
    ).toContain('appetizer-platter: needs at least 5 Cuisine Variants, has 4');
  });

  it('counts only Pairings that link into another base family', () => {
    const a = base('a', [variant('a1')]);
    a.pairings = [
      { ...a.pairings[0], recipe: 'a1' },
      { ...a.pairings[0], recipe: 'c' },
    ];
    const c = base('c');
    const gaps = findAcceptanceGaps([a, c], { requireCrossLinks: true });
    expect(gaps.join('\n')).toContain(
      'at least 3 Pairings link a Recipe of another base, found 1',
    );
  });

  it('is met by the real seed: all five bases, their Variant counts and the cross-Recipe Pairings', () => {
    expect(
      findAcceptanceGaps(SEED_BASE_RECIPES, {
        requireBases: true,
        requireCrossLinks: true,
      }),
    ).toEqual([]);
    expect(() => assertAcceptance(SEED_BASE_RECIPES)).not.toThrow();
  });

  it('assertAcceptance throws listing what is missing', () => {
    expect(() => assertAcceptance([withVariants('omelette', 3, 2)])).toThrow(
      /potato-puree: base Recipe is missing/,
    );
  });
});
