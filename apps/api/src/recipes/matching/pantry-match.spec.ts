import {
  compareRecipeMatches,
  matchRecipe,
  rankRecipeMatches,
  type MatchBatch,
  type MatchLine,
  type RecipeMatch,
} from './pantry-match';

const FETA = 'ingredient-feta';
const FLOUR = 'ingredient-flour';
const MILK = 'ingredient-milk';
const SALT = 'ingredient-salt';

let lineCount = 0;
const line = (over: Partial<MatchLine> = {}): MatchLine => ({
  id: `line-${++lineCount}`,
  ingredientId: FLOUR,
  normalizedName: null,
  quantity: 100,
  unit: 'g',
  optional: false,
  pantryBasic: false,
  ...over,
});
const batch = (over: Partial<MatchBatch> = {}): MatchBatch => ({
  ingredientId: FLOUR,
  normalizedName: null,
  quantity: 100,
  unit: 'g',
  expiringSoon: false,
  ...over,
});

function match(
  lines: MatchLine[],
  stock: MatchBatch[],
  extra: { recipeServings?: number; requestedServings?: number } = {},
) {
  return matchRecipe({ lines, stock, recipeServings: 4, ...extra });
}
const statusOf = (lines: MatchLine[], stock: MatchBatch[]) =>
  match(lines, stock).lines[0].status;

describe('matchRecipe line status', () => {
  it('is covered when the stock meets the line exactly', () => {
    expect(
      statusOf([line({ quantity: 100 })], [batch({ quantity: 100 })]),
    ).toBe('covered');
  });

  it('is short when the stock falls below the line, with the shortfall in the line unit', () => {
    const result = match(
      [line({ quantity: 500, unit: 'g' })],
      [batch({ quantity: 200 })],
    );
    expect(result.lines[0]).toMatchObject({
      status: 'short',
      shortfall: { quantity: 300, unit: 'g' },
    });
  });

  it('is missing when there is no Batch of the Ingredient', () => {
    const result = match([line()], [batch({ ingredientId: MILK })]);
    expect(result.lines[0]).toMatchObject({
      status: 'missing',
      shortfall: null,
    });
  });

  it('sums several Batches', () => {
    expect(
      statusOf(
        [line({ quantity: 300 })],
        [batch({ quantity: 100 }), batch({ quantity: 200 })],
      ),
    ).toBe('covered');
  });

  it('scales units within a dimension', () => {
    expect(
      statusOf(
        [line({ quantity: 1, unit: 'kg' })],
        [batch({ quantity: 1000, unit: 'g' })],
      ),
    ).toBe('covered');
    expect(
      statusOf(
        [line({ quantity: 500, unit: 'g' })],
        [
          batch({ quantity: 0.4, unit: 'kg' }),
          batch({ quantity: 50, unit: 'g' }),
        ],
      ),
    ).toBe('short');
    expect(
      statusOf(
        [line({ quantity: 2, unit: 'l', ingredientId: MILK })],
        [batch({ ingredientId: MILK, quantity: 1500, unit: 'ml' })],
      ),
    ).toBe('short');
  });

  it('expresses the shortfall in the line unit even when the stock uses another', () => {
    const result = match(
      [line({ quantity: 1, unit: 'kg' })],
      [batch({ quantity: 250, unit: 'g' })],
    );
    expect(result.lines[0].shortfall).toEqual({ quantity: 0.75, unit: 'kg' });
  });

  it('never converts across dimensions: a Batch in another dimension gets the benefit of the doubt', () => {
    expect(
      statusOf(
        [line({ ingredientId: MILK, quantity: 500, unit: 'ml' })],
        [batch({ ingredientId: MILK, quantity: 1, unit: 'kg' })],
      ),
    ).toBe('covered');
    expect(
      statusOf(
        [line({ quantity: 6, unit: 'pcs' })],
        [batch({ quantity: 1000, unit: 'g' })],
      ),
    ).toBe('covered');
  });

  it('ignores an uncomparable Batch when a comparable one exists', () => {
    expect(
      statusOf(
        [line({ quantity: 500, unit: 'g' })],
        [
          batch({ quantity: 1, unit: 'pcs' }),
          batch({ quantity: 100, unit: 'g' }),
        ],
      ),
    ).toBe('short');
  });

  it('gives the benefit of the doubt when the Batch has no quantity', () => {
    expect(
      statusOf(
        [line({ quantity: 500 })],
        [batch({ quantity: null, unit: null })],
      ),
    ).toBe('covered');
  });

  it('matches a line with no quantity on presence', () => {
    expect(
      statusOf(
        [line({ quantity: null, unit: null })],
        [batch({ quantity: 1 })],
      ),
    ).toBe('covered');
    expect(statusOf([line({ quantity: null, unit: null })], [])).toBe(
      'missing',
    );
  });

  it('keeps a missing line out of the shortfall even with a quantity', () => {
    expect(match([line({ quantity: 5 })], []).lines[0].shortfall).toBeNull();
  });
});

