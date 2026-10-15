import { Module } from '@nestjs/common';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { SettingsModule } from '../settings/settings.module';
import { CatalogController } from './catalog.controller';
import { FamilyCatalogService } from './family-catalog.service';
import { FamilyIngredientsService } from './family-ingredients.service';
import { FamilySynonymsService } from './family-synonyms.service';
import { CatalogSearchService } from './catalog-search.service';

@Module({
  imports: [SettingsModule, IngredientCatalogModule],
  controllers: [CatalogController],
  providers: [
    CatalogSearchService,
    FamilyIngredientsService,
    FamilySynonymsService,
    FamilyCatalogService,
  ],
  exports: [CatalogSearchService],
})
export class CatalogModule {}
