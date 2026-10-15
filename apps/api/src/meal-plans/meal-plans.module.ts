import { Module } from '@nestjs/common';
import { ShoppingModule } from '../shopping/shopping.module';
import { SettingsModule } from '../settings/settings.module';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';

@Module({
  imports: [SettingsModule, ShoppingModule],
  controllers: [MealPlansController],
  providers: [MealPlansService],
})
export class MealPlansModule {}
