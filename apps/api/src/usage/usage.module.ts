import { Module } from '@nestjs/common';
import { StructuredOutputAiService } from '../ai/structured-output-ai.service';
import { TranscriptionService } from '../voice/transcription.service';
import { MeteredAiService } from './metered-ai.service';
import { UsageRecordsService } from './usage-records.service';

/** The AI providers and the metering layer in front of them. */
@Module({
  providers: [
    StructuredOutputAiService,
    TranscriptionService,
    UsageRecordsService,
    MeteredAiService,
  ],
  exports: [TranscriptionService, UsageRecordsService, MeteredAiService],
})
export class UsageModule {}
