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

/** The rate-limit error `charge` throws, or a failure if it did not. */
const limitedBy = (charge: () => void): BarcodeRateLimitedException => {
  try {
    charge();
  } catch (error) {
    expect(error).toBeInstanceOf(BarcodeRateLimitedException);
    return error as BarcodeRateLimitedException;
  }
  throw new Error('should have been limited');
};

describe('OpenFoodFactsThrottle', () => {
  let time = 1_000_000;
  const make = (member: number, global: number) =>
    Object.assign(new OpenFoodFactsThrottle(config(member, global)), {
      clock: () => time,
    });

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

  it('does not allow a burst at the edge of a minute: calls count while under 60 s old', () => {
    const throttle = make(100, 3);
    time += 59_900;
    throttle.charge('m1');
    throttle.charge('m2');
    throttle.charge('m3');
    time += 100;
    // 60.0 s after the start, but the three calls are only 100 ms old.
    expect(() => throttle.charge('m4')).toThrow(BarcodeRateLimitedException);
    time += 59_899;
    expect(() => throttle.charge('m4')).toThrow(BarcodeRateLimitedException);
    time += 1;
    throttle.charge('m4');
  });

  it('tells a Member to wait until their oldest call is a minute old', () => {
    const throttle = make(2, 100);
    throttle.charge('m1');
    time += 10_000;
    throttle.charge('m1');
    time += 5_000;
    expect(limitedBy(() => throttle.charge('m1'))).toMatchObject({
      retryAfterSeconds: 45,
    });
  });

  it('reports the later of the two waits when both limits are full', () => {
    const throttle = make(1, 2);
    throttle.charge('m1'); // t = 0
    time += 30_000;
    throttle.charge('m2'); // t = 30 s: the API is full, m2 too
    time += 10_000;
    // The API as a whole is free again in 20 s (when m1's call is a minute old), m2 in 50 s.
    expect(limitedBy(() => throttle.charge('m2'))).toMatchObject({
      retryAfterSeconds: 50,
    });
  });
});
