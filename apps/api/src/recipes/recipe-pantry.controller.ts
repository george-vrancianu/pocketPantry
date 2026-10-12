import {
  Body,
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
import type {
  ShoppingListView,
  ShoppingLocaleQuery,
} from '../shopping/shopping.schemas';
import {
  addLineBody,
  addMissingBody,
  addToListQuery,
  pantryMatchQuery,
  recipeIdParam,
  type AddLineBody,
  type AddMissingBody,
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

  @Post(':id/add-missing')
  @HttpCode(200)
  @ApiOperation({
    summary:
      "Add the Recipe's short and missing lines to the Shopping List, with the Recipe as Source Recipe; returns the updated list",
  })
  addMissing(
    @CurrentUser() member: CurrentUserValue,
    @IdParam() { id }: { id: string },
    @Query(new ZodValidationPipe(addToListQuery))
    { locale }: ShoppingLocaleQuery,
    @Body(new ZodValidationPipe(addMissingBody)) body: AddMissingBody,
  ): Promise<ShoppingListView> {
    return this.pantry.addMissing(member.id, id, body, locale);
  }

  @Post(':id/add-line')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Add one line of the Recipe to the Shopping List (the shortfall if short, else the whole quantity), with the Recipe as Source Recipe; returns the updated list',
  })
  addLine(
    @CurrentUser() member: CurrentUserValue,
    @IdParam() { id }: { id: string },
    @Query(new ZodValidationPipe(addToListQuery))
    { locale }: ShoppingLocaleQuery,
    @Body(new ZodValidationPipe(addLineBody)) body: AddLineBody,
  ): Promise<ShoppingListView> {
    return this.pantry.addLine(member.id, id, body, locale);
  }
}
