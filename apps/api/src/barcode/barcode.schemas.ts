import { z } from 'zod';
import type {
  CatalogAllergen,
  CatalogSearchResult,
} from '../catalog/catalog.schemas';
import type { ingredientUnit } from '../database/schema';
import { normalizeBarcode } from './gtin';

/**
 * EAN-8 or UPC-E (8 digits), UPC-A (12) or EAN-13 (13) with a valid check digit,
 * parsed to its one canonical form (see `normalizeBarcode`).
 */
export const barcodeValue = z.string().transform((raw, ctx) => {
  const barcode = normalizeBarcode(raw);
  if (barcode === null) {
    ctx.addIssue({ code: 'custom', message: 'invalid barcode' });
    return z.NEVER;
  }
  return barcode;
});
export const barcodeParams = z.object({ barcode: barcodeValue });

/**
 * What a Barcode Lookup proposes to Prefill the add-Batch form: an Ingredient
 * match (only a confident one), the Product Description, and the net quantity.
 */
export type BarcodeLookupResponse =
  | { found: false }
  | {
      found: true;
      /** Where the values came from; the form credits Open Food Facts for that one only. */
      source: 'open_food_facts' | 'known_barcode';
      /** The Catalog Ingredient with its defaults, as a search result, so the form can apply Location and Default Expiry. */
      match: CatalogSearchResult | null;
      /** A match the lookup was unsure of; always false for now, since only confident hits are returned. */
      lowConfidence: boolean;
      /** A Known Barcode saved under a typed name: the Prefill fills this exact name, and `match` is null. */
      unmatchedName?: string;
      productDescription: string;
      quantity: number | null;
      /**
       * The active Allergens Open Food Facts lists for the product (never retired ones),
       * named in the requested locale. Empty when it lists none: that is not "contains none".
       * The form proposes them in the "Contains" row of a new Family Ingredient.
       */
      allergens: CatalogAllergen[];
      /**
       * The listed Allergens the matched Ingredient is not tagged with: an informational
       * note only, it changes no tags. Empty without a match.
       */
      missingAllergens: CatalogAllergen[];
      unit: (typeof ingredientUnit.enumValues)[number] | null;
    };
