import { Module } from '@nestjs/common';
import { CatalogController } from './catalog.controller';
import { CatalogSearchService } from './catalog-search.service';

@Module({
  controllers: [CatalogController],
  providers: [CatalogSearchService],
  exports: [CatalogSearchService],
})
export class CatalogModule {}
