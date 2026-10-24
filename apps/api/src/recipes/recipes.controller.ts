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
import { MemberLanguageService } from '../member-language/member-language.service';
import { guidanceBody, type GuidanceBody } from './recipe-guidance.schemas';
import { FamilyRecipesService } from './family-recipes.service';
import { CookTonightService } from './cook-tonight.service';
import { LinkRecipesService } from './link-recipes.service';
import { PlateRecipesService } from './plate-recipes.service';
import { RecipeBrowseService } from './recipe-browse.service';
import {
  browseQuery,
  cookTonightQuery,
  familyRecipeCreate,
  familyRecipeUpdate,
  fromLinkBody,
  fromPlateBody,
  plateMatchesBody,
  hiddenTipsBody,
  recipeParam,
  recipeTipParam,
  tipCreate,
  tipOrder,
  tipUpdate,
  type FamilyRecipeCreate,
  type FamilyRecipeDraft,
  type FamilyRecipeEdit,
  type FamilyRecipeUpdate,
  type FromLinkBody,
  type FromPlateBody,
  type RecipeFromLink,
  type PlateMatchesBody,
  type PlateMatches,
  type HiddenTipsBody,
  type TipCreate,
  type TipOrder,
  type TipUpdate,
  type BrowseQuery,
  type CookTonightQuery,
  type CookTonightView,
  type RecipeDetail,
  type RecipeFilters,
  type RecipeList,
} from './recipes.schemas';

const Id = () => Param(new ZodValidationPipe(recipeParam));
const TipParams = () => Param(new ZodValidationPipe(recipeTipParam));

@ApiTags('recipes')
@Controller('recipes')
@UseGuards(AuthGuard)
export class RecipesController {
  constructor(
    private readonly browse: RecipeBrowseService,
    private readonly family: FamilyRecipesService,
    private readonly cookTonight: CookTonightService,
    private readonly plate: PlateRecipesService,
    private readonly link: LinkRecipesService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Browse Recipes: Base Recipes with Variant counts, or matching Recipes and Variants when searching or filtering by Cuisine or Method',
  })
  async list(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(browseQuery)) query: BrowseQuery,
  ): Promise<RecipeList> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.browse.list(member.id, query, locale);
  }

  @Get('filters')
  @ApiOperation({
    summary:
      'Cuisines and Methods for the filter pickers, named in the Catalog Language',
  })
  async filters(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<RecipeFilters> {
    return this.browse.filters(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  // Declared before `:id` so it is not read as a Recipe id.
  @Get('cook-tonight')
  @ApiOperation({
    summary:
      'Recipes the Family Pantry can make, or is one line short of, one card per Base Recipe, best match first',
  })
  async cookTonightView(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(cookTonightQuery)) query: CookTonightQuery,
  ): Promise<CookTonightView> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.cookTonight.view(member.id, query, locale);
  }

  @Post()
  @ApiOperation({
    summary:
      "Create one of the Family's own Recipes: a Variant (parentId) or a standalone Base Recipe",
  })
  async create(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(familyRecipeCreate)) body: FamilyRecipeCreate,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.create(member.id, body, locale);
  }

  @Post('plate-matches')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'The Catalog Base Recipes closest to a Plate Scan dish, best first (at most five)',
  })
  async plateMatches(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(plateMatchesBody))
    body: PlateMatchesBody,
  ): Promise<PlateMatches> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.plate.closestBases(member.id, { ...body, locale });
  }

  @Post('from-plate')
  @ApiOperation({
    summary:
      'Save a Plate Scan as a Family Recipe for one serving: a Variant (parentId) or a standalone Recipe',
  })
  async saveFromPlate(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(fromPlateBody)) body: FromPlateBody,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.plate.save(member.id, { ...body, locale });
  }

  @Post('from-link')
  @HttpCode(200)
  @ApiOperation({
    summary:
      "Read the recipe on a web page into an unsaved Family Recipe draft in the Member's Catalog Language; nothing is saved",
  })
  async readLink(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(fromLinkBody)) body: FromLinkBody,
  ): Promise<RecipeFromLink> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.link.read(member.id, body, locale);
  }

  @Get(':id/variant-draft')
  @ApiOperation({
    summary:
      "An unsaved draft copying a visible Recipe's ingredients and Steps, under its Base Recipe",
  })
  async variantDraft(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
  ): Promise<FamilyRecipeDraft> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.variantDraft(member.id, id, locale);
  }

  @Get(':id/edit')
  @ApiOperation({ summary: "The editable view of the Family's own Recipe" })
  async edit(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.editFor(member.id, id, locale);
  }

  @Put(':id')
  @ApiOperation({ summary: "Replace the Family's own Recipe document" })
  async update(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(familyRecipeUpdate)) body: FamilyRecipeUpdate,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.update(member.id, id, { ...body, locale });
  }

  @Post(':id/archive')
  @HttpCode(200)
  @ApiOperation({
    summary: "Archive (the UI's Delete) the Family's own Recipe; never removed",
  })
  async archive(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.archive(member.id, id, locale);
  }

  @Put(':id/guidance')
  @ApiOperation({
    summary:
      "Replace the Family Recipe's guidance (Nutrition Note, Pairings, Eating Moments)",
  })
  async setGuidance(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(guidanceBody)) body: GuidanceBody,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.setGuidance(member.id, id, body, locale);
  }

  @Post(':id/tips')
  @ApiOperation({ summary: "Add a Tip to the Family's own Recipe or a Step" })
  async createTip(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(tipCreate)) body: TipCreate,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.createTip(member.id, id, body, locale);
  }

  @Put(':id/tips/order')
  @ApiOperation({ summary: 'Set the order of every Tip of the Recipe' })
  async reorderTips(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(tipOrder)) body: TipOrder,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.reorderTips(member.id, id, body, locale);
  }

  @Patch(':id/tips/:tipId')
  @ApiOperation({ summary: 'Edit a Tip of the Family Recipe' })
  async updateTip(
    @CurrentUser() member: CurrentUserValue,
    @TipParams() { id, tipId }: { id: string; tipId: string },
    @Body(new ZodValidationPipe(tipUpdate)) body: TipUpdate,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
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
  async setHiddenTips(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
    @Body(new ZodValidationPipe(hiddenTipsBody)) body: HiddenTipsBody,
  ): Promise<FamilyRecipeEdit> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.family.setHiddenTips(member.id, id, body, locale);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'A Recipe with its base or Variants and, for a Variant, the ingredient diff against its base',
  })
  async detail(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(recipeParam)) params: { id: string },
  ): Promise<RecipeDetail> {
    return this.browse.detail(
      member.id,
      params.id,
      await this.languages.catalogLanguageOf(member.id),
    );
  }
}
