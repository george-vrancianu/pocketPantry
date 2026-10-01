import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { FinishShoppingController } from './finish-shopping.controller';
import { FinishShoppingService } from './finish-shopping.service';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';

@Module({
  imports: [SettingsModule],
  controllers: [ShoppingController, FinishShoppingController],
  providers: [ShoppingService, FinishShoppingService],
  exports: [ShoppingService],
})
export class ShoppingModule {}
