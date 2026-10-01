import { Module } from '@nestjs/common';
import { FinishShoppingController } from './finish-shopping.controller';
import { FinishShoppingService } from './finish-shopping.service';
import { ShoppingController } from './shopping.controller';
import { ShoppingService } from './shopping.service';

@Module({
  controllers: [ShoppingController, FinishShoppingController],
  providers: [ShoppingService, FinishShoppingService],
})
export class ShoppingModule {}
