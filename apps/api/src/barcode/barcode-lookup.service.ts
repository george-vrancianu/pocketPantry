import { Injectable } from '@nestjs/common';
import { catalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type {
  CatalogLocale,
  CatalogSearchResult,
} from '../catalog/catalog.schemas';
import { SettingsService } from '../settings/settings.service';
import type { BarcodeLookupResponse } from './barcode.schemas';
import { parseNetQuantity } from './net-quantity';
import {
  InjectOpenFoodFacts,
  type OpenFoodFactsClient,
  type OpenFoodFactsProduct,
} from './open-food-facts.client';

/**
 * Barcode Lookup (ADR 0013): a barcode as a Prefill proposal. Not a Scan, so
 * it never touches the Scan Cap, and there is no AI call: the Ingredient is
 * matched by exact name or Synonym, then by the Catalog search.
 */
@Injectable()
export class BarcodeLookupService {
  constructor(
    @InjectOpenFoodFacts() private readonly openFoodFacts: OpenFoodFactsClient,
    private readonly catalogSearch: CatalogSearchService,
    private readonly settings: SettingsService,
  ) {}

  async lookup(
    memberId: string,
    barcode: string,
    locale: CatalogLocale,
  ): Promise<BarcodeLookupResponse> {
    // The resolution order of ADR 0013 starts here. The Family's Known Barcode
    // (#348) is checked first and returns before this; the shared cache of
    // Open Food Facts results (#347) wraps `product` so a hit skips the client.
    const product = await this.product(barcode);
    if (!product) return { found: false };

    const names = candidateNames(product, locale);
    if (names.length === 0) return { found: false };
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const scope = catalogScope(await this.settings.familyIdOf(memberId));
    const match = await this.confidentMatch(scope, names, locale, overrides);
    return {
      found: true,
      source: 'open_food_facts',
      match,
      lowConfidence: false,
      productDescription: names[0],
      ...parseNetQuantity(product.quantity),
    };
  }

  /** The product as Open Food Facts has it, or null. */
  private product(barcode: string): Promise<OpenFoodFactsProduct | null> {
    return this.openFoodFacts.fetchProduct(barcode);
  }

  private async confidentMatch(
    scope: ReturnType<typeof catalogScope>,
    names: string[],
    locale: CatalogLocale,
    overrides: Awaited<ReturnType<SettingsService['expiryOverridesForMember']>>,
  ): Promise<CatalogSearchResult | null> {
    // Exact name or Synonym first; the Family's entries win (ADR 0011).
    const exact = await this.catalogSearch.findExact(
      scope,
      names,
      locale,
      overrides,
    );
    for (const name of names) {
      const hit = exact.get(name);
      if (hit) return hit;
    }
    // Then the Catalog search; only an unambiguous hit (one Ingredient) is confident.
    for (const name of names) {
      const hits = await this.catalogSearch.search(
        scope,
        name,
        locale,
        2,
        overrides,
      );
      if (hits.length === 1) return hits[0];
    }
    return null;
  }
}

/**
 * The names to try, best first: the product name in the Member's locale, then
 * the generic name, then English, then whatever Open Food Facts calls it.
 */
function candidateNames(
  product: OpenFoodFactsProduct,
  locale: CatalogLocale,
): string[] {
  const ordered = [
    product.productNames[locale],
    product.genericNames[locale],
    product.genericName,
    product.productNames.en,
    product.genericNames.en,
    product.productName,
  ];
  return [...new Set(ordered.filter((name): name is string => Boolean(name)))];
}
