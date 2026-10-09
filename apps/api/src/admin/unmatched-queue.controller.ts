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
  unmatchedNameBody,
  unmatchedListQuery,
  unmatchedResolveBody,
  type UnmatchedNameBody,
  type UnmatchedListQuery,
  type UnmatchedQueuePage,
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
      'Admin only: Unmatched names grouped by normalised raw name, with how many rows carry each, most frequent first, one page at a time',
  })
  async list(
    @Query(new ZodValidationPipe(unmatchedListQuery))
    query: UnmatchedListQuery,
  ): Promise<UnmatchedQueuePage> {
    return this.queue.list(query);
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
    @Body(new ZodValidationPipe(unmatchedNameBody))
    body: UnmatchedNameBody,
  ): Promise<void> {
    await this.queue.dismiss(body.normalizedName);
  }

  @Post('undismiss')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Admin only: put a dismissed name back in the open queue',
  })
  async undismiss(
    @Body(new ZodValidationPipe(unmatchedNameBody))
    body: UnmatchedNameBody,
  ): Promise<void> {
    await this.queue.undismiss(body.normalizedName);
  }
}
