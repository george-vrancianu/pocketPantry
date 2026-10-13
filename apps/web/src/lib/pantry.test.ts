import { describe, expect, it } from 'vitest';
import {
  defaultExpiryDate,
  expiryTagFor,
  countByLocation,
  groupByLocation,
  matchesSearch,
  parseAmountText,
  parseQuantity,
  rollUp,
  type Batch,
} from './pantry';

const today = new Date(2026, 9, 1, 15, 30); // 1 Oct 2026, local

describe('expiryTagFor', () => {
  // `today` is 1 Oct 2026, so 2026-10-0N is N - 1 days away.
  it('has a dashed "No expiry" tag without an expiry date', () => {
    expect(expiryTagFor(null, today, 3)).toEqual({
      tone: 'none',
      kind: 'none',
    });
  });

  it('is urgent for Expired Batches and for those expiring today', () => {
    expect(expiryTagFor('2026-09-28', today, 3)).toEqual({
      tone: 'urgent',
      kind: 'expired',
    });
    expect(expiryTagFor('2026-09-30', today, 1)).toEqual({
      tone: 'urgent',
      kind: 'expired',
    });
    expect(expiryTagFor('2026-10-01', today, 7)).toEqual({
      tone: 'urgent',
      kind: 'today',
    });
  });

  it('is soon for tomorrow, even with a Stale Threshold of 1', () => {
    for (const threshold of [1, 3, 7]) {
      expect(expiryTagFor('2026-10-02', today, threshold)).toEqual({
        tone: 'soon',
        kind: 'tomorrow',
      });
    }
  });

  it('counts days left up to the Stale Threshold, then plain days after it', () => {
    expect(expiryTagFor('2026-10-03', today, 1)).toEqual({
      tone: 'ok',
      kind: 'days',
      days: 2,
    });
    expect(expiryTagFor('2026-10-03', today, 3)).toEqual({
      tone: 'soon',
      kind: 'daysLeft',
      days: 2,
    });
    expect(expiryTagFor('2026-10-04', today, 3)).toEqual({
      tone: 'soon',
      kind: 'daysLeft',
      days: 3,
    });
    expect(expiryTagFor('2026-10-05', today, 3)).toEqual({
      tone: 'ok',
      kind: 'days',
      days: 4,
    });
    expect(expiryTagFor('2026-10-08', today, 7)).toEqual({
      tone: 'soon',
      kind: 'daysLeft',
      days: 7,
    });
    expect(expiryTagFor('2026-10-09', today, 7)).toEqual({
      tone: 'ok',
      kind: 'days',
      days: 8,
    });
  });

  it('always counts in days, however far away', () => {
    expect(expiryTagFor('2027-10-01', today, 3)).toEqual({
      tone: 'ok',
      kind: 'days',
      days: 365,
    });
  });
});

describe('defaultExpiryDate', () => {
  it('adds the default days to the local date', () => {
    expect(defaultExpiryDate(30, today)).toBe('2026-10-31');
    expect(defaultExpiryDate(0, today)).toBe('2026-10-01');
  });

  it('is empty without a default', () => {
    expect(defaultExpiryDate(null, today)).toBe('');
  });
});

describe('groupByLocation', () => {
  const batch = (id: string, location: Batch['location']): Batch => ({
    id,
    name: id,
    ingredientId: id,
    unmatched: false,
    aisle: null,
    quantity: null,
    unit: null,
    location,
    expiryDate: null,
    productDescription: null,
    createdAt: '2026-10-01T00:00:00Z',
  });

  it('groups in fridge, freezer, cupboard, spices order keeping row order, skipping empty ones', () => {
    const groups = groupByLocation([
      batch('a', 'cupboard'),
      batch('b', 'fridge'),
      batch('c', 'cupboard'),
    ]);
    expect(groups.map((g) => [g.location, g.batches.map((b) => b.id)])).toEqual(
      [
        ['fridge', ['b']],
        ['cupboard', ['a', 'c']],
      ],
    );
  });
});

