import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatShortDate,
  isIsoDate,
  maskDateInput,
  parseDateInput,
} from './dateFormat';

describe('formatDate', () => {
  it('shows an ISO date day-first with a four-digit year', () => {
    expect(formatDate('2027-10-08')).toBe('08.10.2027');
  });

  it('shows the short form with a two-digit year', () => {
    expect(formatShortDate('2027-10-08')).toBe('08.10.27');
  });

  it('shows nothing for an empty or malformed date', () => {
    expect(formatDate('')).toBe('');
    expect(formatShortDate('08.10')).toBe('');
  });
});

describe('isIsoDate', () => {
  it.each(['2027-10-08', '2028-02-29'])('accepts %s', (iso) => {
    expect(isIsoDate(iso)).toBe(true);
  });

  it.each(['', '2027-02-29', '2027-13-01', '2027-1-1', '08.10.2027'])(
    'rejects %s',
    (text) => {
      expect(isIsoDate(text)).toBe(false);
    },
  );
});

describe('maskDateInput', () => {
  it.each([
    ['0', '0'],
    ['08', '08'],
    ['081', '08.1'],
    ['0810', '08.10'],
    ['08102', '08.10.2'],
    ['08102027', '08.10.2027'],
    ['08.10.2027', '08.10.2027'],
    ['08/10/2027', '08.10.2027'],
    ['0810202799', '08.10.2027'],
    ['ab', ''],
  ])('masks %s as %s', (typed, masked) => {
    expect(maskDateInput(typed)).toBe(masked);
  });
});

describe('parseDateInput', () => {
  it('turns a complete day-first date into ISO', () => {
    expect(parseDateInput('08.10.2027')).toBe('2027-10-08');
  });

  it.each(['08.10.202', '31.02.2027', '00.10.2027', ''])(
    'has no date for %s',
    (text) => {
      expect(parseDateInput(text)).toBeNull();
    },
  );
});
