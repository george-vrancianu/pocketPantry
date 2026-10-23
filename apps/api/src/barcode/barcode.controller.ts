import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { MemberLanguageService } from '../member-language/member-language.service';
import { BarcodeLookupService } from './barcode-lookup.service';
import { BarcodeRateLimitedException } from './open-food-facts-throttle';
import { barcodeParams, type BarcodeLookupResponse } from './barcode.schemas';

@ApiTags('barcode')
@Controller('barcode-lookup')
@UseGuards(AuthGuard)
export class BarcodeController {
  constructor(
    private readonly barcodeLookup: BarcodeLookupService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get(':barcode')
  @ApiOperation({
    summary:
      'Barcode Lookup: a Prefill proposal for the add-Batch form (Ingredient match, Product Description, quantity), or not found. Not a Scan: it never counts against the Scan Cap.',
  })
  async lookup(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(barcodeParams)) params: { barcode: string },
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<BarcodeLookupResponse> {
    // Matching, returned names and Known Barcodes all follow the Catalog Language.
    const locale = await this.languages.catalogLanguageOf(member.id);
    try {
      return await this.barcodeLookup.lookup(member.id, params.barcode, locale);
    } catch (error) {
      if (error instanceof BarcodeRateLimitedException) {
        // header() is synchronous and returns the reply for chaining; the result is unused.
        void reply.header('Retry-After', error.retryAfterSeconds);
      }
      throw error;
    }
  }
}
