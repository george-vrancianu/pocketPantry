import { fromComparable, toComparable } from './units';

describe('toComparable', () => {
  it('scales kg to g and l to ml within a dimension', () => {
    expect(toComparable(1.5, 'kg')).toEqual({
      dimension: 'mass',
      amount: 1500,
    });
    expect(toComparable(250, 'g')).toEqual({ dimension: 'mass', amount: 250 });
    expect(toComparable(2, 'l')).toEqual({ dimension: 'volume', amount: 2000 });
    expect(toComparable(30, 'ml')).toEqual({ dimension: 'volume', amount: 30 });
  });

  it('keeps count in its own dimension', () => {
    expect(toComparable(3, 'pcs')).toEqual({ dimension: 'count', amount: 3 });
  });

  it('has nothing to compare without a quantity or a unit', () => {
    expect(toComparable(null, 'g')).toBeNull();
    expect(toComparable(2, null)).toBeNull();
  });
});

describe('fromComparable', () => {
  it('expresses an amount in a unit of the same dimension', () => {
    expect(fromComparable(1500, 'mass', 'kg')).toBe(1.5);
    expect(fromComparable(1500, 'mass', 'g')).toBe(1500);
    expect(fromComparable(500, 'volume', 'l')).toBe(0.5);
  });

  it('never converts across dimensions', () => {
    expect(fromComparable(500, 'mass', 'ml')).toBeNull();
    expect(fromComparable(2, 'count', 'g')).toBeNull();
  });
});
