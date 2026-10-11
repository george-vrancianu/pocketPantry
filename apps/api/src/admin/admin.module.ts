import { Module } from '@nestjs/common';
import { PantryModule } from '../pantry/pantry.module';
import { RecipesModule } from '../recipes/recipes.module';
import { AdminCatalogController } from './admin-catalog.controller';
import { AdminCatalogService } from './admin-catalog.service';
import { AdminRecipesController } from './admin-recipes.controller';
import { UnmatchedQueueController } from './unmatched-queue.controller';
import { UnmatchedQueueService } from './unmatched-queue.service';

@Module({
  imports: [PantryModule, RecipesModule],
  controllers: [
    AdminCatalogController,
    AdminRecipesController,
    UnmatchedQueueController,
  ],
  providers: [AdminCatalogService, UnmatchedQueueService],
})
export class AdminModule {}