describe('matchRecipe edge cases', () => {
  it('keeps a shortfall of at least 0.001 after rounding', () => {
    const result = match(
      [line({ quantity: 1, unit: 'kg' })],
      [batch({ quantity: 999.999, unit: 'g' })],
    );
    expect(result.lines[0]).toMatchObject({
      status: 'short',
      shortfall: { quantity: 0.001, unit: 'kg' },
    });
  });

  it('does not round a tiny scaled quantity down to zero', () => {
    const result = match([line({ quantity: 1 })], [batch()], {
      recipeServings: 4000,
      requestedServings: 1,
    });
    expect(result.lines[0].quantity).toBe(0.001);
  });

  it('adds float-prone Batches up exactly', () => {
    expect(
      statusOf(
        [line({ quantity: 300, unit: 'g' })],
        [
          batch({ quantity: 0.1, unit: 'kg' }),
          batch({ quantity: 0.2, unit: 'kg' }),
        ],
      ),
    ).toBe('covered');
  });

  it('covers a Pantry Basic that is also optional without counting it', () => {
    const result = match(
      [line({ ingredientId: SALT, pantryBasic: true, optional: true })],
      [],
    );
    expect(result.lines[0]).toMatchObject({
      status: 'covered',
      optional: true,
      pantryBasic: true,
    });
    expect(result.coverageRatio).toBe(1);
  });

  it('is missing for an Unmatched line with no name', () => {
    expect(
      statusOf(
        [line({ ingredientId: null, normalizedName: null })],
        [batch({ ingredientId: null, normalizedName: null })],
      ),
    ).toBe('missing');
  });

  it('keeps quantities as written when the Recipe servings are 0', () => {
    const result = match(
      [line({ quantity: 200 })],
      [batch({ quantity: 200 })],
      {
        recipeServings: 0,
        requestedServings: 6,
      },
    );
    expect(result.lines[0]).toMatchObject({ quantity: 200, status: 'covered' });
  });
});

describe('matchRecipe Pantry Basics and optional lines', () => {
  it('covers a Pantry Basic with no Batch at all', () => {
    const result = match([line({ ingredientId: SALT, pantryBasic: true })], []);
    expect(result.lines[0]).toMatchObject({
      status: 'covered',
      pantryBasic: true,
    });
    expect(result.canMake).toBe(true);
  });

  it('covers a Pantry Basic even when the stock is short', () => {
    expect(
      statusOf(
        [line({ ingredientId: SALT, pantryBasic: true, quantity: 500 })],
        [batch({ ingredientId: SALT, quantity: 1 })],
      ),
    ).toBe('covered');
  });

  it('shows the status of an optional line without counting it', () => {
    const result = match(
      [
        line({ optional: true, ingredientId: FETA }),
        line({ ingredientId: FLOUR }),
      ],
      [batch({ ingredientId: FLOUR })],
    );
    expect(result.lines[0]).toMatchObject({
      status: 'missing',
      optional: true,
    });
    expect(result.canMake).toBe(true);
    expect(result.shortOrMissingCount).toBe(0);
    expect(result.coverageRatio).toBe(1);
  });

  it('does not count a covered optional line toward coverage', () => {
    const result = match(
      [line({ optional: true }), line({ ingredientId: FETA })],
      [batch({ ingredientId: FLOUR })],
    );
    expect(result.coverageRatio).toBe(0);
  });
});