const make = (overrides: Partial<Batch>): Batch => ({
  id: crypto.randomUUID(),
  name: 'Milk',
  ingredientId: 'milk',
  unmatched: false,
  aisle: null,
  quantity: null,
  unit: null,
  location: 'fridge',
  expiryDate: null,
  productDescription: null,
  createdAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

describe('rollUp', () => {
  it('sums quantities when the units agree and takes the soonest expiry', () => {
    const [row] = rollUp([
      make({ quantity: 0.1, unit: 'l', expiryDate: '2026-10-09' }),
      make({ quantity: 0.2, unit: 'l', expiryDate: '2026-10-05' }),
      make({ quantity: null, expiryDate: null }),
    ]);
    expect(row.totals).toEqual([{ unit: 'l', quantity: 0.3 }]);
    expect(row.soonestExpiry).toBe('2026-10-05');
    expect(row.batches.map((b) => b.expiryDate)).toEqual([
      '2026-10-05',
      '2026-10-09',
      null,
    ]);
  });

  it('lists totals separately when the units differ', () => {
    const [row] = rollUp([
      make({ quantity: 500, unit: 'g' }),
      make({ quantity: 2, unit: 'pcs' }),
      make({ quantity: 250, unit: 'g' }),
    ]);
    expect(row.totals).toEqual([
      { unit: 'g', quantity: 750 },
      { unit: 'pcs', quantity: 2 },
    ]);
  });

  it('keeps Ingredients apart, Unmatched names by name, ordered by soonest expiry', () => {
    const rows = rollUp([
      make({ name: 'Rice', ingredientId: 'rice', expiryDate: '2027-01-01' }),
      make({ name: 'Zorblax', ingredientId: null, unmatched: true }),
      make({ name: 'zorblax', ingredientId: null, unmatched: true }),
      make({ name: 'Milk', expiryDate: '2026-10-02' }),
    ]);
    expect(rows.map((r) => [r.name, r.batches.length])).toEqual([
      ['Milk', 1],
      ['Rice', 1],
      ['Zorblax', 2],
    ]);
  });
});

describe('matchesSearch', () => {
  const batch = make({
    name: 'Mămăligă',
    productDescription: 'Grana Padano 200g',
  });
  it('matches the localised name ignoring case and diacritics', () => {
    expect(matchesSearch(batch, 'MAMALI')).toBe(true);
  });
  it('matches Danish names typed without æ, ø or å', () => {
    expect(matchesSearch(make({ name: 'Mælk' }), 'maelk')).toBe(true);
    expect(matchesSearch(make({ name: 'Rødbeder' }), 'ROEDB')).toBe(true);
    expect(matchesSearch(make({ name: 'Flåede tomater' }), 'flaaede')).toBe(
      true,
    );
  });
  it('matches the Product Description', () => {
    expect(matchesSearch(batch, 'padano')).toBe(true);
  });
  it('matches everything for a blank query and nothing unrelated', () => {
    expect(matchesSearch(batch, '  ')).toBe(true);
    expect(matchesSearch(batch, 'cheddar')).toBe(false);
  });
});

describe('countByLocation', () => {
  it('counts all and each Location', () => {
    expect(
      countByLocation([
        make({ location: 'fridge' }),
        make({ location: 'fridge' }),
        make({ location: 'spices' }),
      ]),
    ).toEqual({ all: 3, fridge: 2, freezer: 0, cupboard: 0, spices: 1 });
  });
});

describe('parseAmountText', () => {
  it('reads a decimal comma as a point', () => {
    expect(parseAmountText('1,5')).toEqual({ value: 1.5, valid: true });
  });

  it('keeps the parseQuantity rules', () => {
    expect(parseAmountText('')).toEqual({ value: null, valid: true });
    expect(parseAmountText('1,2345').valid).toBe(false);
    expect(parseAmountText('1e3').valid).toBe(false);
  });
});

describe('parseQuantity', () => {
  it('treats blank as no quantity', () => {
    expect(parseQuantity('  ')).toEqual({ value: null, valid: true });
  });

  it.each(['0.001', '1', '2.5', '1000000', '.5', '5.'])(
    'accepts %s',
    (text) => {
      expect(parseQuantity(text)).toEqual({ value: Number(text), valid: true });
    },
  );

  it.each([
    '0',
    '-1',
    '0.0004',
    '1.2345',
    '1000000.001',
    '1e3',
    '1E3',
    '0x10',
    '0b1',
    'Infinity',
    ' 5',
    '5 ',
    '+5',
    '2e-3',
    'abc',
  ])('rejects %s', (text) => {
    expect(parseQuantity(text).valid).toBe(false);
  });
});
