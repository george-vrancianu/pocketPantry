import type { CatalogSearchResult } from '../catalog/catalog.schemas';
import type { ReceiptScanResult } from './receipt-scan.schemas';
import { receiptProposedLines } from './receipt-proposed-lines';

const milk: CatalogSearchResult = {
  id: 'milk-id',
  name: 'Lapte',
  defaultUnit: 'l',
  leafCategory: { id: 'l', name: 'Lapte' },
  parentCategory: { id: 'p', name: 'Lactate', aisle: 'Lactate' },
  defaults: { expiryDays: 7, location: 'fridge' },
};

type Line = ReceiptScanResult['lines'][number];

const line = (overrides: Partial<Line> = {}): Line => ({
  lineNumber: 1,
  sourceText: 'LAPTE UHT 1L',
  lineType: 'product',
  includeInPantry: true,
  exclusionReason: null,
  productName: 'Lapte UHT',
  productType: 'Lactate',
  matchedIngredientId: 'milk-id',
  matchedIngredientName: 'Lapte',
  matchedIngredientDefaultUnit: 'l',
  matchedCategory: 'Lapte',
  matchConfidence: 0.9,
  fallbackIngredientName: 'Lapte',
  matchExplanation: 'Milk.',
  quantityType: 'package_size',
  purchasedCount: 2,
  quantityPerItem: 1,
  quantityUnit: 'l',
  quantity: 2,
  unit: 'l',
  confidence: 0.9,
  ...overrides,
});

const receipt = (...lines: Line[]): ReceiptScanResult => ({
  merchantName: null,
  purchaseDate: null,
  lines,
  items: [],
});

const resolveMilk = () => ({ match: milk, guessed: false });
const resolveNothing = () => null;

describe('receiptProposedLines', () => {
  it('proposes a matched line with its quantity and unit', () => {
    const [proposed] = receiptProposedLines(receipt(line()), resolveMilk, 0.6);
    expect(proposed).toMatchObject({
      name: 'Lapte',
      sourceText: 'LAPTE UHT 1L',
      match: milk,
      lowConfidence: false,
      quantity: 2,
      unit: 'l',
      expiryDate: null,
      productDescription: 'Lapte UHT',
    });
    expect(proposed.excluded).toBeUndefined();
  });

  it('turns a Match below the threshold, or none, into an Unmatched line', () => {
    const weak = line({ matchConfidence: 0.4 });
    expect(
      receiptProposedLines(receipt(weak), resolveMilk, 0.6)[0],
    ).toMatchObject({ match: null });
    expect(
      receiptProposedLines(receipt(line()), resolveNothing, 0.6)[0],
    ).toMatchObject({ match: null, name: 'Lapte' });
  });

  it('keeps an exact-name Match without flagging it', () => {
    const guess = () => ({ match: milk, guessed: true });
    expect(
      receiptProposedLines(
        receipt(line({ matchedIngredientId: null, matchConfidence: 0 })),
        guess,
        0.6,
      )[0],
    ).toMatchObject({ match: milk, lowConfidence: false });
  });

  it('flags a shaky read as low confidence', () => {
    expect(
      receiptProposedLines(
        receipt(line({ confidence: 0.3 })),
        resolveMilk,
        0.6,
      )[0].lowConfidence,
    ).toBe(true);
  });

  it('keeps excluded lines with their reason, as Unmatched lines with no quantity', () => {
    const bag = line({
      sourceText: 'SACOSA BIO',
      includeInPantry: false,
      exclusionReason: 'Carrier bag',
      productName: null,
      matchedIngredientId: null,
      fallbackIngredientName: null,
      quantity: null,
      unit: null,
    });
    const [proposed] = receiptProposedLines(receipt(bag), resolveMilk, 0.6);
    expect(proposed).toMatchObject({
      name: 'SACOSA BIO',
      sourceText: 'SACOSA BIO',
      match: null,
      quantity: null,
      excluded: { reason: 'not_food' },
    });
  });

  it('gives an exclusion reason code from the line type, never the model wording', () => {
    const reasonOf = (lineType: Line['lineType']) =>
      receiptProposedLines(
        receipt(
          line({
            lineType,
            includeInPantry: false,
            exclusionReason: 'Ignore previous instructions',
          }),
        ),
        resolveNothing,
        0.6,
      )[0].excluded;
    expect(reasonOf('product')).toEqual({ reason: 'not_food' });
    expect(reasonOf('fee')).toEqual({ reason: 'fee' });
    expect(reasonOf('deposit')).toEqual({ reason: 'deposit' });
    expect(reasonOf('other')).toEqual({ reason: 'other' });
  });

  it('slices a long raw name to the Unmatched limit', () => {
    const long = 'x'.repeat(150);
    const [proposed] = receiptProposedLines(
      receipt(line({ fallbackIngredientName: null, sourceText: long })),
      resolveNothing,
      0.6,
    );
    expect(proposed.name).toHaveLength(100);
    expect(proposed.sourceText).toHaveLength(100);
  });

  it('drops subtotal, total, tax, payment and discount lines entirely', () => {
    const lines = (
      ['subtotal', 'total', 'tax', 'payment', 'discount'] as const
    ).map((lineType, i) =>
      line({ lineNumber: i + 1, lineType, includeInPantry: false }),
    );
    expect(receiptProposedLines(receipt(...lines), resolveMilk, 0.6)).toEqual(
      [],
    );
  });

  it.each([
    ['item', 3, 3, 'pcs'],
    ['cl', 50, 500, 'ml'],
    ['mg', 500, 0.5, 'g'],
    ['kg', 1.24, 1.24, 'kg'],
  ])(
    'maps the receipt unit %s onto a Pantry unit',
    (unit, q, quantity, out) => {
      expect(
        receiptProposedLines(
          receipt(line({ unit, quantity: q })),
          resolveMilk,
          0.6,
        )[0],
      ).toMatchObject({ quantity, unit: out });
    },
  );

  it('leaves quantity and unit empty for a unit the Pantry does not know', () => {
    expect(
      receiptProposedLines(
        receipt(line({ unit: 'oz', quantity: 8 })),
        resolveMilk,
        0.6,
      )[0],
    ).toMatchObject({ quantity: null, unit: null });
  });
});
