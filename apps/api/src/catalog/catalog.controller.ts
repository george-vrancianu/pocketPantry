import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { SettingsService } from '../settings/settings.service';
import { CatalogSearchService } from './catalog-search.service';
import {
  catalogSearchQuery,
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
        query.q,
        query.locale,
        query.limit,
        await this.settings.expiryOverridesOf(
          await this.settings.familyIdOf(member.id),
        ),
      ),
    };
  }
}
