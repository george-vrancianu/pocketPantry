import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { ShoppingModule } from '../shopping/shopping.module';
import { PantryMatchingService } from './matching/pantry-matching.service';
import { RecipePantryController } from './recipe-pantry.controller';
import { RecipePantryService } from './recipe-pantry.service';
import { RecipeTipsService } from './recipe-tips.service';
import { RecipeTranslationsService } from './recipe-translations.service';
import { RecipesService } from './recipes.service';

@Module({
  imports: [SettingsModule, ShoppingModule],
  controllers: [RecipePantryController],
  providers: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    PantryMatchingService,
    RecipePantryService,
  ],
  exports: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    PantryMatchingService,
  ],
})
export class RecipesModule {}
