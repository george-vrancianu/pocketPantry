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
import { MemberLanguageService } from '../member-language/member-language.service';
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
  constructor(
    private readonly finishShopping: FinishShoppingService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Propose a Batch for every checked Shopping Item, with Default Expiry and Location',
  })
  async propose(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(finishProposalQuery))
    { today }: FinishProposalQuery,
  ): Promise<FinishProposal> {
    return this.finishShopping.propose(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
      today,
    );
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
