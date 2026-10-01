import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  batchIdParam,
  createBatchBody,
  createBatchesBody,
  updateBatchBody,
  pantryLocaleQuery,
  type BatchView,
  type BatchIdParam,
  type CreateBatchBody,
  type CreateBatchesBody,
  type UpdateBatchBody,
  type PantryLocaleQuery,
} from './pantry.schemas';
import { PantryService } from './pantry.service';

@ApiTags('pantry')
@Controller('pantry')
@UseGuards(AuthGuard)
export class PantryController {
  constructor(private readonly pantry: PantryService) {}

  @Get()
  @ApiOperation({
    summary: "The Family's Batches, soonest expiry first, names localised",
  })
  async list(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
  ): Promise<{ batches: BatchView[] }> {
    return { batches: await this.pantry.list(member.id, query.locale) };
  }

  @Post('batches')
  @ApiOperation({
    summary:
      'Add a Batch to the Family Pantry; location and expiry default from the Catalog',
  })
  create(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ZodValidationPipe(createBatchBody)) body: CreateBatchBody,
  ): Promise<BatchView> {
    return this.pantry.create(member.id, body, query.locale);
  }

  @Post('batches/bulk')
  @ApiOperation({
    summary:
      'Add the reviewed lines of a Scan as Batches, all or none; the same per-line rules as a single Batch',
  })
  async createMany(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ZodValidationPipe(createBatchesBody)) body: CreateBatchesBody,
  ): Promise<{ batches: BatchView[] }> {
    return {
      batches: await this.pantry.createMany(
        member.id,
        body.batches,
        query.locale,
      ),
    };
  }

  @Patch('batches/:id')
  @ApiOperation({
    summary:
      'Edit a Batch of the Family Pantry (quantity, unit, expiry, Location, Product Description)',
  })
  update(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(batchIdParam)) params: BatchIdParam,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
    @Body(new ZodValidationPipe(updateBatchBody)) body: UpdateBatchBody,
  ): Promise<BatchView> {
    return this.pantry.update(member.id, params.id, body, query.locale);
  }

  @Delete('batches/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a Batch of the Family Pantry' })
  async remove(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(batchIdParam)) params: BatchIdParam,
  ): Promise<void> {
    await this.pantry.remove(member.id, params.id);
  }
}
