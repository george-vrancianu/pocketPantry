import { resolveSpokenDate } from './voice-dates';

describe('resolveSpokenDate', () => {
  const today = '2026-10-16';

  it('keeps today and a date within five years', () => {
    expect(resolveSpokenDate('2026-10-16', today)).toBe('2026-10-16');
    expect(resolveSpokenDate('2026-10-23', today)).toBe('2026-10-23');
    expect(resolveSpokenDate('2031-10-16', today)).toBe('2031-10-16');
  });

  it('drops a date in the past', () => {
    expect(resolveSpokenDate('2026-10-15', today)).toBeNull();
    expect(resolveSpokenDate('2020-01-01', today)).toBeNull();
  });

  it('drops a date more than five years ahead', () => {
    expect(resolveSpokenDate('2031-10-17', today)).toBeNull();
    expect(resolveSpokenDate('2040-01-01', today)).toBeNull();
  });

  it('drops dates that are not on the calendar', () => {
    expect(resolveSpokenDate('2026-02-31', today)).toBeNull();
    expect(resolveSpokenDate('2027-02-29', today)).toBeNull();
    expect(resolveSpokenDate('2026-13-01', today)).toBeNull();
    expect(resolveSpokenDate('Friday', today)).toBeNull();
    expect(resolveSpokenDate('2026-10-2', today)).toBeNull();
  });

  it('accepts a real leap day', () => {
    expect(resolveSpokenDate('2028-02-29', today)).toBe('2028-02-29');
  });

  it('bounds a leap-day today at five years on the same calendar day', () => {
    expect(resolveSpokenDate('2033-02-28', '2028-02-29')).toBe('2033-02-28');
    expect(resolveSpokenDate('2033-03-01', '2028-02-29')).toBeNull();
  });

  it('returns null for nothing', () => {
    expect(resolveSpokenDate(null, today)).toBeNull();
    expect(resolveSpokenDate('', today)).toBeNull();
  });
});
