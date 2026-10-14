import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ingredientIdParam, type SuggestionsView } from './suggestions.schemas';
import {
  shoppingLocaleTodayQuery,
  type ShoppingLocaleTodayQuery,
} from './shopping.schemas';
import { SuggestionsService } from './suggestions.service';

/** Suggestions for the Family's Shopping List, derived on every read. */
@ApiTags('shopping-list')
@UseGuards(AuthGuard)
@Controller('shopping-list/suggestions')
export class SuggestionsController {
  constructor(private readonly suggestions: SuggestionsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List Suggestions: missing Staples, then Used Up Ingredients, then running low Ingredients, each in Aisle order, hidden while dismissed or on the list (running low: while flagged, with a Batch)',
  })
  list(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(shoppingLocaleTodayQuery))
    { locale, today }: ShoppingLocaleTodayQuery,
  ): Promise<SuggestionsView> {
    return this.suggestions.list(member.id, locale, today);
  }

  @Post(':ingredientId/dismiss')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Dismiss a Suggestion for the Family until a Batch of the Ingredient is created',
  })
  async dismiss(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(ingredientIdParam))
    { ingredientId }: { ingredientId: string },
  ): Promise<void> {
    await this.suggestions.dismiss(member.id, ingredientId);
  }
}