describe('matchRecipe Unmatched lines', () => {
  const unmatchedLine = (name: string, over: Partial<MatchLine> = {}) =>
    line({ ingredientId: null, normalizedName: name, ...over });

  it('matches an Unmatched Batch with the same normalised name', () => {
    expect(
      statusOf(
        [unmatchedLine('branza de vaci')],
        [batch({ ingredientId: null, normalizedName: 'Brânză  de vaci!' })],
      ),
    ).toBe('covered');
  });

  it('is missing without an Unmatched Batch of that name', () => {
    expect(
      statusOf(
        [unmatchedLine('branza de vaci')],
        [batch({ ingredientId: null, normalizedName: 'smantana' })],
      ),
    ).toBe('missing');
  });

  it('does not match a catalogued Batch by name', () => {
    expect(
      statusOf(
        [unmatchedLine('flour')],
        [batch({ ingredientId: FLOUR, normalizedName: 'flour' })],
      ),
    ).toBe('missing');
  });

  it('does not match an Unmatched Batch to a catalogued line', () => {
    expect(
      statusOf(
        [line({ ingredientId: FLOUR, normalizedName: 'flour' })],
        [batch({ ingredientId: null, normalizedName: 'flour' })],
      ),
    ).toBe('missing');
  });

  it('compares quantities like any other line', () => {
    expect(
      statusOf(
        [unmatchedLine('zacusca', { quantity: 400 })],
        [
          batch({
            ingredientId: null,
            normalizedName: 'zacusca',
            quantity: 100,
          }),
        ],
      ),
    ).toBe('short');
  });
});

describe('matchRecipe Servings', () => {
  it('defaults to the Recipe servings', () => {
    const result = match([line({ quantity: 200 })], [batch({ quantity: 200 })]);
    expect(result.lines[0]).toMatchObject({ quantity: 200, unit: 'g' });
    expect(result.canMake).toBe(true);
  });

  it('scales line quantities by requested over Recipe servings', () => {
    const lines = [line({ quantity: 200 })];
    const stock = [batch({ quantity: 300 })];
    const doubled = match(lines, stock, { requestedServings: 8 });
    expect(doubled.lines[0]).toMatchObject({
      quantity: 400,
      status: 'short',
      shortfall: { quantity: 100, unit: 'g' },
    });
    const halved = match(lines, stock, { requestedServings: 2 });
    expect(halved.lines[0]).toMatchObject({ quantity: 100, status: 'covered' });
  });

  it('leaves a quantity-less line without a quantity', () => {
    const result = match([line({ quantity: null, unit: null })], [batch()], {
      requestedServings: 8,
    });
    expect(result.lines[0]).toMatchObject({ quantity: null, unit: null });
  });
});

describe('matchRecipe Expiring Soon', () => {
  it('flags a covered line whose stock includes an Expiring Soon Batch', () => {
    const result = match(
      [line({ quantity: 100 })],
      [batch({ quantity: 60, expiringSoon: true }), batch({ quantity: 60 })],
    );
    expect(result.lines[0].usesExpiringSoon).toBe(true);
    expect(result.expiringCoveredCount).toBe(1);
  });

  it('does not flag short, missing or Pantry Basic lines', () => {
    const result = match(
      [
        line({ quantity: 500 }),
        line({ ingredientId: SALT, pantryBasic: true }),
        line({ ingredientId: FETA }),
      ],
      [
        batch({ quantity: 10, expiringSoon: true }),
        batch({ ingredientId: SALT, expiringSoon: true }),
      ],
    );
    expect(result.lines.map((l) => l.usesExpiringSoon)).toEqual([
      false,
      false,
      false,
    ]);
    expect(result.expiringCoveredCount).toBe(0);
  });

  it('counts only required lines toward expiringCoveredCount', () => {
    const result = match(
      [line({ optional: true })],
      [batch({ expiringSoon: true })],
    );
    expect(result.lines[0].usesExpiringSoon).toBe(true);
    expect(result.expiringCoveredCount).toBe(0);
  });
});

