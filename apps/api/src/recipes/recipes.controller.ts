import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RecipeBrowseService } from './recipe-browse.service';
import {
  browseQuery,
  localeQuery,
  recipeParam,
  type BrowseQuery,
  type LocaleQuery,
  type RecipeDetail,
  type RecipeFilters,
  type RecipeListItem,
} from './recipes.schemas';

@ApiTags('recipes')
@Controller('recipes')
@UseGuards(AuthGuard)
export class RecipesController {
  constructor(private readonly browse: RecipeBrowseService) {}

  @Get()
  @ApiOperation({
    summary:
      'Browse Recipes: Base Recipes with Variant counts, or matching Recipes and Variants when searching or filtering by Cuisine or Method',
  })
  async list(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(browseQuery)) query: BrowseQuery,
  ): Promise<{ recipes: RecipeListItem[] }> {
    return { recipes: await this.browse.list(member.id, query) };
  }

  @Get('filters')
  @ApiOperation({
    summary: 'Cuisines and Methods for the filter pickers, named in the locale',
  })
  filters(
    @Query(new ZodValidationPipe(localeQuery))
    query: {
      locale: BrowseQuery['locale'];
    },
  ): Promise<RecipeFilters> {
    return this.browse.filters(query.locale);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'A Recipe with its base or Variants and, for a Variant, the ingredient diff against its base',
  })
  detail(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(recipeParam)) params: { id: string },
    @Query(new ZodValidationPipe(localeQuery))
    query: LocaleQuery,
  ): Promise<RecipeDetail> {
    return this.browse.detail(member.id, params.id, query.locale);
  }
}
