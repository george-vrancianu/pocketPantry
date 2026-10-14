import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { CatalogController } from './catalog.controller';
import { FamilyIngredientsService } from './family-ingredients.service';
import { CatalogSearchService } from './catalog-search.service';

@Module({
  imports: [SettingsModule],
  controllers: [CatalogController],
  providers: [CatalogSearchService, FamilyIngredientsService],
  exports: [CatalogSearchService],
})
export class CatalogModule {}
