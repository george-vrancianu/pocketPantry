import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { CatalogController } from './catalog.controller';
import { CatalogSearchService } from './catalog-search.service';

@Module({
  imports: [SettingsModule],
  controllers: [CatalogController],
  providers: [CatalogSearchService],
  exports: [CatalogSearchService],
})
export class CatalogModule {}
