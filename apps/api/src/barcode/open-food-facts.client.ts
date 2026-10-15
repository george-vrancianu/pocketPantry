import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiException } from '../common/api-exception';
import {
  CATALOG_LOCALES,
  type CatalogLocale,
} from '../catalog/catalog.schemas';
import type { AppConfig } from '../config/env';

/** The Open Food Facts fields a Barcode Lookup uses, with the names per locale already split out. */
export type OpenFoodFactsProduct = {
  productName: string | null;
  productNames: Partial<Record<CatalogLocale, string>>;
  genericName: string | null;
  genericNames: Partial<Record<CatalogLocale, string>>;
  /** The printed net quantity, such as "200 g"; parsed later. */
  quantity: string | null;
  /**
   * The raw `allergens_tags` (such as `en:milk`), mapped onto Allergens at read time.
   * Absent on products cached before allergens were kept.
   */
  allergenTags?: string[];
};

/**
 * The one door to Open Food Facts. A product it does not know is `null`; a
 * failure to reach it throws `barcode.provider_unavailable`. Tests replace the
 * `OPEN_FOOD_FACTS_CLIENT` provider, so none reaches the network.
 */
export type OpenFoodFactsClient = {
  fetchProduct(barcode: string): Promise<OpenFoodFactsProduct | null>;
};

export const OPEN_FOOD_FACTS_CLIENT = Symbol('OPEN_FOOD_FACTS_CLIENT');

const FIELDS = [
  'product_name',
  'generic_name',
  'quantity',
  'allergens_tags',
  ...CATALOG_LOCALES.flatMap((locale) => [
    `product_name_${locale}`,
    `generic_name_${locale}`,
  ]),
];

const text = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

const perLocale = (
  product: Record<string, unknown>,
  prefix: string,
): Partial<Record<CatalogLocale, string>> =>
  Object.fromEntries(
    CATALOG_LOCALES.flatMap((locale) => {
      const value = text(product[`${prefix}_${locale}`]);
      return value ? [[locale, value]] : [];
    }),
  );

/** An Open Food Facts API v2 answer as a product, or null when it has no product. */
export function toOpenFoodFactsProduct(
  body: unknown,
): OpenFoodFactsProduct | null {
  if (typeof body !== 'object' || body === null) return null;
  const { status, product } = body as { status?: unknown; product?: unknown };
  if (status !== 1 || typeof product !== 'object' || product === null) {
    return null;
  }
  const fields = product as Record<string, unknown>;
  return {
    productName: text(fields.product_name),
    productNames: perLocale(fields, 'product_name'),
    genericName: text(fields.generic_name),
    genericNames: perLocale(fields, 'generic_name'),
    quantity: text(fields.quantity),
    allergenTags: Array.isArray(fields.allergens_tags)
      ? fields.allergens_tags.filter(
          (tag): tag is string => typeof tag === 'string',
        )
      : [],
  };
}

const REQUEST_TIMEOUT_MS = 5000;

@Injectable()
export class HttpOpenFoodFactsClient implements OpenFoodFactsClient {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async fetchProduct(barcode: string): Promise<OpenFoodFactsProduct | null> {
    const baseUrl = this.config.get('OPEN_FOOD_FACTS_BASE_URL', {
      infer: true,
    });
    const url = `${baseUrl}/api/v2/product/${barcode}.json?fields=${FIELDS.join(',')}`;
    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          // Open Food Facts asks every client to identify itself.
          'User-Agent': this.config.get('OPEN_FOOD_FACTS_USER_AGENT', {
            infer: true,
          }),
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new ApiException(502, 'barcode.provider_unavailable');
    }
    if (response.status === 404) return null;
    if (!response.ok)
      throw new ApiException(502, 'barcode.provider_unavailable');
    try {
      return toOpenFoodFactsProduct(await response.json());
    } catch {
      throw new ApiException(502, 'barcode.provider_unavailable');
    }
  }
}

export const openFoodFactsClientProvider = {
  provide: OPEN_FOOD_FACTS_CLIENT,
  useClass: HttpOpenFoodFactsClient,
};

/** Injects the client: `constructor(@InjectOpenFoodFacts() client: OpenFoodFactsClient)`. */
export const InjectOpenFoodFacts = () => Inject(OPEN_FOOD_FACTS_CLIENT);
