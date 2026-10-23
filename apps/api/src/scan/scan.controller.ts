import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { MemberLanguageService } from '../member-language/member-language.service';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { scanQuery, type ScanQuery } from '../pantry/pantry.schemas';
import {
  ingredientsScanSchema,
  type IngredientsScanInput,
} from './ingredients-scan.schemas';
import {
  productScanSchema,
  type ProductScanInput,
} from './product-scan.schemas';
import type { ScanResponse } from './proposed-line';
import { ScanImagePipe } from './scan-image.pipe';
import { ScanService } from './scan.service';

@ApiTags('scan')
@Controller('scan')
@UseGuards(AuthGuard)
export class ScanController {
  constructor(
    private readonly scan: ScanService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Post('product')
  @ApiOperation({
    summary:
      'Product Scan: one proposed line (Match, Product Description, quantity, best-before date) for the Review screen. The image is forwarded, never stored.',
  })
  async product(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(scanQuery)) query: ScanQuery,
    @Body(new ScanImagePipe(productScanSchema, ['productImage']))
    body: ProductScanInput,
  ): Promise<ScanResponse> {
    return this.scan.scanProduct(
      member.id,
      body,
      query.locale,
      await this.languages.scanLanguageOf(
        member.id,
        query.locale,
        query.scanLanguage,
      ),
    );
  }

  @Post('ingredients')
  @ApiOperation({
    summary:
      'Ingredients Scan: one proposed line per loose ingredient in the photo, for the Review screen. The image is forwarded, never stored.',
  })
  async ingredients(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(scanQuery)) query: ScanQuery,
    @Body(new ScanImagePipe(ingredientsScanSchema, ['ingredientsImage']))
    body: IngredientsScanInput,
  ): Promise<ScanResponse> {
    return this.scan.scanIngredients(
      member.id,
      body,
      query.locale,
      await this.languages.scanLanguageOf(
        member.id,
        query.locale,
        query.scanLanguage,
      ),
    );
  }
}
