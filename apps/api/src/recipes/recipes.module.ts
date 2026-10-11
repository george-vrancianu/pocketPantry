import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { RecipeBrowseService } from './recipe-browse.service';
import { RecipeTipsService } from './recipe-tips.service';
import { RecipeTranslationsService } from './recipe-translations.service';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [SettingsModule],
  controllers: [RecipesController],
  providers: [
    RecipesService,
    RecipeTipsService,
    RecipeTranslationsService,
    RecipeBrowseService,
  ],
  exports: [RecipesService, RecipeTipsService, RecipeTranslationsService],
})
export class RecipesModule {}
