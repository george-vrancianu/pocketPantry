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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { FamilyTagsService } from '../tags/family-tags.service';
import {
  renameTagBody,
  resolveTagBody,
  restoreTagBody,
  tagParam,
  type DeletedTag,
  type ManagedTag,
  type RenamedTag,
  type RenameTagBody,
  type ResolveTagBody,
  type RestoredTag,
  type RestoreTagBody,
} from '../tags/family-tags.schemas';
import { ManageFamilyTagsService } from '../tags/manage-family-tags.service';
import type { RecipeTag } from '../tags/recipe-tags';
import { MemberLanguageService } from '../member-language/member-language.service';
import { guidanceBody, type GuidanceBody } from './recipe-guidance.schemas';
import { FamilyRecipesService } from './family-recipes.service';
import { CookTonightService } from './cook-tonight.service';
import { GuidanceSuggestionService } from './guidance-suggestion.service';
import {
  suggestGuidanceBody,
  type GuidanceSuggestion,
  type SuggestGuidanceBody,
} from './guidance-suggestion.schemas';
import { LinkRecipesService } from './link-recipes.service';
import { PlateRecipesService } from './plate-recipes.service';
import { RecipeCopyService } from './recipe-copy.service';
import { RecipeBrowseService } from './recipe-browse.service';
import {
  browseQuery,
  cookTonightQuery,
  familyRecipeCreate,
  familyRecipeUpdate,
  fromLinkBody,
  plateMatchesBody,
  hiddenTipsBody,
  linkCheckQuery,
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
  type LinkCheck,
  type LinkCheckQuery,
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
  type FiltersQuery,
  filtersQuery,
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
    private readonly copyService: RecipeCopyService,
    private readonly cookTonight: CookTonightService,
    private readonly plate: PlateRecipesService,
    private readonly link: LinkRecipesService,
    private readonly guidanceSuggestion: GuidanceSuggestionService,
    private readonly languages: MemberLanguageService,
    private readonly familyTags: FamilyTagsService,
    private readonly manageTags: ManageFamilyTagsService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Browse Recipes: Base Recipes with Variant counts, or matching Recipes and Variants when searching or filtering by Tags',
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
      'The Tags in use (in `scope`) for the filter pickers, named in the Catalog Language',
  })
  async filters(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(filtersQuery)) query: FiltersQuery,
  ): Promise<RecipeFilters> {
    return this.browse.filters(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
      query.scope,
    );
  }

  // Declared before `:id` so it is not read as a Recipe id.
  @Get('tags')
  @ApiOperation({
    summary:
      'Every Tag the Member can put on a Recipe: Catalog Tags and the Family’s own, named in the Catalog Language',
  })
  async pickableTags(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<RecipeTag[]> {
    return this.browse.pickableTags(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
    );
  }

  @Post('tags')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Resolves a typed Tag name: the Catalog Tag it matches in any language, else the Family’s Tag, else a new Family Tag',
  })
  async resolveTag(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(resolveTagBody)) body: ResolveTagBody,
  ): Promise<RecipeTag> {
    return this.familyTags.resolveName(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
      body.name,
    );
  }

  // The `tags/...` routes are declared before `:id` so they are not read as a Recipe id.
  @Get('tags/family')
  @ApiOperation({
    summary:
      'The Family’s own Tags with how many of the Family’s Recipes carry each (Manage Tags)',
  })
  familyTagList(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<ManagedTag[]> {
    return this.manageTags.list(member.id);
  }

  @Post('tags/restore')
  @HttpCode(200)
  @ApiOperation({
    summary:
      'Undo a Family Tag delete: recreates the Tag and exactly the given links (Recipes gone meanwhile are skipped; if the name was taken, the links go to that Tag)',
  })
  async restoreFamilyTag(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(restoreTagBody)) body: RestoreTagBody,
  ): Promise<RestoredTag> {
    return this.manageTags.restore(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
      body,
    );
  }

  @Patch('tags/:id')
  @ApiOperation({
    summary:
      'Rename a Family Tag; 409 tags.name_taken when another Tag has the name, unless `merge` is true (links move to that Tag)',
  })
  async renameFamilyTag(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(tagParam)) params: { id: string },
    @Body(new ZodValidationPipe(renameTagBody)) body: RenameTagBody,
  ): Promise<RenamedTag> {
    return this.manageTags.rename(
      member.id,
      await this.languages.catalogLanguageOf(member.id),
      params.id,
      body.name,
      body.merge,
    );
  }

  @Delete('tags/:id')
  @ApiOperation({
    summary:
      'Delete a Family Tag from every Recipe; returns what Undo needs to restore it',
  })
  removeFamilyTag(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(tagParam)) params: { id: string },
  ): Promise<DeletedTag> {
    return this.manageTags.remove(member.id, params.id);
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

  @Post('from-link')
  @HttpCode(200)
  @ApiOperation({
    summary:
      "Read the recipe on a web page into an unsaved Family Recipe draft in the Member's Catalog Language; nothing is saved",
  })
  async readLink(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(fromLinkBody)) body: FromLinkBody,
    @Res({ passthrough: true }) reply: FastifyReply,
  ): Promise<RecipeFromLink> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    // A read lasts as long as its connection (ADR 0031): if the client goes before the answer is sent,
    // the page fetch and the AI call are aborted and no Recipe Draft is kept.
    const closed = new AbortController();
    const abandon = () => {
      if (!reply.raw.writableFinished) closed.abort();
    };
    reply.raw.once('close', abandon);
    try {
      return await this.link.read(member.id, body, locale, closed.signal);
    } finally {
      reply.raw.off('close', abandon);
    }
  }

  // Declared before `:id` so it is not read as a Recipe id.
  @Get('link-check')
  @ApiOperation({
    summary:
      'The live Family Recipe a link already is, or none. Read-only: never fetches the page, calls the AI or counts against the Link Cap',
  })
  linkCheck(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(linkCheckQuery)) query: LinkCheckQuery,
  ): Promise<LinkCheck> {
    return this.link.check(member.id, query.url);
  }

  @Post('suggest-guidance')
  @HttpCode(200)
  @ApiOperation({
    summary:
      "Propose Guidance for the empty fields of the Recipe page as it is now, in the Recipe's language; nothing is saved. Refused when no field it covers is empty",
  })
  async suggestGuidance(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(suggestGuidanceBody))
    body: SuggestGuidanceBody,
  ): Promise<GuidanceSuggestion> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.guidanceSuggestion.suggest(member.id, body, locale);
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

  @Post(':id/copy')
  @HttpCode(200)
  @ApiOperation({
    summary:
      "Add a Catalog Recipe to the Family: a frozen copy it owns; returns the Family's live copy if there is one",
  })
  async copy(
    @CurrentUser() member: CurrentUserValue,
    @Id() { id }: { id: string },
  ): Promise<{ id: string; created: boolean }> {
    const locale = await this.languages.catalogLanguageOf(member.id);
    return this.copyService.copy(member.id, id, locale);
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
