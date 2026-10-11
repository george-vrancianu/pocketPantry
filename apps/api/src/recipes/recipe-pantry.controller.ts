import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import {
  pantryMatchQuery,
  recipeIdParam,
  type PantryMatchQuery,
  type PantryMatchView,
} from './recipe-pantry.schemas';
import { RecipePantryService } from './recipe-pantry.service';

const IdParam = () => Param(new ZodValidationPipe(recipeIdParam));

/** A Recipe against the signed-in Member's Family Pantry. Catalog Recipes and the Family's own only. */
@ApiTags('recipes')
@UseGuards(AuthGuard)
@Controller('recipes')
export class RecipePantryController {
  constructor(private readonly pantry: RecipePantryService) {}

  @Get(':id/pantry-match')
  @ApiOperation({
    summary:
      'Per-line Pantry status of a Recipe (covered, short, missing), scaled to the Servings asked for',
  })
  match(
    @CurrentUser() member: CurrentUserValue,
    @IdParam() { id }: { id: string },
    @Query(new ZodValidationPipe(pantryMatchQuery)) query: PantryMatchQuery,
  ): Promise<PantryMatchView> {
    return this.pantry.match(member.id, id, query);
  }
}
