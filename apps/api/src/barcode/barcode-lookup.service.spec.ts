import { ConfigService } from '@nestjs/config';
import type { Database } from '../database/database.types';
import type { CatalogSearchService } from '../catalog/catalog-search.service';
import type { SettingsService } from '../settings/settings.service';
import { BarcodeLookupService } from './barcode-lookup.service';
import {
  BarcodeRateLimitedException,
  OpenFoodFactsThrottle,
} from './open-food-facts-throttle';
import type {
  OpenFoodFactsClient,
  OpenFoodFactsProduct,
} from './open-food-facts.client';

const product: OpenFoodFactsProduct = {
  productName: 'Oat drink',
  productNames: {},
  genericName: null,
  genericNames: {},
  quantity: null,
  allergenTags: [],
};

describe('BarcodeLookupService single-flight', () => {
  it("does not hand the charged caller's 429 to a waiter: the waiter pays for its own call", async () => {
    const throttle = new OpenFoodFactsThrottle({
      get: (key: string) =>
        key === 'BARCODE_LOOKUP_LIMIT_PER_MEMBER' ? 1 : 100,
    } as unknown as ConfigService<never, true>);
    throttle.charge('limited'); // this Member has used up their minute
    const asked: string[] = [];
    const client: OpenFoodFactsClient = {
      fetchProduct: (barcode: string) => {
        asked.push(barcode);
        return Promise.resolve(product);
      },
    };
    const database = {
      insert: () => ({
        values: () => ({ onConflictDoUpdate: () => Promise.resolve() }),
      }),
    } as unknown as Database;
    const service = new BarcodeLookupService(
      client,
      {} as CatalogSearchService,
      {} as SettingsService,
      throttle,
      database,
    );
    const internals = service as unknown as {
      freshCached: () => Promise<null>;
      product: (
        memberId: string,
        barcode: string,
      ) => Promise<OpenFoodFactsProduct | null>;
    };
    internals.freshCached = () => Promise.resolve(null);

    // Both are past the cache check together; the first becomes the charged caller.
    const [first, second] = await Promise.allSettled([
      internals.product('limited', '3017620422003'),
      internals.product('other', '3017620422003'),
    ]);

    expect(first.status).toBe('rejected');
    expect((first as PromiseRejectedResult).reason).toBeInstanceOf(
      BarcodeRateLimitedException,
    );
    expect(second).toEqual({ status: 'fulfilled', value: product });
    expect(asked).toEqual(['3017620422003']);
  });
});
