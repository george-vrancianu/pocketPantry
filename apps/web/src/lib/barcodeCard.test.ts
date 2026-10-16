import { describe, expect, it } from 'vitest';
import { barcodeCardLine, barcodeLine, type BarcodeLookup } from './barcode';
import type { CatalogSearchResult } from './catalog';

const yogurt = { id: 'yogurt-id', name: 'Yogurt' } as CatalogSearchResult;

describe('barcodeCardLine', () => {
  it('carries a low-confidence lookup with a match exactly as the add-Batch Prefill reads it', () => {
    const lookup: Extract<BarcodeLookup, { found: true }> = {
      found: true,
      source: 'open_food_facts',
      match: yogurt,
      lowConfidence: true,
      productDescription: 'Greek yogurt',
      quantity: 400,
      unit: 'g',
      allergens: [],
      missingAllergens: [],
    };
    expect(barcodeCardLine('594', lookup)).toMatchObject({
      ...barcodeLine(lookup),
      barcode: '594',
      match: yogurt,
      lowConfidence: true,
    });
  });
});
