import { describe, expect, it } from 'vitest';
import { greetingKeyForHour } from './greeting';

describe('greetingKeyForHour', () => {
  it.each([
    [0, 'morning'],
    [5, 'morning'],
    [11, 'morning'],
    [12, 'afternoon'],
    [17, 'afternoon'],
    [18, 'evening'],
    [23, 'evening'],
  ])('hour %i is %s', (hour, key) => {
    expect(greetingKeyForHour(hour)).toBe(key);
  });
});
