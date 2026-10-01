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
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  finishProposalQuery,
  finishShoppingBody,
  type FinishProposal,
  type FinishProposalQuery,
  type FinishResult,
  type FinishShoppingBody,
} from './finish-shopping.schemas';
import { FinishShoppingService } from './finish-shopping.service';

@ApiTags('shopping-list')
@UseGuards(AuthGuard)
@Controller('shopping-list/finish')
export class FinishShoppingController {
  constructor(private readonly finishShopping: FinishShoppingService) {}

  @Get()
  @ApiOperation({
    summary:
      'Propose a Batch for every checked Shopping Item, with Default Expiry and Location',
  })
  propose(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(finishProposalQuery))
    { locale, today }: FinishProposalQuery,
  ): Promise<FinishProposal> {
    return this.finishShopping.propose(member.id, locale, today);
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Finish Shopping: create the reviewed Batches, archive the list and start a new one, atomically',
  })
  finish(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(finishShoppingBody)) body: FinishShoppingBody,
  ): Promise<FinishResult> {
    return this.finishShopping.finish(member.id, body);
  }
}
