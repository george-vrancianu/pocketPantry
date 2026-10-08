import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createBatchesBody,
  scanQuery,
  type CreateBatchesBody,
  type ScanQuery,
} from '../pantry/pantry.schemas';
import {
  ReceiptConfirmService,
  type ReceiptConfirmation,
} from './receipt-confirm.service';
import {
  receiptScanSchema,
  type ReceiptScanInput,
} from './receipt-scan.schemas';
import type { ScanResponse } from './proposed-line';
import { ScanImagePipe } from './scan-image.pipe';
import { ScanService } from './scan.service';

@ApiTags('scan')
@Controller('scan/receipt')
@UseGuards(AuthGuard)
export class ReceiptScanController {
  constructor(
    private readonly scan: ScanService,
    private readonly confirmation: ReceiptConfirmService,
  ) {}

  @Post()
  @ApiOperation({
    summary:
      'Receipt Scan: one proposed line per purchased item (Match, quantity, unit); non-food lines come back excluded with a reason. Images are forwarded, never stored.',
  })
  receipt(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(scanQuery)) query: ScanQuery,
    @Body(new ScanImagePipe(receiptScanSchema, ['receiptImage']))
    body: ReceiptScanInput,
  ): Promise<ScanResponse> {
    return this.scan.scanReceipt(
      member.id,
      body,
      query.locale,
      query.scanLanguage,
    );
  }

  @Post('confirm')
  @ApiOperation({
    summary:
      'Confirm a reviewed Receipt Scan: saves the lines as Batches, all or none, and returns the unchecked Shopping Items on the active list that match them, for the client to tick',
  })
  confirm(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(scanQuery)) query: ScanQuery,
    @Body(new ZodValidationPipe(createBatchesBody)) body: CreateBatchesBody,
  ): Promise<ReceiptConfirmation> {
    return this.confirmation.confirm(
      member.id,
      body.batches,
      query.locale,
      query.scanLanguage,
    );
  }
}
