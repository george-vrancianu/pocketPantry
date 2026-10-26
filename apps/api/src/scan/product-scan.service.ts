import { Injectable } from '@nestjs/common';
import type { CatalogReader } from '../catalog/catalog-scope';
import { ApiException } from '../common/api-exception';
import type { CatalogLocale, ScanLanguage } from '../catalog/catalog.schemas';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { catalogIndexInstruction } from '../ingredients/ingredient-catalog';
import { IngredientCatalogService } from '../ingredients/ingredient-catalog.service';
import { fallbackNamePrompt, scanLanguagePrompt } from './scan-language';
import {
  PRODUCT_SCAN_SCHEMA_NAME,
  productScanModelJsonSchema,
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
    locale: CatalogLocale,
    scanLanguage: ScanLanguage,
    reader: CatalogReader,
  ): Promise<ProductScanResult> {
    const catalog = await this.ingredientCatalog.getCatalogIn(reader, locale);
    const catalogPrompt = this.ingredientCatalog.toPrompt(catalog);

    const content: Array<Record<string, unknown>> = [
      {
        type: 'input_text',
        text: [
          'Analyze this grocery package photo.',
          `${scanLanguagePrompt('The text on this package is', scanLanguage, 'product names, abbreviations, and date formats')} Prioritize visible package text. Match catalog ingredients across languages.`,
          'Identify its display name and broad product type.',
          'Match it against the application catalog below.',
          catalogIndexInstruction('matchedIngredientIndex'),
          'Return matchedCategory only from the catalog category list. When an ingredient is matched, use its catalog category.',
          'matchConfidence measures confidence in the catalog ingredient match, not image-reading confidence. Use null for matchedIngredientIndex when no catalog ingredient is a good match.',
          `${fallbackNamePrompt(locale)} (for example, "Greek yogurt" becomes "Yogurt").`,
          'Read an expiry/best-before/use-by date only when it is clearly visible in the photo.',
          'Return expiryDate as YYYY-MM-DD only when the date is unambiguous. Otherwise return null. Do not mistake batch/lot codes or production dates for expiry dates.',
          'netQuantity and netUnit are the package net amount printed on the label, such as 200 and g or 1 and l. Use g, kg, ml, l, or pcs for a piece count; copy any other unit as printed. Use null for both when no net amount is visible. Never guess or sum multipacks.',
          'confidence is the overall image recognition confidence from 0 to 1.',
          `Application catalog: ${catalogPrompt}`,
        ].join(' '),
      },
      { type: 'input_image', image_url: input.productImage, detail: 'high' },
    ];

    try {
      const response = await this.ai.generate({
        prompt: String(content[0].text),
        images: content
          .filter((item) => item.type === 'input_image')
          .map((item) => String(item.image_url)),
        schemaName: PRODUCT_SCAN_SCHEMA_NAME,
        schema: productScanModelJsonSchema,
        maxOutputTokens: 450,
      });
      const result = productScanModelResultSchema.parse(response.data);
      return this.ingredientCatalog.validateMatch(catalog, result);
    } catch (error) {
      if (error instanceof ApiException) throw error;
      throw new ApiException(502, 'scan.result_invalid');
    }
  }
}
