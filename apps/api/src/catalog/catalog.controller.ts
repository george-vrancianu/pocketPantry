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
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { SettingsService } from '../settings/settings.service';
import { catalogScope, SHARED_ONLY, type CatalogScope } from './catalog-scope';
import { FamilyIngredientsService } from './family-ingredients.service';
import { FamilySynonymsService } from './family-synonyms.service';
import { CatalogSearchService } from './catalog-search.service';
import {
  catalogAislesQuery,
  catalogCategoriesQuery,
  familyIngredientBody,
  familyIngredientQuery,
  familySynonymBody,
  type FamilySynonymBody,
  type CatalogCategoriesQuery,
  type CatalogCategory,
  type FamilyIngredientBody,
  catalogParentsQuery,
  type CatalogAisle,
  type CatalogAislesQuery,
  catalogSearchQuery,
  type CatalogParent,
  type CatalogParentsQuery,
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
    private readonly settings: SettingsService,
  ) {}

  @Get('parents')
  @ApiOperation({
    summary:
      'List Parent Categories by name in the requested locale, for placing an Unmatched Batch',
  })
  async parents(
    @CurrentUser() member: CurrentUserValue,
    @Query(new ZodValidationPipe(catalogParentsQuery))
    query: CatalogParentsQuery,
  ): Promise<{ parents: CatalogParent[] }> {
    return {
      parents: await this.searchService.listParents(
        await this.settings.catalogScopeForMember(member.id),
        query.locale,
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
        query.locale,
      ),
    };
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Search Ingredients by name or Synonym in any locale, names returned in the requested locale',
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
        query.locale,
        query.limit,
        await this.settings.expiryOverridesForMember(member.id),
        {
          aisleId: query.aisleId,
          parentCategoryId: query.parentCategoryId,
        },
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
        query.locale,
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
    @Query(new ZodValidationPipe(familyIngredientQuery))
    query: { locale: 'en' | 'ro' | 'da' },
    @Body(new ZodValidationPipe(familyIngredientBody))
    body: FamilyIngredientBody,
  ): Promise<CatalogSearchResult> {
    return this.familyIngredients.create(
      {
        id: await this.settings.familyIdOf(member.id),
        memberId: member.id,
      },
      body,
      query.locale,
      await this.settings.expiryOverridesForMember(member.id),
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
    @Query(new ZodValidationPipe(familyIngredientQuery))
    query: { locale: 'en' | 'ro' | 'da' },
    @Body(new ZodValidationPipe(familySynonymBody))
    body: FamilySynonymBody,
  ): Promise<CatalogSearchResult> {
    return this.familySynonyms.create(
      { id: await this.settings.familyIdOf(member.id) },
      body,
      query.locale,
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
