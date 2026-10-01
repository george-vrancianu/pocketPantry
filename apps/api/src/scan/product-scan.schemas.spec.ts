import {
  parseProductScanOutput,
  productScanSchema,
} from './product-scan.schemas';

describe('product scan schemas', () => {
  it('accepts the two supported image inputs', () => {
    expect(
      productScanSchema.safeParse({
        productImage: 'data:image/jpeg;base64,YQ==',
        expiryImage: 'data:image/png;base64,Yg==',
      }).success,
    ).toBe(true);
  });

  it('rejects non-image data URLs', () => {
    expect(
      productScanSchema.safeParse({
        productImage: 'data:text/plain;base64,YQ==',
      }).success,
    ).toBe(false);
  });

  it('extracts and validates a structured recognition result', () => {
    const result = {
      productName: 'Plain Greek yogurt',
      productType: 'Dairy product',
      matchedIngredientId: 'be0ef2e7-75ea-47d8-b9bf-fc890d64db8e',
      matchedCategory: 'Dairy',
      matchConfidence: 0.91,
      fallbackIngredientName: 'Yogurt',
      expiryDate: '2026-10-14',
      expiryText: 'EXP 14/10/26',
      confidence: 0.94,
    };

    expect(
      parseProductScanOutput({
        output: [
          {
            content: [{ type: 'output_text', text: JSON.stringify(result) }],
          },
        ],
      }),
    ).toEqual(result);
  });

  it('rejects ambiguous or malformed output instead of guessing', () => {
    expect(() =>
      parseProductScanOutput({
        output: [
          {
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  productName: 'Milk',
                  expiryDate: '04/05/26',
                  confidence: 2,
                }),
              },
            ],
          },
        ],
      }),
    ).toThrow();
  });
});
