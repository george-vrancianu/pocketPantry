import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Put,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { MemberLanguageService } from '../member-language/member-language.service';
import { SettingsService } from '../settings/settings.service';
import { catalogScope, SHARED_ONLY, type CatalogScope } from './catalog-scope';
import { FamilyIngredientsService } from './family-ingredients.service';
import { FamilyCatalogService } from './family-catalog.service';
import { FamilySynonymsService } from './family-synonyms.service';
import { popularToStartIds } from './popular-to-start';
import { CatalogSearchService } from './catalog-search.service';
import {
  catalogAislesQuery,
  familyIngredientPatchBody,
  familyIngredientAllergensBody,
  type CatalogAllergen,
  type FamilyIngredientAllergens,
  type FamilyIngredientAllergensBody,
  idParam,
  type FamilyCatalog,
  type FamilyIngredientPatchBody,
  type IdParam,
  catalogCategoriesQuery,
  familyIngredientBody,
  familySynonymBody,
  type FamilySynonymBody,
  type CatalogCategoriesQuery,
  type CatalogCategory,
  type FamilyIngredientBody,
  type CatalogAisle,
  type CatalogAislesQuery,
  catalogSearchQuery,
  popularToStartQuery,
  type PopularToStartQuery,
  type CatalogParent,
  type CatalogSearchQuery,
  type CatalogSearchResult,
} from './catalog.schemas';

@ApiTags('catalog')
@Controller('catalog')
@UseGuards(AuthGuard)
export class CatalogController {
  constructor(
    private readonly searchService: CatalogSearchService,
    private readonly familyIngredients: FamilyIngredientsService,
    private readonly familySynonyms: FamilySynonymsService,
    private readonly familyCatalog: FamilyCatalogService,
    private readonly settings: SettingsService,
    private readonly languages: MemberLanguageService,
  ) {}

  @Get('parents')
  @ApiOperation({
    summary:
      'List Parent Categories by name in the Catalog Language, for placing an Unmatched Batch',
  })
  async parents(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<{ parents: CatalogParent[] }> {
    return {
      parents: await this.searchService.listParents(
        await this.settings.catalogScopeForMember(member.id),
        await this.languages.catalogLanguageOf(member.id),
      ),
    };
  }

  @Get('aisles')
  @ApiOperation({
    summary:
      'List Aisles in shop order, each with its Parent Categories, for Browse by aisle',
  })
  async aisles(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(catalogAislesQuery))
    query: CatalogAislesQuery,
  ): Promise<{ aisles: CatalogAisle[] }> {
    return {
      aisles: await this.searchService.listAisles(
        await this.scopeFor(query, member.id),
        await this.languages.catalogLanguageOf(member.id),
      ),
    };
  }

