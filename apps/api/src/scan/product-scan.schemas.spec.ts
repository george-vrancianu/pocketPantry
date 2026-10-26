import {
  parseProductScanOutput,
  productScanModelJsonSchema,
  productScanSchema,
} from './product-scan.schemas';

describe('product scan schemas', () => {
  it('accepts the product image', () => {
    expect(
      productScanSchema.safeParse({
        productImage: 'data:image/jpeg;base64,YQ==',
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
      matchedIngredientIndex: 7,
      matchedCategory: 'Dairy',
      matchConfidence: 0.91,
      fallbackIngredientName: 'Yogurt',
      expiryDate: '2026-10-14',
      expiryText: 'EXP 14/10/26',
      netQuantity: 500,
      netUnit: 'g',
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

  it('asks the model for the same rules the answer is parsed with, a Catalog index as an integer or null', () => {
    const properties = productScanModelJsonSchema.properties as Record<
      string,
      Record<string, unknown>
    >;
    expect(properties.matchedIngredientIndex).toMatchObject({
      type: ['integer', 'null'],
    });
    expect(properties.productName).toMatchObject({
      minLength: 1,
      maxLength: 120,
    });
    expect(productScanModelJsonSchema.required).toContain(
      'matchedIngredientIndex',
    );
    expect(productScanModelJsonSchema.additionalProperties).toBe(false);
  });
});
