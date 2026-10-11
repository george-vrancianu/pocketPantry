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
import { AdminRoleGuard } from '../auth/admin-role.guard';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { RecipeTipsService } from '../recipes/recipe-tips.service';
import { RecipeTranslationsService } from '../recipes/recipe-translations.service';
import { RecipesService } from '../recipes/recipes.service';
import {
  hiddenTipsBody,
  recipeDocument,
  recipeListQuery,
  recipeParam,
  recipeTipParam,
  tipCreate,
  tipOrder,
  tipUpdate,
  translationLocaleParam,
  translationsBody,
  variantCreate,
  type HiddenTipsBody,
  type RecipeDocument,
  type RecipeListQuery,
  type TipCreate,
  type TipOrder,
  type TipUpdate,
  type TranslationsBody,
  type VariantCreate,
} from '../recipes/recipes.schemas';

const Id = () => Param(new ZodValidationPipe(recipeParam));
const TipParams = () => Param(new ZodValidationPipe(recipeTipParam));
const LocaleParams = () => Param(new ZodValidationPipe(translationLocaleParam));

@ApiTags('admin')
@Controller('admin/recipes')
@UseGuards(AuthGuard, AdminRoleGuard)
export class AdminRecipesController {
  constructor(
    private readonly recipes: RecipesService,
    private readonly tips: RecipeTipsService,
    private readonly translations: RecipeTranslationsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Admin only: Catalog Recipes (flat, with parentId and archived); baseOnly + archived=exclude is the Variant picker',
  })
  list(@Query(new ZodValidationPipe(recipeListQuery)) query: RecipeListQuery) {
    return this.recipes.list(query);
  }

  @Post()
  @ApiOperation({ summary: 'Admin only: create a Base Recipe' })
  create(@Body(new ZodValidationPipe(recipeDocument)) body: RecipeDocument) {
    return this.recipes.create(body);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Admin only: a Recipe with its lines, Steps, Tips, translations and (Variants) the base Tips',
  })
  detail(@Id() { id }: { id: string }) {
    return this.recipes.detail(id);
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Admin only: replace the Recipe document, keeping the ids of lines and Steps that carry one',
  })
  update(
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(recipeDocument)) body: RecipeDocument,
  ) {
    return this.recipes.update(id, body);
  }

  @Post(':id/archive')
  @HttpCode(200)
  @ApiOperation({ summary: 'Admin only: archive a Recipe (never deleted)' })
  archive(@Id() { id }: { id: string }) {
    return this.recipes.archive(id);
  }

  @Post(':id/variants')
  @ApiOperation({
    summary: 'Admin only: make a Variant, a copy of a Base Recipe, as a draft',
  })
  createVariant(
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(variantCreate)) body: VariantCreate,
  ) {
    return this.recipes.createVariant(id, body);
  }

  @Post(':id/tips')
  @ApiOperation({ summary: 'Admin only: add a Tip to the Recipe or a Step' })
  createTip(
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(tipCreate)) body: TipCreate,
  ) {
    return this.tips.create(id, body);
  }

  @Put(':id/tips/order')
  @ApiOperation({ summary: 'Admin only: set the order of every Tip' })
  reorderTips(
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(tipOrder)) body: TipOrder,
  ) {
    return this.tips.reorder(id, body);
  }

  @Patch(':id/tips/:tipId')
  updateTip(
    @TipParams() { id, tipId }: { id: string; tipId: string },
    @Body(new ZodValidationPipe(tipUpdate)) body: TipUpdate,
  ) {
    return this.tips.update(id, tipId, body);
  }

  @Delete(':id/tips/:tipId')
  @HttpCode(204)
  async deleteTip(@TipParams() { id, tipId }: { id: string; tipId: string }) {
    await this.tips.delete(id, tipId);
  }

  @Put(':id/hidden-tips')
  @ApiOperation({
    summary:
      "Admin only: set which of the base's Recipe-level Tips a Variant hides",
  })
  setHiddenTips(
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(hiddenTipsBody)) body: HiddenTipsBody,
  ) {
    return this.tips.setHidden(id, body);
  }

  @Put(':id/translations/:locale')
  @ApiOperation({
    summary:
      "Admin only: set one locale's translations of the title, Steps, line notes and Tips (null deletes)",
  })
  setTranslations(
    @LocaleParams() { id, locale }: { id: string; locale: string },
    @Body(new ZodValidationPipe(translationsBody)) body: TranslationsBody,
  ) {
    return this.translations.set(id, locale, body);
  }
}
