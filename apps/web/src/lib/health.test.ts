import { describe, expect, it } from 'vitest';
import {
  healthTodos,
  pantryHealth,
  usualExpiryDate,
  verdictOf,
  withExpiryDates,
  type HealthBatch,
  type HealthInput,
} from './health';

const TODAY = '2026-10-15';

let n = 0;
const batch = (overrides: Partial<HealthBatch> = {}): HealthBatch => ({
  id: `b${++n}`,
  ingredientId: `i${n}`,
  location: 'fridge',
  expiryDate: '2027-01-01',
  defaultExpiryDays: null,
  createdAt: '2026-10-10T08:00:00Z',
  ...overrides,
});

const batches = (count: number, overrides: Partial<HealthBatch> = {}) =>
  Array.from({ length: count }, () => batch(overrides));

const input = (overrides: Partial<HealthInput> = {}): HealthInput => ({
  today: TODAY,
  staleThresholdDays: 3,
  batches: batches(10),
  staples: [],
  runningLow: new Set(),
  onShoppingList: new Set(),
  dismissed: new Set(),
  ...overrides,
});

const scored = (i: HealthInput) => {
  const result = pantryHealth(i);
  if (!result.scored) throw new Error('expected a score');
  return result;
};

describe('pantry health score', () => {
  it('gives no score below ten Batches and reports how many there are', () => {
    expect(pantryHealth(input({ batches: batches(9) }))).toEqual({
      scored: false,
      batchCount: 9,
    });
    expect(pantryHealth(input({ batches: batches(10) })).scored).toBe(true);
  });

  it('counts Batches in any state towards the ten, Expired included', () => {
    expect(
      pantryHealth(
        input({ batches: batches(10, { expiryDate: '2026-10-01' }) }),
      ).scored,
    ).toBe(true);
  });

  it('scores a spotless Pantry 100', () => {
    expect(scored(input())).toMatchObject({
      total: 100,
      factors: { fresh: 100, staples: 100, dated: 100, rotation: 100 },
    });
  });

  describe('Fresh', () => {
    it.each([
      ['expired', '2026-10-14', 0],
      ['expiring today', '2026-10-15', 60],
      ['at the Stale Threshold', '2026-10-18', 60],
      ['past the Stale Threshold', '2026-10-19', 100],
    ])('values a Batch %s at %i', (_name, expiryDate, fresh) => {
      const result = scored(
        input({
          batches: [...batches(9, { expiryDate: null }), batch({ expiryDate })],
        }),
      );
      expect(result.factors.fresh).toBe(fresh);
    });

    it('is 100 with no dated Batches', () => {
      expect(
        scored(input({ batches: batches(10, { expiryDate: null }) })).factors
          .fresh,
      ).toBe(100);
    });

    it('averages over dated Batches only', () => {
      const result = scored(
        input({
          batches: [
            batch({ expiryDate: '2026-10-01' }),
            batch({ expiryDate: '2027-01-01' }),
            ...batches(8, { expiryDate: null }),
          ],
        }),
      );
      expect(result.factors.fresh).toBe(50);
    });
  });

  describe('Staples', () => {
    const staple = (ingredientId: string) => ({ ingredientId });
    const withStaple = (overrides: Partial<HealthInput>) =>
      scored(
        input({
          batches: [batch({ ingredientId: 'milk' }), ...batches(9)],
          staples: [staple('milk')],
          ...overrides,
        }),
      ).factors.staples;

    it('is 100 with no Staples', () => {
      expect(withStaple({ staples: [] })).toBe(100);
    });

    it('counts a stocked Staple 1', () => {
      expect(withStaple({})).toBe(100);
    });

    it('counts a stocked Running low Staple 0.6', () => {
      expect(withStaple({ runningLow: new Set(['milk']) })).toBe(60);
    });

    it('counts a missing Staple 0', () => {
      expect(withStaple({ staples: [staple('eggs')] })).toBe(0);
    });

    it('counts a Staple whose only Batch has expired as missing', () => {
      expect(
        withStaple({
          batches: [
            batch({ ingredientId: 'milk', expiryDate: '2026-10-14' }),
            ...batches(9),
          ],
        }),
      ).toBe(0);
    });

    it('counts a missing Staple on the Shopping List 0.5', () => {
      expect(
        withStaple({
          staples: [staple('eggs')],
          onShoppingList: new Set(['eggs']),
        }),
      ).toBe(50);
    });

    it('leaves dismissed Staples out of the average', () => {
      expect(
        withStaple({
          staples: [staple('milk'), staple('eggs')],
          dismissed: new Set(['eggs']),
        }),
      ).toBe(100);
      expect(
        withStaple({ staples: [staple('eggs')], dismissed: new Set(['eggs']) }),
      ).toBe(100);
    });
  });

  describe('Dated', () => {
    it('is the share of Batches with an expiry date', () => {
      const result = scored(
        input({
          batches: [...batches(3, { expiryDate: null }), ...batches(7)],
        }),
      );
      expect(result.factors.dated).toBe(70);
    });
  });

  describe('Rotation and Forgotten', () => {
    const old = (days: number) =>
      new Date(Date.UTC(2026, 9, 15, 12) - days * 86_400_000).toISOString();

    it.each([
      ['fridge', 21],
      ['freezer', 180],
      ['cupboard', 365],
      ['spices', 730],
    ] as const)(
      'forgets an undated %s Batch older than %i days',
      (location, limit) => {
        const rotation = (age: number) =>
          scored(
            input({
              batches: [
                batch({ location, expiryDate: null, createdAt: old(age) }),
                ...batches(9),
              ],
            }),
          ).factors.rotation;
        expect(rotation(limit)).toBe(100);
        expect(rotation(limit + 1)).toBe(90);
      },
    );

    it('never forgets a dated Batch, however old', () => {
      const result = scored(
        input({
          batches: [batch({ createdAt: old(3000) }), ...batches(9)],
        }),
      );
      expect(result.factors.rotation).toBe(100);
    });
  });

  describe('total', () => {
    it('weights Fresh 40, Staples 30, Dated 15 and Rotation 15', () => {
      // Fresh 0, Staples 100, Dated 100, Rotation 100.
      const fresh0 = scored(
        input({ batches: batches(10, { expiryDate: '2026-10-01' }) }),
      );
      expect(fresh0.total).toBe(60);
      // Staples 0 only.
      const staples0 = scored(input({ staples: [{ ingredientId: 'none' }] }));
      expect(staples0.total).toBe(70);
      // Dated 0 only (Fresh stays 100 with no dated Batches).
      const dated0 = scored(
        input({ batches: batches(10, { expiryDate: null }) }),
      );
      expect(dated0.total).toBe(85);
    });

    it('rounds the weighted sum', () => {
      // Dated 90 -> 0.15 * 90 = 13.5 + 85 = 98.5 -> 99.
      const result = scored(
        input({
          batches: [batch({ expiryDate: null }), ...batches(9)],
        }),
      );
      expect(result.factors.dated).toBe(90);
      expect(result.total).toBe(99);
    });
  });

  describe('verdict', () => {
    it.each([
      [100, 'good'],
      [85, 'good'],
      [84, 'some'],
      [65, 'some'],
      [64, 'attention'],
      [0, 'attention'],
    ] as const)('%i is %s', (total, verdict) => {
      expect(verdictOf(total)).toBe(verdict);
    });

    it('is carried on a scored result', () => {
      expect(scored(input()).verdict).toBe('good');
      expect(
        scored(input({ batches: batches(10, { expiryDate: '2026-10-01' }) }))
          .verdict,
      ).toBe('attention');
    });
  });
});

