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
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { guidanceBody, type GuidanceBody } from './recipe-guidance.schemas';
import { FamilyRecipesService } from './family-recipes.service';
import { CookTonightService } from './cook-tonight.service';
import { PlateRecipesService } from './plate-recipes.service';
import type { PlateMatch } from './plate-matches';
import { RecipeBrowseService } from './recipe-browse.service';
import {
  browseQuery,
  cookTonightQuery,
  familyRecipeCreate,
  familyRecipeUpdate,
  fromPlateBody,
  plateMatchesBody,
  hiddenTipsBody,
  localeQuery,
  recipeParam,
  recipeTipParam,
  tipCreate,
  tipOrder,
  tipUpdate,
  type FamilyRecipeCreate,
  type FamilyRecipeDraft,
  type FamilyRecipeEdit,
  type FamilyRecipeUpdate,
  type FromPlateBody,
  type PlateMatchesBody,
  type HiddenTipsBody,
  type TipCreate,
  type TipOrder,
  type TipUpdate,
  type BrowseQuery,
  type CookTonightQuery,
  type CookTonightView,
  type LocaleQuery,
  type RecipeDetail,
  type RecipeFilters,
  type RecipeListItem,
} from './recipes.schemas';

const Id = () => Param(new ZodValidationPipe(recipeParam));
const TipParams = () => Param(new ZodValidationPipe(recipeTipParam));
const Locale = () => Query(new ZodValidationPipe(localeQuery));

@ApiTags('recipes')
@Controller('recipes')
@UseGuards(AuthGuard)
export class RecipesController {
  constructor(
    private readonly browse: RecipeBrowseService,
    private readonly family: FamilyRecipesService,
    private readonly cookTonight: CookTonightService,
    private readonly plate: PlateRecipesService,
  ) {}

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
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(localeQuery))
    query: {
      locale: BrowseQuery['locale'];
    },
  ): Promise<RecipeFilters> {
    return this.browse.filters(member.id, query.locale);
  }

  // Declared before `:id` so it is not read as a Recipe id.
  @Get('cook-tonight')
  @ApiOperation({
    summary:
      'Recipes the Family Pantry can make, or is one line short of, one card per Base Recipe, best match first',
  })
  cookTonightView(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(cookTonightQuery)) query: CookTonightQuery,
  ): Promise<CookTonightView> {
    return this.cookTonight.view(member.id, query);
  }

  @Post()
  @ApiOperation({
    summary:
      "Create one of the Family's own Recipes: a Variant (parentId) or a standalone Base Recipe",
  })
  create(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(familyRecipeCreate)) body: FamilyRecipeCreate,
  ): Promise<FamilyRecipeEdit> {
    const { locale, ...document } = body;
    return this.family.create(member.id, document, locale);
  }

  @Post('plate-matches')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'The Catalog Base Recipes closest to a Plate Scan dish, best first (at most five)',
  })
  async plateMatches(
    @Body(new ZodValidationPipe(plateMatchesBody))
    body: PlateMatchesBody,
  ): Promise<{ matches: PlateMatch[] }> {
    return { matches: await this.plate.closestBases(body) };
  }

  @Post('from-plate')
  @ApiOperation({
    summary:
      'Save a Plate Scan as a Family Recipe for one serving: a Variant (parentId) or a standalone Recipe',
  })
  saveFromPlate(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(fromPlateBody)) body: FromPlateBody,
  ): Promise<FamilyRecipeEdit> {
    return this.plate.save(member.id, body);
  }

  @Get(':id/variant-draft')
  @ApiOperation({
    summary:
      "An unsaved draft copying a visible Recipe's ingredients and Steps, under its Base Recipe",
  })
  variantDraft(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeDraft> {
    return this.family.variantDraft(member.id, id, locale);
  }

  @Get(':id/edit')
  @ApiOperation({ summary: "The editable view of the Family's own Recipe" })
  edit(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.editFor(member.id, id, locale);
  }

  @Put(':id')
  @ApiOperation({ summary: "Replace the Family's own Recipe document" })
  update(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(familyRecipeUpdate)) body: FamilyRecipeUpdate,
  ): Promise<FamilyRecipeEdit> {
    return this.family.update(member.id, id, body);
  }

  @Post(':id/archive')
  @HttpCode(200)
  @ApiOperation({
    summary: "Archive (the UI's Delete) the Family's own Recipe; never removed",
  })
  archive(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.archive(member.id, id, locale);
  }

  @Put(':id/guidance')
  @ApiOperation({
    summary:
      "Replace the Family Recipe's guidance (Nutrition Note, Pairings, Eating Moments)",
  })
  setGuidance(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(guidanceBody)) body: GuidanceBody,
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.setGuidance(member.id, id, body, locale);
  }

  @Post(':id/tips')
  @ApiOperation({ summary: "Add a Tip to the Family's own Recipe or a Step" })
  createTip(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(tipCreate)) body: TipCreate,
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.createTip(member.id, id, body, locale);
  }

  @Put(':id/tips/order')
  @ApiOperation({ summary: 'Set the order of every Tip of the Recipe' })
  reorderTips(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(tipOrder)) body: TipOrder,
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.reorderTips(member.id, id, body, locale);
  }

  @Patch(':id/tips/:tipId')
  @ApiOperation({ summary: 'Edit a Tip of the Family Recipe' })
  updateTip(
    @CurrentUser() member: CurrentUserValue,
    @TipParams() { id, tipId }: { id: string; tipId: string },
    @Body(new ZodValidationPipe(tipUpdate)) body: TipUpdate,
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.updateTip(member.id, id, tipId, body, locale);
  }

  @Delete(':id/tips/:tipId')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a Tip of the Family Recipe' })
  async deleteTip(
    @CurrentUser() member: CurrentUserValue,
    @TipParams() { id, tipId }: { id: string; tipId: string },
  ): Promise<void> {
    await this.family.deleteTip(member.id, id, tipId);
  }

  @Put(':id/hidden-tips')
  @ApiOperation({
    summary: "Set which of the base's Recipe-level Tips this Variant hides",
  })
  setHiddenTips(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(hiddenTipsBody)) body: HiddenTipsBody,
    @Locale() { locale }: LocaleQuery,
  ): Promise<FamilyRecipeEdit> {
    return this.family.setHiddenTips(member.id, id, body, locale);
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
