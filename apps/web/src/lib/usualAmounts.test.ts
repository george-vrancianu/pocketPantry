import { describe, expect, it } from 'vitest';
import {
  convertQuantity,
  parseQuantity,
  resolveAmountScale,
  stepAmount,
  usualAmountsAscending,
  unitsInFamily,
  usualAmountsInPriority,
} from './usualAmounts';

describe('resolveAmountScale', () => {
  it('reads a null or unknown scale as medium', () => {
    expect(resolveAmountScale(null)).toBe('medium');
    expect(resolveAmountScale(undefined)).toBe('medium');
    expect(resolveAmountScale('huge')).toBe('medium');
  });

  it('keeps the three known scales', () => {
    expect(resolveAmountScale('low')).toBe('low');
    expect(resolveAmountScale('large')).toBe('large');
  });
});

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
});

describe('parseQuantity', () => {
  it('reads dot and comma decimals', () => {
    expect(parseQuantity('1.5')).toBe(1.5);
    expect(parseQuantity('1,5')).toBe(1.5);
    expect(parseQuantity(' 250 ')).toBe(250);
  });

  it('has no number for an empty or non-numeric field', () => {
    expect(parseQuantity('')).toBeNull();
    expect(parseQuantity('abc')).toBeNull();
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