describe('health to-dos', () => {
  const keys = (i: HealthInput) => healthTodos(i).map((todo) => todo.key);

  it('has none for a spotless Pantry', () => {
    expect(healthTodos(input())).toEqual([]);
  });

  it('lists expired Batches oldest first, in the now group', () => {
    const todos = healthTodos(
      input({
        batches: [
          batch({ id: 'a', expiryDate: '2026-10-14' }),
          batch({ id: 'b', expiryDate: '2026-10-01' }),
          ...batches(8),
        ],
      }),
    );
    expect(todos).toEqual([
      {
        key: 'expired',
        group: 'now',
        factor: 'fresh',
        itemIds: ['b', 'a'],
        gain: 0,
      },
    ]);
  });

  it('lists Expiring Soon Batches soonest first, in the week group', () => {
    const todos = healthTodos(
      input({
        batches: [
          batch({ id: 'a', expiryDate: '2026-10-18' }),
          batch({ id: 'b', expiryDate: '2026-10-15' }),
          batch({ id: 'c', expiryDate: '2026-10-19' }),
          ...batches(7),
        ],
      }),
    );
    expect(todos).toEqual([
      {
        key: 'expiringSoon',
        group: 'week',
        factor: 'fresh',
        itemIds: ['b', 'a'],
        gain: 0,
      },
    ]);
  });

  it('lists missing Staples that are not on the list or dismissed', () => {
    const todos = healthTodos(
      input({
        staples: [
          { ingredientId: 'eggs' },
          { ingredientId: 'flour' },
          { ingredientId: 'salt' },
        ],
        onShoppingList: new Set(['flour']),
        dismissed: new Set(['salt']),
      }),
    );
    expect(todos).toEqual([
      {
        key: 'missingStaples',
        group: 'now',
        factor: 'staples',
        itemIds: ['eggs'],
        gain: 7,
      },
    ]);
  });

  it('lists Running low Ingredients that are in stock and not on the list', () => {
    const todos = healthTodos(
      input({
        batches: [
          batch({ ingredientId: 'milk' }),
          batch({ ingredientId: 'rice' }),
          ...batches(8),
        ],
        runningLow: new Set(['milk', 'rice', 'gone']),
        onShoppingList: new Set(['rice']),
      }),
    );
    expect(todos).toEqual([
      {
        key: 'runningLow',
        group: 'week',
        factor: 'staples',
        itemIds: ['milk'],
        gain: 0,
      },
    ]);
  });

  it('lists undated Batches in the tidy group, Forgotten first, most overdue first', () => {
    const ago = (days: number) =>
      new Date(Date.UTC(2026, 9, 15, 12) - days * 86_400_000).toISOString();
    const todos = healthTodos(
      input({
        batches: [
          batch({ id: 'fresh', expiryDate: null, createdAt: ago(1) }),
          batch({ id: 'fridge30', expiryDate: null, createdAt: ago(30) }),
          batch({
            id: 'freezer400',
            location: 'freezer',
            expiryDate: null,
            createdAt: ago(400),
          }),
          ...batches(7),
        ],
      }),
    );
    expect(todos).toEqual([
      {
        key: 'undated',
        group: 'tidy',
        factor: 'dated',
        itemIds: ['freezer400', 'fridge30', 'fresh'],
        gain: 0,
      },
    ]);
  });

  it('orders the to-dos by group: now, then week, then tidy', () => {
    expect(
      keys(
        input({
          batches: [
            batch({ expiryDate: null }),
            batch({ expiryDate: '2026-10-16' }),
            batch({ expiryDate: '2026-10-01' }),
            ...batches(7),
          ],
          staples: [{ ingredientId: 'eggs' }],
        }),
      ),
    ).toEqual(['expired', 'missingStaples', 'expiringSoon', 'undated']);
  });

  it('still lists to-dos below ten Batches', () => {
    expect(
      keys(input({ batches: [batch({ expiryDate: '2026-10-01' })] })),
    ).toEqual(['expired']);
  });
});

