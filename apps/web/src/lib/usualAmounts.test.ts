import { describe, expect, it } from 'vitest';
import {
  convertQuantity,
  parseTypedNumber,
  stepAmount,
  usualAmountsAscending,
  unitsInFamily,
  usualAmountsInPriority,
} from './usualAmounts';

describe('usualAmountsInPriority', () => {
  it.each([
    ['g', 'low', [10, 50, 20, 100, 5, 30, 25, 75, 15]],
    ['g', 'medium', [250, 500, 100, 1000, 200, 300, 750, 400, 150]],
    ['g', 'large', [1000, 2000, 500, 5000, 1500, 3000, 2500, 4000]],
    ['ml', 'low', [10, 50, 20, 100, 5, 30, 15, 25, 75]],
    ['ml', 'medium', [250, 500, 100, 1000, 200, 330, 750, 150, 400]],
    ['ml', 'large', [1000, 2000, 500, 5000, 1500, 3000, 2500, 4000]],
    ['pcs', 'low', [1, 2, 3, 4, 6, 5]],
    ['pcs', 'medium', [6, 12, 1, 2, 10, 4, 3, 8]],
    ['pcs', 'large', [12, 24, 6, 30, 18, 10, 20, 15]],
  ] as const)(
    'offers %s at %s scale in priority order',
    (unit, scale, expected) => {
      expect(usualAmountsInPriority(unit, scale)).toEqual(expected);
    },
  );

  it('displays kilograms and litres converted from the base unit', () => {
    expect(usualAmountsInPriority('kg', 'large')).toEqual([
      1, 2, 0.5, 5, 1.5, 3, 2.5, 4,
    ]);
    expect(usualAmountsInPriority('l', 'medium')).toEqual([
      0.25, 0.5, 0.1, 1, 0.2, 0.33, 0.75, 0.15, 0.4,
    ]);
  });

  it.each([
    ['g', [250, 500, 100, 1000, 50, 750, 200, 150, 300]],
    ['ml', [250, 500, 100, 1000, 50, 750, 200, 150, 300]],
    ['kg', [1, 2, 3, 4, 5]],
    ['l', [1, 2, 3, 4, 5]],
    ['pcs', [1, 2, 3, 4, 6, 12]],
  ] as const)(
    'offers %s from the unit alone when there is no Amount Scale',
    (unit, expected) => {
      expect(usualAmountsInPriority(unit, null)).toEqual(expected);
      expect(usualAmountsInPriority(unit, undefined)).toEqual(expected);
    },
  );

  it('keeps the first four priorities as round anchors for the medium mass scale', () => {
    expect(usualAmountsInPriority('g', 'medium').slice(0, 4)).toEqual([
      250, 500, 100, 1000,
    ]);
  });
});

describe('usualAmountsAscending', () => {
  it('sorts the displayed values ascending', () => {
    expect(usualAmountsAscending('kg', 'large')).toEqual([
      0.5, 1, 1.5, 2, 2.5, 3, 4, 5,
    ]);
    expect(usualAmountsAscending('g', 'low')).toEqual([
      5, 10, 15, 20, 25, 30, 50, 75, 100,
    ]);
  });
});

describe('usualAmountsAscending without an Amount Scale', () => {
  it('sorts the unit-only values ascending', () => {
    expect(usualAmountsAscending('g', null)).toEqual([
      50, 100, 150, 200, 250, 300, 500, 750, 1000,
    ]);
    expect(usualAmountsAscending('pcs', null)).toEqual([1, 2, 3, 4, 6, 12]);
  });
});

describe('convertQuantity', () => {
  it('keeps the amount when going from g to kg and back', () => {
    expect(convertQuantity(1.5, 'kg', 'g')).toBe(1500);
    expect(convertQuantity(1500, 'g', 'kg')).toBe(1.5);
  });

  it('keeps the amount between ml and l', () => {
    expect(convertQuantity(2, 'l', 'ml')).toBe(2000);
    expect(convertQuantity(250, 'ml', 'l')).toBe(0.25);
  });

  it('leaves the number alone for the same unit', () => {
    expect(convertQuantity(3, 'pcs', 'pcs')).toBe(3);
  });

  it('rounds the converted number to three decimals, the most the server stores', () => {
    // 2.5 g is 0.0025 kg; the server takes at most three decimals.
    expect(convertQuantity(2.5, 'g', 'kg')).toBe(0.003);
    expect(convertQuantity(1.2345, 'l', 'ml')).toBe(1234.5);
    expect(convertQuantity(1.2345, 'ml', 'l')).toBe(0.001);
  });

  it('keeps a non-zero amount that would round to zero, so the validator flags it', () => {
    // 0.4 g is 0.0004 kg: rounding it to 0 would silently store 0 g.
    expect(convertQuantity(0.4, 'g', 'kg')).toBeCloseTo(0.0004, 10);
    expect(convertQuantity(0.4, 'g', 'kg')).not.toBe(0);
  });
});

describe('parseTypedNumber', () => {
  it('reads dot and comma decimals', () => {
    expect(parseTypedNumber('1.5')).toBe(1.5);
    expect(parseTypedNumber('1,5')).toBe(1.5);
    expect(parseTypedNumber(' 250 ')).toBe(250);
  });

  it('has no number for an empty or non-numeric field', () => {
    expect(parseTypedNumber('')).toBeNull();
    expect(parseTypedNumber('abc')).toBeNull();
  });
});

describe('stepAmount', () => {
  it('steps by the unit step size', () => {
    expect(stepAmount(250, 1, 'g', false)).toBe(260);
    expect(stepAmount(250, -1, 'g', false)).toBe(240);
    expect(stepAmount(1, 1, 'kg', false)).toBe(1.1);
    expect(stepAmount(0.3, -1, 'kg', false)).toBe(0.2);
    expect(stepAmount(1, 1, 'l', false)).toBe(1.1);
    expect(stepAmount(100, 1, 'ml', false)).toBe(110);
    expect(stepAmount(2, -1, 'pcs', false)).toBe(1);
  });

  it('steps five units with Shift', () => {
    expect(stepAmount(250, 1, 'g', true)).toBe(300);
    expect(stepAmount(250, -1, 'pcs', true)).toBe(245);
    expect(stepAmount(250, 1, 'pcs', true)).toBe(255);
  });

  it('never goes below zero', () => {
    expect(stepAmount(0, -1, 'g', false)).toBe(0);
    expect(stepAmount(3, -1, 'pcs', true)).toBe(0);
  });
});

describe('unitsInFamily', () => {
  it('offers only the units of the same family', () => {
    expect(unitsInFamily('g')).toEqual(['g', 'kg']);
    expect(unitsInFamily('kg')).toEqual(['g', 'kg']);
    expect(unitsInFamily('ml')).toEqual(['ml', 'l']);
    expect(unitsInFamily('pcs')).toEqual(['pcs']);
  });

  it('offers every unit when there is none yet', () => {
    expect(unitsInFamily('')).toEqual(['g', 'kg', 'ml', 'l', 'pcs']);
  });
});
