import {
  forecastPlan,
  missingItems,
  stockLeft,
  type ForecastBatch,
  type ForecastInput,
  type ForecastLine,
  type ForecastRecipe,
  type ForecastSlot,
  type SlotForecast,
} from './plan-forecast';

const EGGS = 'ingredient-eggs';
const FLOUR = 'ingredient-flour';
const MILK = 'ingredient-milk';
const SALT = 'ingredient-salt';

const TODAY = '2030-01-10';
const day = (offset: number) =>
  new Date(Date.parse(`${TODAY}T00:00:00Z`) + offset * 86_400_000)
    .toISOString()
    .slice(0, 10);

let counter = 0;
const line = (over: Partial<ForecastLine> = {}): ForecastLine => ({
  ingredientId: EGGS,
  name: null,
  quantity: 4,
  unit: 'pcs',
  optional: false,
  pantryBasic: false,
  ...over,
});
const batch = (over: Partial<ForecastBatch> = {}): ForecastBatch => ({
  id: `batch-${++counter}`,
  ingredientId: EGGS,
  name: null,
  quantity: 6,
  unit: 'pcs',
  expiryDate: null,
  ...over,
});
const recipe = (
  lines: ForecastLine[],
  over: Partial<ForecastRecipe> = {},
): ForecastRecipe => ({ servings: 4, archived: false, lines, ...over });
const slot = (
  offset: number,
  mealtime: ForecastSlot['mealtime'],
  recipeId = 'r1',
  servings = 4,
): ForecastSlot => ({
  id: `${offset}-${mealtime}-${recipeId}`,
  date: day(offset),
  mealtime,
  recipeId,
  servings,
});

function forecast(over: Partial<ForecastInput>) {
  return forecastPlan({
    today: TODAY,
    slots: [],
    recipes: { r1: recipe([line()]) },
    batches: [],
    shoppingList: [],
    ...over,
  });
}
const ref = (s: SlotForecast) => ({
  slotId: s.id,
  date: s.date,
  mealtime: s.mealtime,
  recipeId: s.recipeId,
});
const statuses = (result: ReturnType<typeof forecastPlan>) =>
  result.slots.map((s) => s.status);

describe('forecastPlan: using up stock across slots', () => {
  it('has the second slot short by 2 when 6 eggs meet 4 + 4, naming the first slot', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
      batches: [batch({ quantity: 6 })],
    });
    expect(statuses(result)).toEqual(['covered', 'short']);
    expect(result.slots[1].issues).toEqual([
      {
        ingredientId: EGGS,
        name: null,
        kind: 'short',
        quantity: 2,
        unit: 'pcs',
        onList: false,
        reason: {
          code: 'onlyLeftAfter',
          amount: 2,
          unit: 'pcs',
          meals: [ref(result.slots[0])],
        },
      },
    ]);
  });

  it('walks slots by date, then Breakfast, Lunch, Dinner, whatever order they come in', () => {
    const result = forecast({
      slots: [slot(1, 'breakfast'), slot(0, 'dinner'), slot(0, 'breakfast')],
      batches: [batch({ quantity: 8 })],
    });
    expect(result.slots.map((s) => [s.date, s.mealtime, s.status])).toEqual([
      [day(0), 'breakfast', 'covered'],
      [day(0), 'dinner', 'covered'],
      [day(1), 'breakfast', 'short'],
    ]);
  });

  it('ignores slots before today', () => {
    const result = forecast({
      slots: [slot(-1, 'dinner'), slot(0, 'dinner')],
      batches: [batch({ quantity: 4 })],
    });
    expect(result.slots).toHaveLength(1);
    expect(statuses(result)).toEqual(['covered']);
  });
});

describe('forecastPlan: expiry', () => {
  it('uses an undated Batch last, so the dated one is not wasted', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(2, 'dinner')],
      batches: [
        batch({ quantity: 4, expiryDate: null }),
        batch({ quantity: 4, expiryDate: day(1) }),
      ],
    });
    expect(statuses(result)).toEqual(['covered', 'covered']);
  });

  it('uses the soonest-expiring Batch first, leaving the later one for a later slot', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(3, 'dinner')],
      batches: [
        batch({ quantity: 4, expiryDate: day(5) }),
        batch({ quantity: 4, expiryDate: day(1) }),
      ],
    });
    expect(statuses(result)).toEqual(['covered', 'covered']);
  });

  it('does not count a Batch for a slot the day after it expires', () => {
    const result = forecast({
      slots: [slot(2, 'dinner')],
      batches: [batch({ quantity: 6, expiryDate: day(1) })],
    });
    expect(statuses(result)).toEqual(['short']);
  });

  it('counts a Batch on its expiry date', () => {
    const result = forecast({
      slots: [slot(1, 'dinner')],
      batches: [batch({ quantity: 6, expiryDate: day(1) })],
    });
    expect(statuses(result)).toEqual(['covered']);
  });
});

