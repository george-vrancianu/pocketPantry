import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { FamilyRecipesService } from './family-recipes.service';
import { ShoppingModule } from '../shopping/shopping.module';
import { PantryMatchingService } from './matching/pantry-matching.service';
import { CookTonightService } from './cook-tonight.service';
import { RecipeBrowseService } from './recipe-browse.service';
import { RecipeGuidanceService } from './recipe-guidance.service';
import { RecipePantryController } from './recipe-pantry.controller';
import { RecipePantryService } from './recipe-pantry.service';
import { RecipeTipsService } from './recipe-tips.service';
import { RecipeTranslationsService } from './recipe-translations.service';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [SettingsModule, ShoppingModule],
  controllers: [RecipesController, RecipePantryController],
  providers: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    RecipeGuidanceService,
    RecipeBrowseService,
    FamilyRecipesService,
    CookTonightService,
    PantryMatchingService,
    RecipePantryService,
  ],
  exports: [
    FamilyRecipesService,
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    PantryMatchingService,
    RecipeGuidanceService,
  ],
})
export class RecipesModule {}
