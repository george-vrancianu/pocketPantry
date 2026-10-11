import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { FinishShoppingController } from './finish-shopping.controller';
import { FinishShoppingService } from './finish-shopping.service';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';
import { ShoppingTemplatesController } from './shopping-templates.controller';
import { ShoppingTemplatesService } from './shopping-templates.service';

@Module({
  imports: [SettingsModule],
  controllers: [
    ShoppingController,
    FinishShoppingController,
    ShoppingTemplatesController,
  ],
  providers: [ShoppingService, FinishShoppingService, ShoppingTemplatesService],
  exports: [ShoppingService],
})
export class ShoppingModule {}
