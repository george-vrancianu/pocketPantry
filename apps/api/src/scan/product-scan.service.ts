import { BadGatewayException, Injectable } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import {
  productScanModelResultSchema,
  type ProductScanInput,
  type ProductScanResult,
} from './product-scan.schemas';

@Injectable()
export class ProductScanService {
  constructor(
    private readonly ai: StructuredOutputAiService,
    private readonly ingredientCatalog: IngredientCatalogService,
  ) {}

  async analyze(
    input: ProductScanInput,
    locale: string,
  ): Promise<ProductScanResult> {
    const catalog = await this.ingredientCatalog.getCatalog();
    const catalogPrompt = this.ingredientCatalog.toPrompt(catalog);

    const content: Array<Record<string, unknown>> = [
      {
        type: 'input_text',
        text: [
          'Analyze these grocery package photos.',
          `The user's locale is ${locale}. Use it as a context hint for product names, abbreviations, and date formats, while prioritizing visible package text. Match catalog ingredients across languages.`,
          'The first image shows the product. Identify its display name and broad product type.',
          'Match it against the application catalog below. Ingredient tuples are [id, name, category].',
          'Return matchedIngredientId only when that exact ID is present in the catalog and is a reasonable semantic match. Never invent an ID.',
          'Return matchedCategory only from the catalog category list. When an ingredient is matched, use its catalog category.',
          'matchConfidence measures confidence in the catalog ingredient match, not image-reading confidence. Use null for matchedIngredientId when no catalog ingredient is a good match.',
          'Always return fallbackIngredientName as a short generic ingredient name suitable for catalog search or creation (for example, "Greek yogurt" becomes "Yogurt").',
          'If a second image is present, it shows the printed expiry or best-before area. Read only a clearly visible expiry/best-before/use-by date.',
          'Return expiryDate as YYYY-MM-DD only when the date is unambiguous. Otherwise return null. Do not mistake batch/lot codes or production dates for expiry dates.',
          'confidence is the overall image recognition confidence from 0 to 1.',
          `Application catalog: ${catalogPrompt}`,
        ].join(' '),
      },
      { type: 'input_image', image_url: input.productImage, detail: 'high' },
    ];
    if (input.expiryImage) {
      content.push({
        type: 'input_image',
        image_url: input.expiryImage,
        detail: 'high',
      });
    }

    try {
      const response = await this.ai.generate({
        prompt: String(content[0].text),
        images: content
          .filter((item) => item.type === 'input_image')
          .map((item) => String(item.image_url)),
        schemaName: 'grocery_product_scan',
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            productName: { type: 'string' },
            productType: { type: 'string' },
            matchedIngredientId: { type: ['string', 'null'] },
            matchedCategory: { type: ['string', 'null'] },
            matchConfidence: {
              type: 'number',
              minimum: 0,
              maximum: 1,
            },
            fallbackIngredientName: { type: 'string' },
            expiryDate: { type: ['string', 'null'] },
            expiryText: { type: ['string', 'null'] },
            confidence: { type: 'number', minimum: 0, maximum: 1 },
          },
          required: [
            'productName',
            'productType',
            'matchedIngredientId',
            'matchedCategory',
            'matchConfidence',
            'fallbackIngredientName',
            'expiryDate',
            'expiryText',
            'confidence',
          ],
        },
        maxOutputTokens: 400,
      });
      const result = productScanModelResultSchema.parse(response.data);
      return {
        ...result,
        ...this.ingredientCatalog.validateMatch(catalog, result),
      };
    } catch {
      throw new BadGatewayException('The image recognition result was invalid');
    }
  }
}
