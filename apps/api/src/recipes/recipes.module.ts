import { Module } from '@nestjs/common';
import { RecipeGuidanceService } from './recipe-guidance.service';
import { RecipeTipsService } from './recipe-tips.service';
import { RecipeTranslationsService } from './recipe-translations.service';
import { RecipesService } from './recipes.service';

@Module({
  providers: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    RecipeGuidanceService,
  ],
  exports: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    RecipeGuidanceService,
  ],
})
export class RecipesModule {}
