import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogSearchService } from './catalog-search.service';
import {
  catalogParentsQuery,
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
  constructor(private readonly searchService: CatalogSearchService) {}

  @Get('parents')
  @ApiOperation({
    summary:
      'List Parent Categories by name in the requested locale, for placing an Unmatched Batch',
  })
  async parents(
    @Query(new ZodValidationPipe(catalogParentsQuery))
    query: CatalogParentsQuery,
  ): Promise<{ parents: CatalogParent[] }> {
    return { parents: await this.searchService.listParents(query.locale) };
  }

  @Get('search')
  @ApiOperation({
    summary:
      'Search Ingredients by name or Synonym in any locale, names returned in the requested locale',
  })
  async search(
    @Query(new ZodValidationPipe(catalogSearchQuery))
    query: CatalogSearchQuery,
  ): Promise<{ results: CatalogSearchResult[] }> {
    return {
      results: await this.searchService.search(
        query.q,
        query.locale,
        query.limit,
      ),
    };
  }
}
