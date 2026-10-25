import { Module } from '@nestjs/common';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { PageFetchModule } from '../page-fetch/page-fetch.module';
import { ScanModule } from '../scan/scan.module';
import { MemberLanguageModule } from '../member-language/member-language.module';
import { SettingsModule } from '../settings/settings.module';
import { GuidanceSuggestionService } from './guidance-suggestion.service';
import { FamilyRecipesService } from './family-recipes.service';
import { ShoppingModule } from '../shopping/shopping.module';
import { PantryMatchingService } from './matching/pantry-matching.service';
import { LinkRecipesService } from './link-recipes.service';
import { PlateRecipesService } from './plate-recipes.service';
import { CookTonightService } from './cook-tonight.service';
import { RecipeCopyService } from './recipe-copy.service';
import { RecipeBrowseService } from './recipe-browse.service';
import { RecipeGuidanceService } from './recipe-guidance.service';
import { RecipePantryController } from './recipe-pantry.controller';
import { RecipePantryService } from './recipe-pantry.service';
import { RecipeTipsService } from './recipe-tips.service';
import { RecipeTranslationsService } from './recipe-translations.service';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [
    SettingsModule,
    ShoppingModule,
    MemberLanguageModule,
    IngredientCatalogModule,
    PageFetchModule,
    ScanModule,
  ],
  controllers: [RecipesController, RecipePantryController],
  providers: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    RecipeGuidanceService,
    RecipeBrowseService,
    FamilyRecipesService,
    RecipeCopyService,
    CookTonightService,
    PlateRecipesService,
    LinkRecipesService,
    GuidanceSuggestionService,
    PantryMatchingService,
    RecipePantryService,
  ],
  exports: [
    FamilyRecipesService,
    RecipeCopyService,
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    PantryMatchingService,
    RecipeGuidanceService,
    GuidanceSuggestionService,
  ],
})
export class RecipesModule {}
