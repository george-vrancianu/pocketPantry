import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { RecipesModule } from '../recipes/recipes.module';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { MemberLanguageModule } from '../member-language/member-language.module';
import { AdminRecipesController } from './admin-recipes.controller';
import { FamilyIngredientsAdminController } from './family-ingredients.controller';
import { FamilyIngredientsAdminService } from './family-ingredients.service';
import { FamilySynonymsAdminController } from './family-synonyms.controller';
import { FamilySynonymsAdminService } from './family-synonyms.service';
import { UnmatchedQueueController } from './unmatched-queue.controller';
import { UnmatchedQueueService } from './unmatched-queue.service';

@Module({
  imports: [
    RecipesModule,
    CatalogModule,
    IngredientCatalogModule,
    MemberLanguageModule,
  ],
  controllers: [
    AdminCatalogController,
    AdminRecipesController,
    UnmatchedQueueController,
    FamilyIngredientsAdminController,
    FamilySynonymsAdminController,
  ],
  providers: [
    AdminCatalogService,
    UnmatchedQueueService,
    FamilyIngredientsAdminService,
    FamilySynonymsAdminService,
  ],
})
export class AdminModule {}
