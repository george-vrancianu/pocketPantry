import { Module } from '@nestjs/common';
import { ScanModule } from '../scan/scan.module';
import { TranscriptionService } from './transcription.service';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';

@Module({
  imports: [ScanModule],
  controllers: [VoiceController],
  providers: [TranscriptionService, VoiceService],
})
export class VoiceModule {}
