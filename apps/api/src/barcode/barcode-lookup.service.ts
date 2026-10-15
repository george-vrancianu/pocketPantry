import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../database/database.constants';
import type { Database } from '../database/database.types';
import { ingredientAllergens, openFoodFactsCache } from '../database/schema';
import type { ExpiryOverride } from '../catalog/catalog-defaults';
import { catalogScope } from '../catalog/catalog-scope';
import { CatalogSearchService } from '../catalog/catalog-search.service';
import { seedId } from '../catalog/seed/seed-ids';
import type {
  CatalogAllergen,
  CatalogLocale,
  CatalogSearchResult,
} from '../catalog/catalog.schemas';
import { SettingsService } from '../settings/settings.service';
import type { BarcodeLookupResponse } from './barcode.schemas';
import { allergenSlugsOf } from './open-food-facts-allergens';
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
/** The Batch's Product Description limit (pantry.schemas). */
const DESCRIPTION_MAX = 200;

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
    const scope = catalogScope(familyId);
    const known = await this.knownBarcode(familyId, barcode, locale, scope);
    if (known) return known;
    const product = await this.product(barcode);
    if (!product) return { found: false };

    const names = candidateNames(product, locale);
    if (names.length === 0) return { found: false };
    const overrides = await this.settings.expiryOverridesForMember(memberId);
    const match = await this.confidentMatch(scope, names, locale, overrides);
    const listed = await this.listedAllergens(scope, locale, product);
    return {
      found: true,
      source: 'open_food_facts',
      match,
      lowConfidence: false,
      allergens: listed,
      missingAllergens: await this.untaggedOn(match, listed),
      productDescription: names[0].slice(0, DESCRIPTION_MAX),
      ...parseNetQuantity(product.quantity),
    };
  }

  /** What the Family last saved this barcode as, exactly, or null. No Open Food Facts credit. */
  private async knownBarcode(
    familyId: string,
    barcode: string,
    locale: CatalogLocale,
    scope: ReturnType<typeof catalogScope>,
  ): Promise<BarcodeLookupResponse | null> {
    const known = await findKnownBarcode(this.database, familyId, barcode);
    if (!known) return null;
    // Known Barcodes keep no allergens: re-read them from the shared cache, never fetching.
    const listed = await this.listedAllergens(
      scope,
      locale,
      await this.cachedProduct(barcode),
    );
    const base = {
      found: true,
      source: 'known_barcode',
      lowConfidence: false,
      allergens: listed,
      productDescription: (known.productDescription ?? '').slice(
        0,
        DESCRIPTION_MAX,
      ),
      quantity: null,
      unit: null,
    } as const;
    if (known.ingredientId === null) {
      return {
        ...base,
        match: null,
        missingAllergens: [],
        unmatchedName: known.rawName ?? '',
      };
    }
    const overrides = await this.settings.expiryOverridesOf(familyId);
    const [match] = await this.catalogSearch.findByIds(
      catalogScope(familyId),
      [known.ingredientId],
      locale,
      overrides,
    );
    // Not in the Family's scope any more: let Open Food Facts answer instead.
    if (!match) return null;
    return {
      ...base,
      match,
      missingAllergens: await this.untaggedOn(match, listed),
    };
  }

  /** The product while the shared cache holds it fresh, or null. Never calls Open Food Facts. */
  private async cachedProduct(
    barcode: string,
  ): Promise<OpenFoodFactsProduct | null> {
    const [cached] = await this.database
      .select()
      .from(openFoodFactsCache)
      .where(eq(openFoodFactsCache.barcode, barcode));
    if (!cached?.product) return null;
    return Date.now() - cached.fetchedAt.getTime() < HIT_TTL_MS
      ? cached.product
      : null;
  }

  /** The product's mapped Allergens that are still active, named in `locale`, in list order. */
  private async listedAllergens(
    scope: ReturnType<typeof catalogScope>,
    locale: CatalogLocale,
    product: OpenFoodFactsProduct | null,
  ): Promise<CatalogAllergen[]> {
    const ids = new Set(
      allergenSlugsOf(product?.allergenTags).map((slug) =>
        seedId.allergen(slug),
      ),
    );
    if (ids.size === 0) return [];
    // listAllergens leaves out retired Allergens, which are never proposed or noted.
    return (await this.catalogSearch.listAllergens(scope, locale)).filter(
      (allergen) => ids.has(allergen.id),
    );
  }

  /** The `listed` Allergens the matched Ingredient is not tagged with. */
  private async untaggedOn(
    match: CatalogSearchResult | null,
    listed: CatalogAllergen[],
  ): Promise<CatalogAllergen[]> {
    if (!match || listed.length === 0) return [];
    const tagged = new Set(
      (
        await this.database
          .select({ id: ingredientAllergens.allergenId })
          .from(ingredientAllergens)
          .where(eq(ingredientAllergens.ingredientId, match.id))
      ).map((row) => row.id),
    );
    return listed.filter((allergen) => !tagged.has(allergen.id));
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
    const fetched = await this.openFoodFacts.fetchProduct(barcode);
    // A product with no usable name cannot prefill anything: it is a not found.
    const product = fetched && hasName(fetched) ? fetched : null;
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
    overrides: ExpiryOverride[],
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
  return [
    ...new Set(ordered.filter((name): name is string => Boolean(name?.trim()))),
  ];
}

function hasName(product: OpenFoodFactsProduct): boolean {
  return [
    product.productName,
    product.genericName,
    ...Object.values(product.productNames),
    ...Object.values(product.genericNames),
  ].some((name) => Boolean(name?.trim()));
}
