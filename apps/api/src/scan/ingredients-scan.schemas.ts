import { z } from 'zod';
import { imageDataUrlSchema } from './product-scan.schemas';

export const ingredientsScanSchema = z.object({
  ingredientsImage: imageDataUrlSchema,
});
const item = z.object({
  productName: z.string().trim().min(1).max(120),
  productType: z.string().trim().min(1).max(80),
  matchedIngredientId: z.uuid().nullable(),
  matchedCategory: z.string().trim().min(1).max(80).nullable(),
  matchConfidence: z.number().min(0).max(1),
  fallbackIngredientName: z.string().trim().min(1).max(80),
  confidence: z.number().min(0).max(1),
});
export const ingredientsScanModelResultSchema = z.object({
  items: z.array(item).max(100),
});
export const ingredientsScanResultSchema = z.object({
  items: z
    .array(
      item.extend({
        matchedIngredientName: z.string().trim().min(1).max(120).nullable(),
        matchedIngredientDefaultUnit: z
          .string()
          .trim()
          .min(1)
          .max(30)
          .nullable(),
      }),
    )
    .max(100),
});
export type IngredientsScanInput = z.infer<typeof ingredientsScanSchema>;
export type IngredientsScanResult = z.infer<typeof ingredientsScanResultSchema>;
const responseSchema = z.object({
  status: z.string().optional(),
  output: z.array(
    z.object({
      type: z.string().optional(),
      content: z
        .array(z.object({ type: z.string(), text: z.string().optional() }))
        .optional(),
    }),
  ),
});
export function parseIngredientsScanOutput(body: unknown) {
  const response = responseSchema.parse(body);
  if (response.status && response.status !== 'completed')
    throw new Error('scan incomplete');
  const content = response.output
    .filter((entry) => !entry.type || entry.type === 'message')
    .flatMap((entry) => entry.content ?? []);
  if (content.some((entry) => entry.type === 'refusal'))
    throw new Error('scan refused');
  const text = content
    .filter((entry) => entry.type === 'output_text')
    .map((entry) => entry.text ?? '')
    .join('');
  if (!text.trim()) throw new Error('scan empty');
  return ingredientsScanModelResultSchema.parse(JSON.parse(text) as unknown);
}
export const ingredientsScanModelJsonSchema = z.toJSONSchema(
  ingredientsScanModelResultSchema,
  { target: 'draft-7' },
);
delete ingredientsScanModelJsonSchema.$schema;
