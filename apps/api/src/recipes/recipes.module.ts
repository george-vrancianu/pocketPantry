import { Module } from '@nestjs/common';
import { RecipeTipsService } from './recipe-tips.service';
import { RecipeTranslationsService } from './recipe-translations.service';
import { RecipesService } from './recipes.service';

@Module({
  providers: [RecipesService, RecipeTipsService, RecipeTranslationsService],
  exports: [RecipesService, RecipeTipsService, RecipeTranslationsService],
})
export class RecipesModule {}
