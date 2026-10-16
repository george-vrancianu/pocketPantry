import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { AuthGuard } from '../auth/auth.guard';
import type { CurrentUser as CurrentUserValue } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { ApiException } from '../common/api-exception';
import { toValidationIssues } from '../common/zod-validation.pipe';
import {
  supportedAudioType,
  voiceNoteFields,
  type VoiceNoteResponse,
} from './voice.schemas';
import { VoiceService } from './voice.service';

type Upload = {
  fields: Record<string, string>;
  audio?: { buffer: Buffer; mimeType: string };
};

async function readUpload(request: FastifyRequest): Promise<Upload> {
  if (!request.isMultipart()) {
    throw new ApiException(400, 'validation_failed', { issues: [] });
  }
  const upload: Upload = { fields: {} };
  try {
    for await (const part of request.parts()) {
      if (part.type === 'field') {
        if (typeof part.value === 'string')
          upload.fields[part.fieldname] = part.value;
      } else if (part.fieldname === 'audio' && !upload.audio) {
        upload.audio = {
          buffer: await part.toBuffer(),
          mimeType: part.mimetype,
        };
      } else {
        await part.toBuffer();
      }
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'FST_REQ_FILE_TOO_LARGE') {
      throw new ApiException(413, 'voice.too_long');
    }
    throw error;
  }
  return upload;
}

@ApiTags('voice')
@Controller('voice')
@UseGuards(AuthGuard)
export class VoiceController {
  constructor(private readonly voice: VoiceService) {}

  @Get('config')
  @ApiOperation({
    summary: 'Whether Voice Notes are available (transcription is configured).',
  })
  config(): { configured: boolean } {
    return { configured: this.voice.isConfigured() };
  }

  @Post('notes')
  @ApiOperation({
    summary:
      'Voice Note: transcribe a held-to-talk recording (multipart: audio, durationMs, scanLanguage, locale, defaultList, today). Neither the audio nor the transcript is stored.',
  })
  async note(
    @CurrentUser() member: CurrentUserValue,
    @Req() request: FastifyRequest,
  ): Promise<VoiceNoteResponse> {
    if (!this.voice.isConfigured()) {
      throw new ApiException(503, 'voice.not_configured');
    }
    const upload = await readUpload(request);
    const fields = voiceNoteFields.safeParse(upload.fields);
    if (!fields.success || !upload.audio) {
      throw new ApiException(400, 'validation_failed', {
        issues: fields.success ? [] : toValidationIssues(fields.error),
      });
    }
    const mimeType = supportedAudioType(upload.audio.mimeType);
    if (!mimeType) throw new ApiException(415, 'voice.unsupported_audio');
    return this.voice.read(member.id, {
      ...fields.data,
      audio: upload.audio.buffer,
      mimeType,
    });
  }
}
