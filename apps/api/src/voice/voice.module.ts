import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { IngredientCatalogModule } from '../ingredients/ingredient-catalog.module';
import { MemberLanguageModule } from '../member-language/member-language.module';
import { PantryModule } from '../pantry/pantry.module';
import { ScanModule } from '../scan/scan.module';
import { SettingsModule } from '../settings/settings.module';
import { ShoppingModule } from '../shopping/shopping.module';
import { TranscriptionService } from './transcription.service';
import { VoiceController } from './voice.controller';
import { VoiceHandlers } from './voice-handlers.registry';
import { VoiceReaderService } from './voice-reader.service';
import { VoiceService } from './voice.service';

@Module({
  imports: [
    ScanModule,
    CatalogModule,
    IngredientCatalogModule,
    SettingsModule,
    ShoppingModule,
    PantryModule,
    MemberLanguageModule,
  ],
  controllers: [VoiceController],
  providers: [
    TranscriptionService,
    VoiceHandlers,
    VoiceReaderService,
    VoiceService,
  ],
  exports: [VoiceService],
})
export class VoiceModule {}