describe('forecastPlan: Servings and units', () => {
  it('scales to the slot Servings, the plan default and a slot override alike', () => {
    const result = forecast({
      slots: [slot(0, 'dinner', 'r1', 2), slot(1, 'dinner', 'r1', 8)],
      batches: [batch({ quantity: 8 })],
    });
    // 2 of 4 servings needs 2 eggs; 8 of 4 servings needs 8, only 6 left.
    expect(statuses(result)).toEqual(['covered', 'short']);
    expect(result.slots[1].issues[0]).toMatchObject({
      quantity: 2,
      unit: 'pcs',
    });
  });

  it('adds g and kg Batches up and reports mass in g', () => {
    const flour = { ingredientId: FLOUR, unit: 'g' as const };
    const result = forecast({
      recipes: { r1: recipe([line({ ...flour, quantity: 1500 })]) },
      slots: [slot(0, 'dinner')],
      batches: [
        batch({ ingredientId: FLOUR, quantity: 1, unit: 'kg' }),
        batch({ ingredientId: FLOUR, quantity: 200, unit: 'g' }),
      ],
    });
    expect(result.slots[0].issues[0]).toMatchObject({
      kind: 'short',
      quantity: 300,
      unit: 'g',
    });
  });

  it('reports volume in ml', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line({ ingredientId: MILK, quantity: 1, unit: 'l' })]),
      },
      slots: [slot(0, 'dinner')],
      batches: [batch({ ingredientId: MILK, quantity: 400, unit: 'ml' })],
    });
    expect(result.slots[0].issues[0]).toMatchObject({
      quantity: 600,
      unit: 'ml',
    });
  });
});

describe('forecastPlan: Batches with no usable quantity', () => {
  const noQuantity = batch({ quantity: null, unit: null });

  it('covers the first use, uses nothing up, and makes later uses uncertain but not short', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(1, 'dinner'), slot(2, 'dinner')],
      batches: [noQuantity],
    });
    expect(statuses(result)).toEqual(['covered', 'covered', 'covered']);
    expect(result.slots[0].issues).toEqual([]);
    expect(result.slots[1].issues).toEqual([
      {
        ingredientId: EGGS,
        name: null,
        kind: 'uncertain',
        quantity: 4,
        unit: 'pcs',
        onList: false,
        reason: { code: 'noQuantity' },
      },
    ]);
    expect(result.slots[2].issues[0].kind).toBe('uncertain');
  });

  it('treats a Batch in another dimension as not comparable', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
      batches: [batch({ quantity: 500, unit: 'g' })],
    });
    expect(statuses(result)).toEqual(['covered', 'covered']);
    expect(result.slots[1].issues[0]).toMatchObject({ kind: 'uncertain' });
  });

  it('never converts mass, volume and count into each other', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line({ ingredientId: MILK, quantity: 1, unit: 'l' })]),
      },
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
      batches: [batch({ ingredientId: MILK, quantity: 5, unit: 'pcs' })],
    });
    expect(result.slots[1].issues[0]).toMatchObject({
      kind: 'uncertain',
      quantity: 1000,
      unit: 'ml',
    });
  });
});

describe('forecastPlan: which lines count', () => {
  const salty = recipe([
    line({ ingredientId: SALT, pantryBasic: true }),
    line({ ingredientId: FLOUR, optional: true }),
    line({ ingredientId: MILK, quantity: null, unit: null }),
  ]);

  it('skips Pantry Basics and optional lines', () => {
    const result = forecast({
      recipes: { r1: salty },
      slots: [slot(0, 'dinner')],
      batches: [batch({ ingredientId: MILK, quantity: 1, unit: 'l' })],
    });
    expect(result.slots[0]).toMatchObject({ status: 'covered', issues: [] });
  });

  it('matches a line with no quantity on presence and uses nothing up', () => {
    const result = forecast({
      recipes: { r1: salty },
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
      batches: [batch({ ingredientId: MILK, quantity: 1, unit: 'l' })],
    });
    expect(statuses(result)).toEqual(['covered', 'covered']);
  });

  it('is missing, with no amount, when a line with no quantity has no Batch', () => {
    const result = forecast({
      recipes: { r1: salty },
      slots: [slot(0, 'dinner')],
    });
    expect(result.slots[0].issues).toEqual([
      {
        ingredientId: MILK,
        name: null,
        kind: 'missing',
        quantity: null,
        unit: null,
        onList: false,
        reason: { code: 'notInPantry' },
      },
    ]);
  });

  it('matches an Unmatched line to an Unmatched Batch by normalised name', () => {
    const lines = [
      line({ ingredientId: null, name: 'Rød  Peber', quantity: 2 }),
    ];
    const result = forecast({
      recipes: { r1: recipe(lines) },
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
      batches: [
        batch({ ingredientId: null, name: 'roed  peber', quantity: 3 }),
      ],
    });
    expect(statuses(result)).toEqual(['covered', 'short']);
    expect(result.slots[1].issues[0]).toMatchObject({
      ingredientId: null,
      name: 'Rød  Peber',
      kind: 'short',
      quantity: 1,
    });
  });
});

