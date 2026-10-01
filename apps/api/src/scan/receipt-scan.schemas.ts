import { z } from 'zod';
import { imageDataUrlSchema } from './product-scan.schemas';

export const receiptScanSchema = z.object({
  receiptImage: imageDataUrlSchema,
});

export const receiptScanLineTypeSchema = z.enum([
  'product',
  'discount',
  'fee',
  'deposit',
  'subtotal',
  'tax',
  'total',
  'payment',
  'other',
]);

export const receiptScanQuantityTypeSchema = z.enum([
  'count',
  'package_size',
  'measured',
]);

export const receiptScanModelLineSchema = z.object({
  lineNumber: z.number().int().positive().max(500),
  sourceText: z.string().trim().min(1).max(160),
  lineType: receiptScanLineTypeSchema,
  includeInPantry: z.boolean(),
  exclusionReason: z.string().trim().min(1).max(300).nullable(),
  productName: z.string().trim().min(1).max(120).nullable(),
  productType: z.string().trim().min(1).max(80).nullable(),
  matchedIngredientId: z.uuid().nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80).nullable(),
  matchExplanation: z.string().trim().min(1).max(300),
  quantityType: receiptScanQuantityTypeSchema.nullable(),
  purchasedCount: z.number().int().positive().max(1_000).nullable(),
  quantityPerItem: z.number().positive().max(1_000_000).nullable(),
  quantityUnit: z.string().trim().min(1).max(30).nullable(),
  confidence: z.number().min(0).max(1),
});

export const receiptScanResultLineSchema = receiptScanModelLineSchema.extend({
  matchedIngredientName: z.string().trim().min(1).max(120).nullable(),
  matchedIngredientDefaultUnit: z.string().trim().min(1).max(30).nullable(),
  quantity: z.number().positive().max(1_000_000).nullable(),
  unit: z.string().trim().min(1).max(30).nullable(),
});

export const receiptScanResultItemSchema = z.object({
  lineNumber: z.number().int().positive().max(500),
  sourceText: z.string().trim().min(1).max(160),
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  matchedIngredientId: z.uuid().nullable(),
  matchedIngredientName: z.string().trim().min(1).max(120).nullable(),
  matchedIngredientDefaultUnit: z.string().trim().min(1).max(30).nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80),
  matchExplanation: z.string().trim().min(1).max(300),
  quantityType: receiptScanQuantityTypeSchema.nullable(),
  purchasedCount: z.number().int().positive().max(1_000).nullable(),
  quantityPerItem: z.number().positive().max(1_000_000).nullable(),
  quantityUnit: z.string().trim().min(1).max(30).nullable(),
  quantity: z.number().positive().max(1_000_000).nullable(),
  unit: z.string().trim().min(1).max(30).nullable(),
  confidence: z.number().min(0).max(1),
});

export const receiptScanModelResultSchema = z.object({
  merchantName: z.string().trim().max(120).nullable(),
  purchaseDate: z.iso.date().nullable(),
  lines: z.array(receiptScanModelLineSchema).max(200),
});

// Generate the upstream contract from the same rules used to parse its result.
// A hand-written, looser schema lets invalid dates, blank names, and invalid
// quantities through Structured Outputs only to fail validation locally.
export const receiptScanModelJsonSchema = z.toJSONSchema(
  receiptScanModelResultSchema,
  { target: 'draft-7' },
);
delete receiptScanModelJsonSchema.$schema;

export const receiptScanResultSchema = z.object({
  merchantName: z.string().trim().max(120).nullable(),
  purchaseDate: z.iso.date().nullable(),
  lines: z.array(receiptScanResultLineSchema).max(200),
  items: z.array(receiptScanResultItemSchema).max(200),
});

export type ReceiptScanInput = z.infer<typeof receiptScanSchema>;
export type ReceiptScanModelResult = z.infer<
  typeof receiptScanModelResultSchema
>;
export type ReceiptScanResult = z.infer<typeof receiptScanResultSchema>;

const openAIResponseSchema = z.object({
  status: z.string().optional(),
  incomplete_details: z.object({ reason: z.string() }).nullable().optional(),
  output: z.array(
    z.object({
      type: z.string().optional(),
      content: z
        .array(
          z.object({
            type: z.string(),
            text: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
});

export class ReceiptScanOutputError extends Error {
  constructor(readonly code: 'incomplete' | 'refusal' | 'empty' | 'failed') {
    const messages = {
      incomplete:
        'The receipt scan was cut off before it finished. Try scanning a smaller section of the receipt.',
      refusal:
        'The receipt image could not be processed. Try a clear photo of the receipt only.',
      empty:
        'The receipt scan returned no readable result. Please try again with a clearer photo.',
      failed:
        'The receipt recognition service could not finish the scan. Please try again.',
    };
    super(messages[code]);
    this.name = 'ReceiptScanOutputError';
  }
}

export function parseReceiptScanOutput(body: unknown): ReceiptScanModelResult {
  const response = openAIResponseSchema.parse(body);
  if (response.status === 'incomplete')
    throw new ReceiptScanOutputError('incomplete');
  if (response.status && response.status !== 'completed')
    throw new ReceiptScanOutputError('failed');
  const content = response.output
    .filter((item) => !item.type || item.type === 'message')
    .flatMap((item) => item.content ?? []);
  if (content.some((item) => item.type === 'refusal'))
    throw new ReceiptScanOutputError('refusal');
  const outputText = content
    .filter((item) => item.type === 'output_text')
    .map((item) => item.text ?? '')
    .join('');
  if (!outputText.trim()) throw new ReceiptScanOutputError('empty');
  return receiptScanModelResultSchema.parse(JSON.parse(outputText) as unknown);
}
