import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/env';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { validateCatalogMatch } from '../ingredients/ingredient-catalog';
import { ReceiptScanService } from './receipt-scan.service';
import { receiptScanResultSchema } from './receipt-scan.schemas';

const ingredientId = 'be0ef2e7-75ea-47d8-b9bf-fc890d64db8e';
const receipt = {
  merchantName: 'Private market',
  purchaseDate: '2026-09-25',
  lines: [
    {
      lineNumber: 1,
      sourceText: 'PRIVATE MILK 1L',
      lineType: 'product',
      includeInPantry: true,
      exclusionReason: null,
      productName: 'Milk',
      productType: 'Dairy',
      matchedIngredientId: ingredientId,
      matchedCategory: 'Dairy',
      matchConfidence: 0.95,
      fallbackIngredientName: 'Milk',
      matchExplanation: 'The line is milk.',
      quantityType: 'package_size',
      purchasedCount: 2,
      quantityPerItem: 1,
      quantityUnit: 'l',
      confidence: 0.99,
    },
  ],
};

describe('ReceiptScanService', () => {
  let service: ReceiptScanService;
  let fetchMock: jest.SpyInstance<
    ReturnType<typeof fetch>,
    Parameters<typeof fetch>
  >;
  let warnMock: jest.SpyInstance;

  beforeEach(() => {
    const catalog = {
      categories: ['Dairy'],
      ingredients: [
        {
          id: ingredientId,
          name: 'Milk',
          category: 'Dairy',
          defaultUnit: 'ml',
        },
      ],
    };
    service = new ReceiptScanService(
      new StructuredOutputAiService({
        get: (key: string) =>
          ({
            AI_PROVIDER: 'openai',
            AI_API_KEY: 'test-key',
            AI_VISION_MODEL: 'gpt-4o-mini',
          })[key],
      } as ConfigService<AppConfig, true>),
      {
        getCatalog: jest.fn().mockResolvedValue(catalog),
        toPrompt: jest.fn().mockReturnValue(JSON.stringify(catalog)),
        validateMatch: validateCatalogMatch,
      } as unknown as IngredientCatalogService,
    );
    fetchMock = jest.spyOn(globalThis, 'fetch');
    warnMock = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  function respond(body: unknown) {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'x-request-id': 'request-test' },
      }),
    );
  }

  it('sends the field constraints to OpenAI and preserves matched quantities', async () => {
    respond({
      status: 'completed',
      output: [
        { type: 'reasoning', summary: [] },
        {
          type: 'message',
          content: [{ type: 'output_text', text: JSON.stringify(receipt) }],
        },
      ],
    });
    const result = await service.analyze(
      { receiptImage: 'data:image/jpeg;base64,YQ==' },
      'ro',
    );
    expect(result.items[0]).toMatchObject({
      matchedIngredientId: ingredientId,
      matchedIngredientName: 'Milk',
      quantity: 2,
      unit: 'l',
      matchConfidence: 0.95,
    });
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    const body: unknown = JSON.parse(request.body as string);
    expect(body).toHaveProperty('max_output_tokens', 16000);
    expect(body).toHaveProperty('text.format.strict', true);
    const schemaPath = 'text.format.schema';
    expect(body).toHaveProperty(`${schemaPath}.additionalProperties`, false);
    expect(body).toHaveProperty(
      `${schemaPath}.properties.purchaseDate.anyOf`,
      expect.arrayContaining([expect.objectContaining({ format: 'date' })]),
    );
    const linesPath = `${schemaPath}.properties.lines`;
    expect(body).toHaveProperty(`${linesPath}.maxItems`, 200);
    expect(body).toHaveProperty(
      `${linesPath}.items.additionalProperties`,
      false,
    );
    const fieldsPath = `${linesPath}.items.properties`;
    expect(body).toHaveProperty(
      `${fieldsPath}.productName.anyOf`,
      expect.arrayContaining([
        expect.objectContaining({ minLength: 1, maxLength: 120 }),
      ]),
    );
    expect(body).toHaveProperty(
      `${fieldsPath}.matchedIngredientId.anyOf`,
      expect.arrayContaining([expect.objectContaining({ format: 'uuid' })]),
    );
    expect(body).toHaveProperty(
      `${fieldsPath}.purchasedCount.anyOf`,
      expect.arrayContaining([
        expect.objectContaining({
          type: 'integer',
          exclusiveMinimum: 0,
          maximum: 1000,
        }),
      ]),
    );
    expect(body).toHaveProperty(
      `${fieldsPath}.quantityPerItem.anyOf`,
      expect.arrayContaining([
        expect.objectContaining({ exclusiveMinimum: 0, maximum: 1000000 }),
      ]),
    );
  });

  it.each([
    {
      quantityType: null,
      purchasedCount: null,
      quantityPerItem: null,
      quantityUnit: null,
    },
    {
      quantityType: 'package_size',
      purchasedCount: 2,
      quantityPerItem: null,
      quantityUnit: 'l',
    },
    {
      quantityType: 'measured',
      purchasedCount: 1,
      quantityPerItem: 2,
      quantityUnit: null,
    },
    {
      quantityType: 'count',
      purchasedCount: null,
      quantityPerItem: null,
      quantityUnit: null,
    },
  ])(
    'keeps a matched grocery with incomplete quantity metadata (%#) in the editable queue',
    async (quantityFields) => {
      const partialReceipt = {
        ...receipt,
        lines: [{ ...receipt.lines[0], sourceText: 'MILK', ...quantityFields }],
      };
      respond({
        status: 'completed',
        output: [
          {
            type: 'message',
            content: [
              { type: 'output_text', text: JSON.stringify(partialReceipt) },
            ],
          },
        ],
      });
      const result = await service.analyze(
        { receiptImage: 'data:image/jpeg;base64,YQ==' },
        'ro',
      );
      expect(receiptScanResultSchema.safeParse(result).success).toBe(true);
      expect(result.lines[0]).toMatchObject({
        includeInPantry: true,
        exclusionReason: null,
        quantity: null,
        matchedIngredientId: ingredientId,
        matchConfidence: 0.95,
      });
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        ...quantityFields,
        quantity: null,
        unit: quantityFields.quantityUnit,
        matchedIngredientId: ingredientId,
        matchedIngredientName: 'Milk',
        matchConfidence: 0.95,
      });
    },
  );

  it('continues to exclude non-grocery lines when their quantities are unknown', async () => {
    respond({
      status: 'completed',
      output: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: JSON.stringify({
                ...receipt,
                lines: [
                  {
                    ...receipt.lines[0],
                    lineType: 'total',
                    includeInPantry: false,
                    sourceText: 'TOTAL',
                    productName: null,
                    productType: null,
                    exclusionReason: 'Receipt total',
                    quantityType: null,
                    purchasedCount: null,
                    quantityPerItem: null,
                    quantityUnit: null,
                  },
                ],
              }),
            },
          ],
        },
      ],
    });
    const result = await service.analyze(
      { receiptImage: 'data:image/jpeg;base64,YQ==' },
      'ro',
    );
    expect(result.items).toEqual([]);
    expect(result.lines[0]).toMatchObject({
      includeInPantry: false,
      exclusionReason: 'Receipt total',
      quantity: null,
    });
  });

  it('returns a specific error for truncated responses without exposing receipt data', async () => {
    respond({
      status: 'incomplete',
      incomplete_details: { reason: 'max_output_tokens' },
      output: [
        {
          type: 'message',
          content: [
            { type: 'output_text', text: '{"merchantName":"Private market"' },
          ],
        },
      ],
    });
    await expect(
      service.analyze({ receiptImage: 'data:image/jpeg;base64,YQ==' }, 'ro'),
    ).rejects.toMatchObject({ code: 'scan.provider_incomplete' });
    expect(warnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'request-test',
        reason: 'incomplete',
      }),
    );
    expect(JSON.stringify(warnMock.mock.calls)).not.toContain('Private market');
  });

  it('logs validation paths without recording source receipt text or invalid field values', async () => {
    const invalid = {
      ...receipt,
      lines: [{ ...receipt.lines[0], purchasedCount: 0 }],
    };
    respond({
      status: 'completed',
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: JSON.stringify(invalid) }],
        },
      ],
    });
    await expect(
      service.analyze({ receiptImage: 'data:image/jpeg;base64,YQ==' }, 'ro'),
    ).rejects.toMatchObject({
      code: 'scan.result_invalid',
    });
    expect(warnMock).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'invalid_fields',
        issues: [{ path: 'lines.0.purchasedCount', code: 'too_small' }],
      }),
    );
    const logs = JSON.stringify(warnMock.mock.calls);
    expect(logs).not.toContain('PRIVATE MILK');
    expect(logs).not.toContain('test-key');
    expect(logs).not.toContain('base64');
  });
});
