import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  createBatchBody,
  pantryLocaleQuery,
  type BatchView,
  type CreateBatchBody,
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
}