describe('forecastPlan: the Shopping List', () => {
  it('turns short into onList but never covered', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
      batches: [batch({ quantity: 4 })],
      shoppingList: [{ ingredientId: EGGS, name: null }],
    });
    expect(statuses(result)).toEqual(['covered', 'onList']);
    expect(result.slots[1].issues[0]).toMatchObject({
      kind: 'missing',
      onList: true,
    });
  });

  it('stays short while another short Ingredient is not on the list', () => {
    const result = forecast({
      recipes: {
        r1: recipe([
          line(),
          line({ ingredientId: FLOUR, quantity: 100, unit: 'g' }),
        ]),
      },
      slots: [slot(0, 'dinner')],
      shoppingList: [{ ingredientId: EGGS, name: null }],
    });
    expect(statuses(result)).toEqual(['short']);
  });

  it('matches an Unmatched list entry by normalised name', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line({ ingredientId: null, name: 'Basil' })]),
      },
      slots: [slot(0, 'dinner')],
      shoppingList: [{ ingredientId: null, name: ' basil ' }],
    });
    expect(statuses(result)).toEqual(['onList']);
  });
});

describe('forecastPlan: unavailable slots', () => {
  it('leaves an archived Recipe out: unavailable, no issues, nothing used up', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line()], { archived: true }),
        r2: recipe([line()]),
      },
      slots: [slot(0, 'dinner', 'r1'), slot(1, 'dinner', 'r2')],
      batches: [batch({ quantity: 4 })],
    });
    expect(result.slots[0]).toMatchObject({
      status: 'unavailable',
      issues: [],
    });
    expect(result.slots[1].status).toBe('covered');
  });
});

describe('forecastPlan: carrying on across plans', () => {
  it('uses stock across slots handed in from consecutive plans', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(1, 'dinner'), slot(2, 'dinner')],
      batches: [batch({ quantity: 8 })],
    });
    expect(statuses(result)).toEqual(['covered', 'covered', 'short']);
  });
});

