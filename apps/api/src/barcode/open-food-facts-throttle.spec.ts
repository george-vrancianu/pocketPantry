import { ConfigService } from '@nestjs/config';
import {
  BarcodeRateLimitedException,
  OpenFoodFactsThrottle,
} from './open-food-facts-throttle';

const config = (member: number, global: number) =>
  ({
    get: (key: string) =>
      key === 'BARCODE_LOOKUP_LIMIT_PER_MEMBER' ? member : global,
  }) as unknown as ConfigService<never, true>;

describe('OpenFoodFactsThrottle', () => {
  let time = 1_000_000;
  const make = (member: number, global: number) =>
    new OpenFoodFactsThrottle(config(member, global), () => time);

  beforeEach(() => {
    time = 1_000_000;
  });

  it('refuses a Member past their limit, telling them how long to wait', () => {
    const throttle = make(2, 100);
    throttle.charge('m1');
    time += 20_000;
    throttle.charge('m1');
    try {
      throttle.charge('m1');
      throw new Error('should have been limited');
    } catch (error) {
      expect(error).toBeInstanceOf(BarcodeRateLimitedException);
      expect((error as BarcodeRateLimitedException).code).toBe(
        'barcode.rate_limited',
      );
      expect((error as BarcodeRateLimitedException).retryAfterSeconds).toBe(40);
    }
    expect(() => throttle.charge('m2')).not.toThrow();
  });

  it('lets a Member through again once the minute is over', () => {
    const throttle = make(1, 100);
    throttle.charge('m1');
    expect(() => throttle.charge('m1')).toThrow(BarcodeRateLimitedException);
    time += 59_999;
    expect(() => throttle.charge('m1')).toThrow(BarcodeRateLimitedException);
    time += 1;
    expect(() => throttle.charge('m1')).not.toThrow();
  });

  it('limits everyone together, and a refused call is not charged', () => {
    const throttle = make(5, 2);
    throttle.charge('m1');
    throttle.charge('m2');
    expect(() => throttle.charge('m3')).toThrow(BarcodeRateLimitedException);
    time += 60_000;
    // m3 was refused, so the new window starts empty for everyone.
    throttle.charge('m3');
    throttle.charge('m3');
    expect(() => throttle.charge('m3')).toThrow(BarcodeRateLimitedException);
  });
});
