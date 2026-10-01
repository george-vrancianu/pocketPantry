import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  pantryLocaleQuery,
  type PantryLocaleQuery,
} from '../pantry/pantry.schemas';
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
  constructor(private readonly scan: ScanService) {}

  @Post('product')
  @ApiOperation({
    summary:
      'Product Scan: one proposed line (Match, Product Description, best-before date) for the Review screen. Images are forwarded, never stored.',
  })
  product(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ScanImagePipe(productScanSchema, ['productImage', 'expiryImage']))
    body: ProductScanInput,
  ): Promise<ScanResponse> {
    return this.scan.scanProduct(member.id, body, query.locale);
  }

  @Post('ingredients')
  @ApiOperation({
    summary:
      'Ingredients Scan: one proposed line per loose ingredient in the photo, for the Review screen. The image is forwarded, never stored.',
  })
  ingredients(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ScanImagePipe(ingredientsScanSchema, ['ingredientsImage']))
    body: IngredientsScanInput,
  ): Promise<ScanResponse> {
    return this.scan.scanIngredients(member.id, body, query.locale);
  }
}
