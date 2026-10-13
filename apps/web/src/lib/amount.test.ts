import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { formatRowAmount } from './amount';

const t = ((key: string) => key.replace('common:units.', '')) as TFunction;

describe('formatRowAmount', () => {
  it('has nothing to say without a quantity', () => {
    expect(formatRowAmount({ quantity: null, unit: null }, 'en', t)).toBeNull();
  });

  it('writes the quantity bare when there is no unit', () => {
    expect(formatRowAmount({ quantity: 6, unit: null }, 'en', t)).toBe('6');
  });

  it('formats the quantity for the language', () => {
    expect(formatRowAmount({ quantity: 1.5, unit: 'l' }, 'en', t)).toBe(
      '1.5 l',
    );
    expect(formatRowAmount({ quantity: 1.5, unit: 'l' }, 'da', t)).toBe(
      '1,5 l',
    );
    expect(formatRowAmount({ quantity: 2.5, unit: null }, 'ro', t)).toBe('2,5');
  });
});
