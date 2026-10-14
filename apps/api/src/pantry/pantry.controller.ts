import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
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
  ingredientIdParam,
  createBatchBody,
  createBatchesBody,
  updateBatchBody,
  pantryLocaleQuery,
  scanQuery,
  type BatchView,
  type BatchIdParam,
  type IngredientIdParam,
  type CreateBatchBody,
  type CreateBatchesBody,
  type UpdateBatchBody,
  type PantryLocaleQuery,
  type ScanQuery,
} from './pantry.schemas';
import { PantryService } from './pantry.service';
import { RunningLowService } from './running-low.service';

@ApiTags('pantry')
@Controller('pantry')
@UseGuards(AuthGuard)
export class PantryController {
  constructor(
    private readonly pantry: PantryService,
    private readonly runningLow: RunningLowService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      "The Family's Batches, soonest expiry first, names localised, and the Ingredients flagged running low",
  })
  async list(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(pantryLocaleQuery)) query: PantryLocaleQuery,
  ): Promise<{ batches: BatchView[]; runningLow: string[] }> {
    return {
      batches: await this.pantry.list(member.id, query.locale),
      runningLow: await this.runningLow.list(member.id),
    };
  }

  @Put('running-low/:ingredientId')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Flag an Ingredient as running low for the Family (idempotent); cleared by the Pantry toggle',
  })
  async setRunningLow(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(ingredientIdParam))
    params: IngredientIdParam,
  ): Promise<void> {
    await this.runningLow.set(member.id, params.ingredientId);
  }

  @Delete('running-low/:ingredientId')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Clear the running low flag on an Ingredient (idempotent)',
  })
  async clearRunningLow(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(ingredientIdParam))
    params: IngredientIdParam,
  ): Promise<void> {
    await this.runningLow.clear(member.id, params.ingredientId);
  }

  @Post('batches')
  @ApiOperation({
    summary:
      'Add a Batch to the Family Pantry; location and expiry default from the Catalog',
  })
  create(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(scanQuery)) query: ScanQuery,
    @Body(new ZodValidationPipe(createBatchBody)) body: CreateBatchBody,
  ): Promise<BatchView> {
    return this.pantry.create(
      member.id,
      body,
      query.locale,
      query.scanLanguage,
    );
  }

  @Post('batches/bulk')
  @ApiOperation({
    summary:
      'Add the reviewed lines of a Scan as Batches, all or none; the same per-line rules as a single Batch',
  })
  async createMany(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(scanQuery)) query: ScanQuery,
    @Body(new ZodValidationPipe(createBatchesBody)) body: CreateBatchesBody,
  ): Promise<{ batches: BatchView[] }> {
    return {
      batches: await this.pantry.createMany(
        member.id,
        body.batches,
        query.locale,
        query.scanLanguage,
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
