import { isExpiringSoon, isUnexpired } from './batch-freshness';

describe('isUnexpired', () => {
  it('counts a Batch with no expiry date', () => {
    expect(isUnexpired(null, '2026-10-11')).toBe(true);
  });

  it('counts a Batch that expires today but not one that expired yesterday', () => {
    expect(isUnexpired('2026-10-11', '2026-10-11')).toBe(true);
    expect(isUnexpired('2026-10-10', '2026-10-11')).toBe(false);
  });
});

describe('isExpiringSoon', () => {
  it('is true up to the Family stale threshold, inclusive', () => {
    expect(isExpiringSoon('2026-10-14', '2026-10-11', 3)).toBe(true);
    expect(isExpiringSoon('2026-10-15', '2026-10-11', 3)).toBe(false);
  });

  it('is false with no expiry date and for an expired Batch', () => {
    expect(isExpiringSoon(null, '2026-10-11', 3)).toBe(false);
    expect(isExpiringSoon('2026-10-10', '2026-10-11', 3)).toBe(false);
  });

  it('crosses month ends', () => {
    expect(isExpiringSoon('2026-11-02', '2026-10-30', 3)).toBe(true);
  });
});
