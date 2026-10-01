import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  unmatchedDismissBody,
  unmatchedListQuery,
  unmatchedResolveBody,
  type UnmatchedDismissBody,
  type UnmatchedListQuery,
  type UnmatchedQueueEntry,
  type UnmatchedResolution,
  type UnmatchedResolveBody,
} from './unmatched-queue.schemas';
import { UnmatchedQueueService } from './unmatched-queue.service';

@ApiTags('admin')
@Controller('admin/unmatched')
@UseGuards(AuthGuard, AdminRoleGuard)
export class UnmatchedQueueController {
  constructor(private readonly queue: UnmatchedQueueService) {}

  @Get()
  @ApiOperation({
    summary:
      'Admin only: Unmatched names grouped by normalised raw name, with how many rows carry each',
  })
  async list(
    @Query(new ZodValidationPipe(unmatchedListQuery))
    query: UnmatchedListQuery,
  ): Promise<{ entries: UnmatchedQueueEntry[] }> {
    return { entries: await this.queue.list(query.status) };
  }

  @Post('resolve')
  @ApiOperation({
    summary:
      'Admin only: resolve a name to an existing or new Ingredient; relinks every Batch and Shopping Item and adds the Synonym',
  })
  resolve(
    @Body(new ZodValidationPipe(unmatchedResolveBody))
    body: UnmatchedResolveBody,
  ): Promise<UnmatchedResolution> {
    return this.queue.resolve(body);
  }

  @Post('dismiss')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Admin only: set a name aside; its rows stay Unmatched',
  })
  async dismiss(
    @Body(new ZodValidationPipe(unmatchedDismissBody))
    body: UnmatchedDismissBody,
  ): Promise<void> {
    await this.queue.dismiss(body.normalizedName);
  }
}
