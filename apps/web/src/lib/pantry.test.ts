import { describe, expect, it } from 'vitest';
import {
  defaultExpiryDate,
  expiryChipFor,
  countByLocation,
  groupByLocation,
  matchesSearch,
  rollUp,
  type Batch,
} from './pantry';

const today = new Date(2026, 9, 1, 15, 30); // 1 Oct 2026, local

describe('expiryChipFor', () => {
  it('is urgent for today and for already-expired Batches', () => {
    expect(expiryChipFor('2026-10-01', today)).toEqual({
      tone: 'urgent',
      kind: 'today',
    });
    expect(expiryChipFor('2026-09-28', today)).toEqual({
      tone: 'urgent',
      kind: 'expired',
    });
  });

  it('is soon for 1 to 3 days (the Stale Threshold)', () => {
    expect(expiryChipFor('2026-10-02', today)).toEqual({
      tone: 'soon',
      kind: 'days',
      days: 1,
    });
    expect(expiryChipFor('2026-10-04', today)).toEqual({
      tone: 'soon',
      kind: 'days',
      days: 3,
    });
  });

  it('is ok from 4 days out, showing the date', () => {
    expect(expiryChipFor('2026-10-05', today)).toEqual({
      tone: 'ok',
      kind: 'date',
      days: 4,
    });
  });

  it('has no chip without an expiry date', () => {
    expect(expiryChipFor(null, today)).toBeNull();
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