  @Get('allergens')
  @ApiOperation({
    summary:
      'List the Allergens a Family Ingredient can be tagged with (retired ones left out), named in the Catalog Language',
  })
  async allergens(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<{ allergens: CatalogAllergen[] }> {
    return {
      allergens: await this.searchService.listAllergens(
        await this.settings.catalogScopeForMember(member.id),
        await this.languages.catalogLanguageOf(member.id),
      ),
    };
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Search Ingredients by name or Synonym in any language, names returned in the Catalog Language',
  })
  async search(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(catalogSearchQuery))
    query: CatalogSearchQuery,
  ): Promise<{ results: CatalogSearchResult[] }> {
    return {
      results: await this.searchService.search(
        await this.scopeFor(query, member.id),
        query.q,
        await this.languages.catalogLanguageOf(member.id),
        query.limit,
        await this.settings.expiryOverridesForMember(member.id),
        {
          aisleId: query.aisleId,
          parentCategoryId: query.parentCategoryId,
        },
      ),
    };
  }

  @Get('popular-to-start')
  @ApiOperation({
    summary:
      'The fixed Popular to start Ingredients for a UI locale, for a Family with nothing Recently Stocked',
  })
  async popularToStart(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(popularToStartQuery))
    query: PopularToStartQuery,
  ): Promise<{ ingredients: CatalogSearchResult[] }> {
    return {
      ingredients: await this.searchService.findByIds(
        await this.settings.catalogScopeForMember(member.id),
        popularToStartIds(query.locale),
        await this.languages.catalogLanguageOf(member.id),
        await this.settings.expiryOverridesForMember(member.id),
      ),
    };
  }

  @Get('categories')
  @ApiOperation({
    summary:
      'Search Leaf Categories (with Parent, Aisle and effective Default Expiry) to file a Family Ingredient under',
  })
  async categories(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(catalogCategoriesQuery))
    query: CatalogCategoriesQuery,
  ): Promise<{ categories: CatalogCategory[] }> {
    return {
      categories: await this.searchService.listCategories(
        await this.settings.catalogScopeForMember(member.id),
        query.q,
        await this.languages.catalogLanguageOf(member.id),
        query.limit,
        await this.settings.expiryOverridesForMember(member.id),
      ),
    };
  }

  @Post('family-ingredients')
  @HttpCode(201)
  @ApiOperation({
    summary:
      "Add an Ingredient only the caller's Family sees; 409 with the existing Ingredient when the name is taken",
  })
  async createFamilyIngredient(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(familyIngredientBody))
    body: FamilyIngredientBody,
  ): Promise<CatalogSearchResult> {
    return this.familyIngredients.create(
      {
        id: await this.settings.familyIdOf(member.id),
        memberId: member.id,
      },
      body,
      await this.languages.catalogLanguageOf(member.id),
      await this.settings.expiryOverridesForMember(member.id),
    );
  }

  @Get('family')
  @ApiOperation({
    summary:
      "List the caller's Family Ingredients (with what uses each) and Family Synonyms, for Family Settings",
  })
  async family(
    @CurrentUser() member: CurrentUserValue,
  ): Promise<FamilyCatalog> {
    return this.familyCatalog.list(
      await this.settings.familyIdOf(member.id),
      await this.languages.catalogLanguageOf(member.id),
      await this.settings.expiryOverridesForMember(member.id),
    );
  }

  @Patch('family-ingredients/:id')
  @ApiOperation({
    summary:
      'Rename and/or recategorise a Family Ingredient; 409 with the existing Ingredient when the new name is taken',
  })
  async updateFamilyIngredient(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(idParam)) params: IdParam,
    @Body(new ZodValidationPipe(familyIngredientPatchBody))
    body: FamilyIngredientPatchBody,
  ): Promise<CatalogSearchResult> {
    return this.familyCatalog.update(
      await this.settings.familyIdOf(member.id),
      params.id,
      body,
      await this.languages.catalogLanguageOf(member.id),
      await this.settings.expiryOverridesForMember(member.id),
    );
  }

  @Put('family-ingredients/:id/allergens')
  @ApiOperation({
    summary:
      "Replace the Allergens one of the caller's Family Ingredients contains (empty = none) and mark it checked; tags update every Recipe using it",
  })
  async setFamilyIngredientAllergens(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(idParam)) params: IdParam,
    @Body(new ZodValidationPipe(familyIngredientAllergensBody))
    body: FamilyIngredientAllergensBody,
  ): Promise<{ id: string } & FamilyIngredientAllergens> {
    return this.familyCatalog.setAllergens(
      await this.settings.familyIdOf(member.id),
      params.id,
      body.allergenIds,
    );
  }

  @Delete('family-ingredients/:id')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Delete a Family Ingredient; its Batches, Shopping Items, Template Lines and Recipe Lines become Unmatched',
  })
  async deleteFamilyIngredient(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(idParam)) params: IdParam,
  ): Promise<void> {
    await this.familyCatalog.remove(
      await this.settings.familyIdOf(member.id),
      params.id,
    );
  }

  @Delete('family-synonyms/:id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a Family Synonym; it stops matching at once',
  })
  async deleteFamilySynonym(
    @CurrentUser() member: CurrentUserValue,
    @Param(new ZodValidationPipe(idParam)) params: IdParam,
  ): Promise<void> {
    await this.familyCatalog.removeSynonym(
      await this.settings.familyIdOf(member.id),
      params.id,
    );
  }

  @Post('family-synonyms')
  @HttpCode(201)
  @ApiOperation({
    summary:
      "Declare a name another name for an Ingredient, for the caller's Family; 409 with the Ingredient that already has the name",
  })
  async createFamilySynonym(
    @CurrentUser() member: CurrentUserValue,
    @Body(new ZodValidationPipe(familySynonymBody))
    body: FamilySynonymBody,
  ): Promise<CatalogSearchResult> {
    return this.familySynonyms.create(
      { id: await this.settings.familyIdOf(member.id) },
      body,
      await this.languages.catalogLanguageOf(member.id),
      await this.settings.expiryOverridesForMember(member.id),
    );
  }

  /** The Catalog scope a request asks for: shared rows only, or the Member's Family. */
  private async scopeFor(
    query: { scope: 'family' | 'shared' },
    memberId: string,
  ): Promise<CatalogScope> {
    return query.scope === 'shared'
      ? catalogScope(SHARED_ONLY)
      : this.settings.catalogScopeForMember(memberId);
  }
}
