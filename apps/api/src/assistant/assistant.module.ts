import { Module } from '@nestjs/common';
import { AssistantTokensModule } from '../assistant-tokens/assistant-tokens.module';
import { CatalogModule } from '../catalog/catalog.module';
import { ScanModule } from '../scan/scan.module';
import { SettingsModule } from '../settings/settings.module';
import { VoiceModule } from '../voice/voice.module';
import { AssistantTokenGuard } from './assistant-token.guard';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';

@Module({
  imports: [
    AssistantTokensModule,
    CatalogModule,
    ScanModule,
    SettingsModule,
    VoiceModule,
  ],
  controllers: [AssistantController],
  providers: [AssistantService, AssistantTokenGuard],
})
export class AssistantModule {}
