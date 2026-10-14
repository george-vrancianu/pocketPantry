import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';
import { RunningLowService } from './running-low.service';

@Module({
  imports: [SettingsModule],
  controllers: [PantryController],
  providers: [PantryService, RunningLowService],
  exports: [PantryService],
})
export class PantryModule {}