describe('forecastPlan: reasons', () => {
  const issueOf = (result: ReturnType<typeof forecastPlan>, index: number) =>
    result.slots[index].issues[0];

  it('usesLast names every earlier slot that took stock when none is left', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(1, 'dinner'), slot(2, 'dinner')],
      batches: [batch({ quantity: 6 })],
    });
    expect(issueOf(result, 2).reason).toEqual({
      code: 'usesLast',
      meals: [ref(result.slots[0]), ref(result.slots[1])],
    });
  });

  it('expires gives the latest expiry date when every Batch has expired by the slot', () => {
    const result = forecast({
      slots: [slot(3, 'dinner')],
      batches: [batch({ expiryDate: day(1) }), batch({ expiryDate: day(2) })],
    });
    expect(issueOf(result, 0)).toMatchObject({
      kind: 'missing',
      reason: { code: 'expires', date: day(2) },
    });
  });

  it('expires, not usesLast, when what earlier slots left over has expired by this slot', () => {
    const late = forecast({
      recipes: { r1: recipe([line({ quantity: 2 })]), r2: recipe([line()]) },
      slots: [slot(0, 'dinner', 'r1'), slot(2, 'dinner', 'r2')],
      batches: [batch({ quantity: 4, expiryDate: day(1) })],
    });
    expect(issueOf(late, 1)).toMatchObject({
      kind: 'missing',
      reason: { code: 'expires', date: day(1) },
    });
  });

  it('expires names the Batch that really expired with a remainder, not one an earlier slot used up', () => {
    const result = forecast({
      slots: [slot(2, 'dinner'), slot(4, 'dinner')],
      batches: [
        batch({ quantity: 4, expiryDate: day(1) }),
        batch({ quantity: 4, expiryDate: day(3) }),
      ],
    });
    expect(issueOf(result, 1)).toMatchObject({
      kind: 'missing',
      reason: { code: 'expires', date: day(1) },
    });
  });

  it('notInPantry when a Batch has no quantity left to give and nothing earlier took any', () => {
    const result = forecast({
      slots: [slot(0, 'dinner')],
      batches: [batch({ quantity: 0 })],
    });
    expect(issueOf(result, 0)).toMatchObject({
      kind: 'missing',
      reason: { code: 'notInPantry' },
    });
  });

  it('notInPantry when there is no Batch at all', () => {
    const result = forecast({ slots: [slot(0, 'dinner')] });
    expect(issueOf(result, 0)).toMatchObject({
      kind: 'missing',
      quantity: 4,
      reason: { code: 'notInPantry' },
    });
  });

  it('onlyInPantry when the Batches fall short before any earlier slot', () => {
    const result = forecast({
      slots: [slot(0, 'dinner')],
      batches: [batch({ quantity: 3 })],
    });
    expect(issueOf(result, 0)).toMatchObject({
      kind: 'short',
      quantity: 1,
      reason: { code: 'onlyInPantry', amount: 3, unit: 'pcs' },
    });
  });

  it('onlyLeftAfter names the earlier slots when some stock was left', () => {
    const result = forecast({
      slots: [slot(0, 'lunch'), slot(0, 'dinner')],
      batches: [batch({ quantity: 6 })],
    });
    expect(issueOf(result, 1).reason).toEqual({
      code: 'onlyLeftAfter',
      amount: 2,
      unit: 'pcs',
      meals: [ref(result.slots[0])],
    });
  });
});

describe('forecastPlan: day statuses and the plan tag', () => {
  it('runs planned days from today to the last slot, gap days empty', () => {
    const result = forecast({
      slots: [slot(0, 'dinner'), slot(3, 'dinner')],
      batches: [batch({ quantity: 4 })],
    });
    expect(result.days.map((d) => [d.date, d.status])).toEqual([
      [day(0), 'covered'],
      [day(1), 'empty'],
      [day(2), 'empty'],
      [day(3), 'short'],
    ]);
    expect(result.days[3].slots).toHaveLength(1);
  });

  it('has no days when there are no slots', () => {
    expect(forecast({}).days).toEqual([]);
    expect(forecast({}).tag).toEqual({ kind: 'none' });
  });

  it('rates a day short, then onList, then covered, then unavailable', () => {
    const recipes = {
      r1: recipe([line()]),
      gone: recipe([line()], { archived: true }),
    };
    const onDay = (extra: Partial<ForecastInput>) =>
      forecast({ recipes, ...extra }).days[0].status;
    expect(
      onDay({
        slots: [slot(0, 'breakfast'), slot(0, 'dinner', 'gone')],
        batches: [batch()],
      }),
    ).toBe('covered');
    expect(
      onDay({
        slots: [slot(0, 'breakfast'), slot(0, 'lunch')],
        batches: [batch({ quantity: 4 })],
        shoppingList: [{ ingredientId: EGGS, name: null }],
      }),
    ).toBe('onList');
    expect(
      onDay({
        slots: [slot(0, 'breakfast'), slot(0, 'lunch')],
        batches: [batch({ quantity: 4 })],
      }),
    ).toBe('short');
    expect(onDay({ slots: [slot(0, 'dinner', 'gone')] })).toBe('unavailable');
  });

  it('tags short with a count of slots, then coveredOnceYouShop, then allCovered', () => {
    const base = {
      slots: [slot(0, 'breakfast'), slot(0, 'lunch'), slot(0, 'dinner')],
    };
    expect(
      forecast({ ...base, batches: [batch({ quantity: 4 })] }).tag,
    ).toEqual({
      kind: 'short',
      count: 2,
    });
    expect(
      forecast({
        ...base,
        batches: [batch({ quantity: 4 })],
        shoppingList: [{ ingredientId: EGGS, name: null }],
      }).tag,
    ).toEqual({ kind: 'coveredOnceYouShop' });
    expect(
      forecast({ ...base, batches: [batch({ quantity: 12 })] }).tag,
    ).toEqual({
      kind: 'allCovered',
    });
  });

  it('tags none when every slot is unavailable', () => {
    const result = forecast({
      recipes: { r1: recipe([line()], { archived: true }) },
      slots: [slot(0, 'dinner')],
    });
    expect(result.tag).toEqual({ kind: 'none' });
  });
});

