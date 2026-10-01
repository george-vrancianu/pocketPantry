import { Module } from '@nestjs/common';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { IngredientUsage, NoIngredientUsage } from './ingredient-usage';

@Module({
  controllers: [AdminCatalogController],
  providers: [
    AdminCatalogService,
    { provide: IngredientUsage, useClass: NoIngredientUsage },
  ],
})
export class AdminModule {}
