import { z } from 'zod';
import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { ingredientUnit } from '../database/schema';

/** EAN-8 or UPC-E (8 digits), UPC-A (12) or EAN-13 (13): digits only. */
export const barcodeParams = z.object({
  barcode: z.string().regex(/^(?:\d{8}|\d{12}|\d{13})$/),
});

/**
 * What a Barcode Lookup proposes to Prefill the add-Batch form: an Ingredient
 * match (only a confident one), the Product Description, and the net quantity.
 */
export type BarcodeLookupResponse =
  | { found: false }
  | {
      found: true;
      /** Where the values came from; the form credits Open Food Facts for that one. */
      source: 'open_food_facts';
      match: Pick<CatalogSearchResult, 'id' | 'name' | 'defaultUnit'> | null;
      /** A match the lookup was unsure of; always false for now, since only confident hits are returned. */
      lowConfidence: boolean;
      productDescription: string;
      quantity: number | null;
      unit: (typeof ingredientUnit.enumValues)[number] | null;
    };
