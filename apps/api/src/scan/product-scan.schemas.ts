import { z } from 'zod';

export const MAX_IMAGE_DATA_URL_LENGTH = 7_000_000;
export const IMAGE_DATA_URL_PATTERN =
  /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/;

export const imageDataUrlSchema = z
  .string()
  .max(MAX_IMAGE_DATA_URL_LENGTH, 'Image is too large')
  .regex(IMAGE_DATA_URL_PATTERN, 'Image must be a JPEG, PNG, or WebP data URL');

export const productScanSchema = z.object({
  productImage: imageDataUrlSchema,
  expiryImage: imageDataUrlSchema.nullable().optional(),
});

export const productScanModelResultSchema = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  matchedIngredientId: z.uuid().nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80),
  expiryDate: z.iso.date().nullable(),
  expiryText: z.string().trim().max(120).nullable(),
  confidence: z.number().min(0).max(1),
});

export const productScanResultSchema = productScanModelResultSchema.extend({
  matchedIngredientName: z.string().trim().min(1).max(120).nullable(),
  matchedIngredientDefaultUnit: z.string().trim().min(1).max(30).nullable(),
});

export type ProductScanInput = z.infer<typeof productScanSchema>;
export type ProductScanModelResult = z.infer<
  typeof productScanModelResultSchema
>;
export type ProductScanResult = z.infer<typeof productScanResultSchema>;

const openAIResponseSchema = z.object({
  output: z.array(
    z.object({
      content: z.array(
        z.object({
          type: z.string(),
          text: z.string().optional(),
        }),
      ),
    }),
  ),
});

export function parseProductScanOutput(body: unknown): ProductScanModelResult {
  const response = openAIResponseSchema.parse(body);
  const outputText = response.output
    .flatMap((item) => item.content)
    .find((item) => item.type === 'output_text')?.text;
  if (!outputText) throw new Error('The image recognition result was empty');
  return productScanModelResultSchema.parse(JSON.parse(outputText) as unknown);
}