describe('health to-do gain', () => {
  const gainOf = (i: HealthInput, key: string) =>
    healthTodos(i).find((todo) => todo.key === key)?.gain;

  it('is the score after tossing every expired Batch, minus the score now', () => {
    // 11 of 12 dated Batches in date: Fresh 92, total 97. Without the expired one: 100.
    const i = input({
      batches: [batch({ expiryDate: '2026-10-01' }), ...batches(11)],
    });
    expect(scored(i).total).toBe(97);
    expect(gainOf(i, 'expired')).toBe(3);
  });

  it('is the score after putting every missing Staple on the list, minus the score now', () => {
    // One Staple, missing: Staples 0, total 70. On the list it counts 0.5: 85.
    const i = input({ staples: [{ ingredientId: 'eggs' }] });
    expect(scored(i).total).toBe(70);
    expect(gainOf(i, 'missingStaples')).toBe(15);
  });

  it('is the simulated difference for Running low too, here none: the flag still counts after listing', () => {
    const i = input({
      batches: [batch({ ingredientId: 'milk' }), ...batches(9)],
      staples: [{ ingredientId: 'milk' }],
      runningLow: new Set(['milk']),
    });
    expect(gainOf(i, 'runningLow')).toBe(0);
  });

  it('is never shown for Expiring Soon', () => {
    const i = input({
      batches: [batch({ expiryDate: '2026-10-16' }), ...batches(11)],
    });
    expect(gainOf(i, 'expiringSoon')).toBe(0);
  });

  describe('for undated Batches', () => {
    const undated = (count: number, overrides: Partial<HealthBatch> = {}) =>
      batches(count, { expiryDate: null, ...overrides });

    it("is the score after Date all with each Batch's Default Expiry", () => {
      // 4 of 10 undated: Dated 60, total 94. All dated in date: 100.
      const i = input({
        batches: [...batches(6), ...undated(4, { defaultExpiryDays: 30 })],
      });
      expect(scored(i).total).toBe(94);
      expect(gainOf(i, 'undated')).toBe(6);
    });

    it('counts from when the Batch was added, or from today when that date has passed', () => {
      // Added 2026-01-01 with 30 days is long past: dated from today instead, so in date, not Expired.
      const i = input({
        batches: [
          ...batches(6),
          ...undated(4, {
            defaultExpiryDays: 30,
            location: 'cupboard',
            createdAt: '2026-01-01T12:00:00Z',
          }),
        ],
      });
      expect(gainOf(i, 'undated')).toBe(6);
    });

    it('is lower when the resulting dates are Expiring Soon', () => {
      // Two Batches become Expiring Soon (Fresh 0.6 each): total 97 instead of 100.
      const i = input({
        batches: [
          ...batches(6),
          ...undated(2, { defaultExpiryDays: 30 }),
          ...undated(2, { defaultExpiryDays: 2 }),
        ],
      });
      expect(gainOf(i, 'undated')).toBe(3);
    });

    it('skips Batches without a Default Expiry', () => {
      const i = input({
        batches: [
          ...batches(6),
          ...undated(2, { defaultExpiryDays: 30 }),
          ...undated(2),
        ],
      });
      // Dated goes 60 to 80: total 94 to 97.
      expect(gainOf(i, 'undated')).toBe(3);
    });

    it('is hidden when no Batch has a Default Expiry', () => {
      const i = input({ batches: [...batches(9), ...undated(1)] });
      expect(gainOf(i, 'undated')).toBe(0);
    });
  });

  it('is hidden while the Pantry is not scored', () => {
    const i = input({
      batches: [batch({ expiryDate: '2026-10-01' }), ...batches(8)],
      staples: [{ ingredientId: 'eggs' }],
    });
    expect(gainOf(i, 'expired')).toBe(0);
    expect(gainOf(i, 'missingStaples')).toBe(0);
  });
});

