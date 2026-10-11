import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { FinishShoppingController } from './finish-shopping.controller';
import { FinishShoppingService } from './finish-shopping.service';
import { StaplesController } from './staples.controller';
import { StaplesService } from './staples.service';
import { SuggestionsController } from './suggestions.controller';
import { SuggestionsService } from './suggestions.service';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { ShoppingTemplatesController } from './shopping-templates.controller';
import { ShoppingTemplatesService } from './shopping-templates.service';

@Module({
  imports: [SettingsModule],
  controllers: [
    ShoppingController,
    FinishShoppingController,
    StaplesController,
    SuggestionsController,
    ShoppingTemplatesController,
  ],
  providers: [
    ShoppingService,
    FinishShoppingService,
    StaplesService,
    SuggestionsService,
    ShoppingTemplatesService,
  ],
  exports: [ShoppingService],
})
export class ShoppingModule {}
