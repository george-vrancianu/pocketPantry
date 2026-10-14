import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { SettingsModule } from '../settings/settings.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { RecentlyStockedService } from './recently-stocked.service';
import { RunningLowService } from './running-low.service';

@Module({
  imports: [SettingsModule, CatalogModule],
  controllers: [PantryController],
  providers: [PantryService, RecentlyStockedService, RunningLowService],
  exports: [PantryService],
})
export class PantryModule {}