describe('missingItems', () => {
  const eggsAndFlour = recipe([
    line({ quantity: 4 }),
    line({ ingredientId: FLOUR, quantity: 300, unit: 'g' }),
  ]);

  it('adds shortfalls up per Ingredient across slots, with the Recipes as Source Recipes', () => {
    const result = forecast({
      recipes: {
        r1: eggsAndFlour,
        r2: recipe([line({ quantity: 2 })]),
      },
      slots: [
        slot(0, 'dinner', 'r1'),
        slot(1, 'dinner', 'r1'),
        slot(1, 'lunch', 'r2'),
      ],
      batches: [batch({ quantity: 4 })],
    });
    expect(missingItems(result.days)).toEqual([
      {
        ingredientId: FLOUR,
        name: null,
        quantity: 600,
        unit: 'g',
        recipeIds: ['r1'],
      },
      {
        ingredientId: EGGS,
        name: null,
        quantity: 6,
        unit: 'pcs',
        recipeIds: ['r2', 'r1'],
      },
    ]);
  });

  it('has no quantity when shortfalls of one Ingredient are in different dimensions', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line({ quantity: 200, unit: 'g' })]),
        r2: recipe([line({ quantity: 2, unit: 'pcs' })]),
      },
      slots: [slot(0, 'dinner', 'r1'), slot(1, 'dinner', 'r2')],
    });
    expect(missingItems(result.days)).toEqual([
      {
        ingredientId: EGGS,
        name: null,
        quantity: null,
        unit: null,
        recipeIds: ['r1', 'r2'],
      },
    ]);
  });

  it('leaves out Ingredients already on the list', () => {
    const result = forecast({
      recipes: { r1: eggsAndFlour },
      slots: [slot(0, 'dinner')],
      shoppingList: [{ ingredientId: EGGS, name: null }],
    });
    expect(missingItems(result.days).map((i) => i.ingredientId)).toEqual([
      FLOUR,
    ]);
  });

  it('leaves out uncertain issues and unavailable slots', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line()]),
        gone: recipe([line({ ingredientId: FLOUR })], { archived: true }),
      },
      slots: [slot(0, 'lunch'), slot(1, 'lunch'), slot(2, 'lunch', 'gone')],
      batches: [batch({ quantity: null, unit: null })],
    });
    expect(missingItems(result.days)).toEqual([]);
  });

  it('has no quantity when any contributing shortfall has none', () => {
    const result = forecast({
      recipes: {
        r1: recipe([line({ quantity: 2 })]),
        r2: recipe([line({ quantity: null, unit: null })]),
      },
      slots: [slot(0, 'dinner', 'r1'), slot(1, 'dinner', 'r2')],
    });
    expect(missingItems(result.days)).toEqual([
      {
        ingredientId: EGGS,
        name: null,
        quantity: null,
        unit: null,
        recipeIds: ['r1', 'r2'],
      },
    ]);
  });

  it('keeps an Unmatched item by name and works on a slice of days', () => {
    const result = forecast({
      recipes: {
        r1: recipe([
          line({ ingredientId: null, name: 'Basil', quantity: 1, unit: 'pcs' }),
        ]),
      },
      slots: [slot(0, 'dinner'), slot(1, 'dinner')],
    });
    expect(missingItems(result.days.slice(1))).toEqual([
      {
        ingredientId: null,
        name: 'Basil',
        quantity: 1,
        unit: 'pcs',
        recipeIds: ['r1'],
      },
    ]);
  });
});

describe('stockLeft', () => {
  it('returns each Batch with what the slots left of it, in base units', () => {
    const left = stockLeft({
      today: TODAY,
      slots: [slot(0, 'dinner')],
      recipes: { r1: recipe([line({ quantity: 4 })]) },
      batches: [batch({ id: 'b1', quantity: 6 })],
      shoppingList: [],
    });
    expect(left).toEqual([
      expect.objectContaining({ id: 'b1', quantity: 2, unit: 'pcs' }),
    ]);
  });

  it('keeps a Batch with no comparable quantity as it was', () => {
    const left = stockLeft({
      today: TODAY,
      slots: [slot(0, 'dinner')],
      recipes: { r1: recipe([line()]) },
      batches: [batch({ id: 'b1', quantity: null, unit: null })],
      shoppingList: [],
    });
    expect(left).toEqual([
      expect.objectContaining({ id: 'b1', quantity: null, unit: null }),
    ]);
  });
});
