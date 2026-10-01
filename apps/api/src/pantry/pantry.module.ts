import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { PantryController } from './pantry.controller';
import { PantryService } from './pantry.service';

@Module({
  imports: [SettingsModule],
  controllers: [PantryController],
  providers: [PantryService],
  exports: [PantryService],
})
export class PantryModule {}
