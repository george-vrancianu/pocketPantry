import { Module } from '@nestjs/common';
import { IngredientCatalogService } from './ingredient-catalog.service';

@Module({
  providers: [IngredientCatalogService],
  exports: [IngredientCatalogService],
})
export class IngredientCatalogModule {}