describe('matchRecipe Recipe totals', () => {
  it('reports Can Make, the short-or-missing count and the coverage ratio', () => {
    const result = match(
      [
        line({ ingredientId: FLOUR, quantity: 100 }),
        line({ ingredientId: MILK, quantity: 500, unit: 'ml' }),
        line({ ingredientId: FETA }),
        line({ ingredientId: SALT, pantryBasic: true }),
      ],
      [
        batch({ ingredientId: FLOUR }),
        batch({ ingredientId: MILK, quantity: 100, unit: 'ml' }),
      ],
    );
    expect(result.canMake).toBe(false);
    expect(result.shortOrMissingCount).toBe(2);
    expect(result.coverageRatio).toBe(0.5);
  });

  it('is Can Make with coverage 1 when every required line is covered', () => {
    const result = match([line()], [batch()]);
    expect(result).toMatchObject({
      canMake: true,
      shortOrMissingCount: 0,
      coverageRatio: 1,
    });
  });

  it('defines a Recipe with no required lines as makeable with coverage 1', () => {
    expect(match([], [])).toMatchObject({
      canMake: true,
      shortOrMissingCount: 0,
      coverageRatio: 1,
    });
    expect(match([line({ optional: true })], [])).toMatchObject({
      canMake: true,
      coverageRatio: 1,
    });
  });
});

describe('ranking', () => {
  const m = (over: Partial<RecipeMatch>): RecipeMatch => ({
    lines: [],
    canMake: true,
    shortOrMissingCount: 0,
    expiringCoveredCount: 0,
    coverageRatio: 1,
    ...over,
  });

  it('puts fewest short or missing required lines first', () => {
    const one = m({
      shortOrMissingCount: 1,
      expiringCoveredCount: 9,
      coverageRatio: 0.99,
    });
    const none = m({ shortOrMissingCount: 0 });
    expect(compareRecipeMatches(none, one)).toBeLessThan(0);
    expect(compareRecipeMatches(one, none)).toBeGreaterThan(0);
  });

  it('then most covered lines using an Expiring Soon Batch', () => {
    const a = m({ expiringCoveredCount: 2, coverageRatio: 0.5 });
    const b = m({ expiringCoveredCount: 1, coverageRatio: 1 });
    expect(compareRecipeMatches(a, b)).toBeLessThan(0);
  });

  it('then highest coverage ratio', () => {
    const a = m({ shortOrMissingCount: 1, coverageRatio: 0.8 });
    const b = m({ shortOrMissingCount: 1, coverageRatio: 0.5 });
    expect(compareRecipeMatches(a, b)).toBeLessThan(0);
  });

  it('ties compare equal', () => {
    expect(compareRecipeMatches(m({}), m({}))).toBe(0);
  });

  it('ranks a list in that order, keeping input order for ties, without mutating', () => {
    const items = [
      {
        name: 'ratioLow',
        match: m({ shortOrMissingCount: 1, coverageRatio: 0.4 }),
      },
      { name: 'tieFirst', match: m({}) },
      { name: 'expiring', match: m({ expiringCoveredCount: 1 }) },
      { name: 'tieSecond', match: m({}) },
      {
        name: 'ratioHigh',
        match: m({ shortOrMissingCount: 1, coverageRatio: 0.9 }),
      },
      {
        name: 'twoShort',
        match: m({ shortOrMissingCount: 2, coverageRatio: 1 }),
      },
    ];
    const ranked = rankRecipeMatches(items, (item) => item.match);
    expect(ranked.map((i) => i.name)).toEqual([
      'expiring',
      'tieFirst',
      'tieSecond',
      'ratioHigh',
      'ratioLow',
      'twoShort',
    ]);
    expect(items[0].name).toBe('ratioLow');
  });
});