describe('usual expiry date', () => {
  const dated = (overrides: Partial<HealthBatch>) => batch(overrides);

  it('is the day the Batch was added plus its Default Expiry', () => {
    expect(
      usualExpiryDate(
        dated({ createdAt: '2026-10-10T12:00:00Z', defaultExpiryDays: 30 }),
        TODAY,
      ),
    ).toBe('2026-11-09');
  });

  it('is today plus the Default Expiry once that date has passed', () => {
    expect(
      usualExpiryDate(
        dated({ createdAt: '2026-01-01T12:00:00Z', defaultExpiryDays: 30 }),
        TODAY,
      ),
    ).toBe('2026-11-14');
  });

  it('is today for a Batch whose usual date is today', () => {
    expect(
      usualExpiryDate(
        dated({ createdAt: '2026-10-05T12:00:00Z', defaultExpiryDays: 10 }),
        TODAY,
      ),
    ).toBe('2026-10-15');
  });

  it('is null without a Default Expiry', () => {
    expect(usualExpiryDate(dated({}), TODAY)).toBeNull();
  });
});

describe('withExpiryDates', () => {
  const dated = [
    batch({ id: 'a', expiryDate: '2026-11-01' }),
    batch({ id: 'b', expiryDate: null }),
    batch({ id: 'c', expiryDate: '2026-12-01' }),
  ];

  it.each([
    [
      'sets a date',
      new Map([['b', '2026-11-20']]),
      ['2026-11-01', '2026-11-20', '2026-12-01'],
    ],
    [
      'sets a null entry to no date',
      new Map([['a', null]]),
      [null, null, '2026-12-01'],
    ],
    [
      'leaves Batches without an entry as they are',
      new Map(),
      ['2026-11-01', null, '2026-12-01'],
    ],
  ])('%s', (_name, dates, expected) => {
    const after = withExpiryDates(input({ batches: dated }), dates);
    expect(after.batches.map((b) => b.expiryDate)).toEqual(expected);
  });
});
