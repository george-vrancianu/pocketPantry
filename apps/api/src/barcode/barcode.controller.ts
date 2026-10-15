import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  pantryLocaleQuery,
  type PantryLocaleQuery,
} from '../pantry/pantry.schemas';
import { BarcodeLookupService } from './barcode-lookup.service';
import { barcodeParams, type BarcodeLookupResponse } from './barcode.schemas';

@ApiTags('barcode')
@Controller('barcode-lookup')
@UseGuards(AuthGuard)
export class BarcodeController {
  constructor(private readonly barcodeLookup: BarcodeLookupService) {}

  @Get(':barcode')
  @ApiOperation({
    summary:
      'Barcode Lookup: a Prefill proposal for the add-Batch form (Ingredient match, Product Description, quantity), or not found. Not a Scan: it never counts against the Scan Cap.',
  })
  lookup(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(barcodeParams)) params: { barcode: string },
    @Query(new ZodValidationPipe(pantryLocaleQuery))
    query: PantryLocaleQuery,
  ): Promise<BarcodeLookupResponse> {
    return this.barcodeLookup.lookup(member.id, params.barcode, query.locale);
  }
}
