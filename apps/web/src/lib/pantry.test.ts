import { describe, expect, it } from 'vitest';
import {
  defaultExpiryDate,
  expiryChipFor,
  groupByLocation,
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
