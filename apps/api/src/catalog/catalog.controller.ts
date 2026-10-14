import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { SettingsService } from '../settings/settings.service';
import { catalogScope, SHARED_ONLY } from './catalog-scope';
import { CatalogSearchService } from './catalog-search.service';
import {
  catalogAislesQuery,
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
        query.scope === 'shared'
          ? catalogScope(SHARED_ONLY)
          : await this.settings.catalogScopeForMember(member.id),
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
        query.scope === 'shared'
          ? catalogScope(SHARED_ONLY)
          : await this.settings.catalogScopeForMember(member.id),
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
}
