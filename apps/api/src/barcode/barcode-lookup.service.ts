import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { openFoodFactsCache } from '../database/schema';
import { catalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import type {
  CatalogLocale,
  CatalogSearchResult,
} from '../catalog/catalog.schemas';
import { SettingsService } from '../settings/settings.service';
import type { BarcodeLookupResponse } from './barcode.schemas';
import { findKnownBarcode } from './known-barcodes';
import { parseNetQuantity } from './net-quantity';
import {
  InjectOpenFoodFacts,
  type OpenFoodFactsClient,
  type OpenFoodFactsProduct,
} from './open-food-facts.client';

const DAY_MS = 24 * 60 * 60 * 1000;
/** How long the shared cache keeps a product, and a "not found". */
const HIT_TTL_MS = 30 * DAY_MS;
const NOT_FOUND_TTL_MS = DAY_MS;

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
    @Inject(DATABASE) private readonly database: Database,
  ) {}

  async lookup(
    memberId: string,
    barcode: string,
    locale: CatalogLocale,
  ): Promise<BarcodeLookupResponse> {
    // The resolution order of ADR 0013 starts here. The Family's Known Barcode
    // is checked first and returns before this; the shared cache of
    // Open Food Facts results (#347) wraps `product` so a hit skips the client.
    const familyId = await this.settings.familyIdOf(memberId);
    const known = await this.knownBarcode(familyId, barcode, locale);
    if (known) return known;
    const product = await this.product(barcode);
    if (!product) return { found: false };

    const names = candidateNames(product, locale);
    if (names.length === 0) return { found: false };
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const scope = catalogScope(familyId);
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

  /** What the Family last saved this barcode as, exactly, or null. No Open Food Facts credit. */
  private async knownBarcode(
    familyId: string,
    barcode: string,
    locale: CatalogLocale,
  ): Promise<BarcodeLookupResponse | null> {
    const known = await findKnownBarcode(this.database, familyId, barcode);
    if (!known) return null;
    const base = {
      found: true,
      source: 'known_barcode',
      lowConfidence: false,
      productDescription: known.productDescription ?? '',
      quantity: null,
      unit: null,
    } as const;
    if (known.ingredientId === null) {
      return { ...base, match: null, unmatchedName: known.rawName ?? '' };
    }
    const overrides = await this.settings.expiryOverridesOf(familyId);
    const [match] = await this.catalogSearch.findByIds(
      catalogScope(familyId),
      [known.ingredientId],
      locale,
      overrides,
    );
    return { ...base, match: match ?? null };
  }

  /**
   * The product as Open Food Facts has it, or null. Served from the shared
   * cache while fresh; a failure throws and is never cached.
   */
  private async product(barcode: string): Promise<OpenFoodFactsProduct | null> {
    const now = Date.now();
    const [cached] = await this.database
      .select()
      .from(openFoodFactsCache)
      .where(eq(openFoodFactsCache.barcode, barcode));
    if (cached) {
      const ttl = cached.product ? HIT_TTL_MS : NOT_FOUND_TTL_MS;
      if (now - cached.fetchedAt.getTime() < ttl) return cached.product;
    }
    const product = await this.openFoodFacts.fetchProduct(barcode);
    const fetchedAt = new Date(Date.now());
    await this.database
      .insert(openFoodFactsCache)
      .values({ barcode, product, fetchedAt })
      .onConflictDoUpdate({
        target: openFoodFactsCache.barcode,
        set: { product, fetchedAt },
      });
    return product;
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
      // Limit 2 is only to detect ambiguity: exactly one hit is confident.
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
